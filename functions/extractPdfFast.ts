import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import pdf from 'npm:pdf-parse@1.1.1';
import { Buffer } from "node:buffer";

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        // Auth check - fast
        const user = await base44.auth.me();
        if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

        const { file_url, json_schema } = await req.json();

        // 1. Download file (Optimized)
        const fileRes = await fetch(file_url);
        const arrayBuffer = await fileRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 2. Extract Text
        let text = "";
        try {
            const data = await pdf(buffer);
            text = data.text;
        } catch (e) {
            return Response.json({ status: "error", code: "PARSE_ERROR" });
        }

        // 3. Check if Scanned
        if (!text || text.trim().length < 50) {
            return Response.json({ status: "scanned" }); // Tell frontend to use vision
        }

        // 4. Fast LLM Extraction
        // Truncate text to avoid token limits and speed up processing
        const truncatedText = text.substring(0, 20000); 

        const extraction = await base44.integrations.Core.InvokeLLM({
            prompt: `Extraia os dados deste documento de transporte para JSON. Retorne APENAS o JSON.
            
            Texto do Documento:
            ${truncatedText}`,
            response_json_schema: json_schema
        });

        return Response.json({ status: "success", output: extraction });

    } catch (error) {
        return Response.json({ error: error.message }, { status: 500 });
    }
});