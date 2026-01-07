import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import pdf from 'npm:pdf-parse@1.1.1';
import { Buffer } from "node:buffer";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // Autenticação rápida
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { file_url, json_schema } = await req.json();
        if (!file_url) return Response.json({ error: "No file_url" }, { status: 400 });

        // Download otimizado
        const fileRes = await fetch(file_url);
        if (!fileRes.ok) throw new Error("Fetch failed");
        
        const arrayBuffer = await fileRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse do PDF
        let pdfText = "";
        try {
            const data = await pdf(buffer);
            pdfText = data.text;
        } catch (e) {
            return Response.json({ error: "PDF_PARSE_ERROR" }, { status: 422 });
        }

        pdfText = pdfText ? pdfText.trim() : "";
        
        // Validação fail-fast para PDFs escaneados
        if (pdfText.length < 50) {
             return Response.json({ error: "SCANNED_PDF" }, { status: 422 });
        }

        // Prompt OTIMIZADO e texto LIMITADO para velocidade máxima
        // Limitando a 15000 chars (aprox 3-4k tokens) para resposta rápida
        const prompt = `
        Extraia dados deste documento logístico para JSON.
        
        Documento:
        ---
        ${pdfText.substring(0, 15000)}
        ---
        `;

        // Chamada LLM
        const extraction = await base44.integrations.Core.InvokeLLM({
            prompt: prompt,
            response_json_schema: json_schema
        });

        return Response.json({ output: extraction });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});