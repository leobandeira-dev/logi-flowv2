import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import pdf from 'npm:pdf-parse@1.1.1';
import { Buffer } from "node:buffer";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // Verificar autenticação
        const user = await base44.auth.me();
        if (!user) {
             return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { file_url, json_schema } = await req.json();

        if (!file_url) return Response.json({ error: "No file_url provided" }, { status: 400 });

        console.log("Downloading PDF...", file_url);
        const fileRes = await fetch(file_url);
        if (!fileRes.ok) throw new Error("Failed to fetch file");
        
        const arrayBuffer = await fileRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log("Extracting text...");
        let pdfText = "";
        try {
            const data = await pdf(buffer);
            pdfText = data.text;
        } catch (e) {
            console.error("PDF parse error:", e);
            // Retornar erro específico para acionar fallback
            return Response.json({ error: "PDF_PARSE_ERROR", details: e.message }, { status: 422 });
        }

        // Limpar texto
        pdfText = pdfText ? pdfText.trim() : "";
        
        // Se o texto for muito curto, provavelmente é um PDF escaneado (imagem)
        // Retornar 422 para que o frontend use o fallback de visão
        if (pdfText.length < 50) {
             return Response.json({ error: "SCANNED_PDF", details: "Not enough text extracted" }, { status: 422 });
        }

        console.log("Invoking LLM with text length:", pdfText.length);
        
        const prompt = `
        Você é um assistente especializado em extração de dados de documentos logísticos (Ordens de Carregamento, Notas Fiscais, Conhecimentos).
        
        Analise o TEXTO DO PDF extraído abaixo e extraia os dados estruturados estritamente conforme o esquema JSON fornecido.
        
        Diretrizes:
        1. Se um campo não for encontrado no texto, deixe-o como null ou string vazia.
        2. Tente inferir campos compostos (ex: separar Cidade/UF).
        3. Para datas, padronize se possível.
        4. Para valores monetários e pesos, extraia apenas os números (ou números com separadores padrão).
        
        TEXTO DO PDF:
        ---------------------------------------------------
        ${pdfText.substring(0, 60000)}
        ---------------------------------------------------
        `;

        const extraction = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: json_schema
        });

        return Response.json({ output: extraction });

    } catch (error) {
        console.error("Function error:", error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});