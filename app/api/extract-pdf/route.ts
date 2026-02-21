import { NextResponse } from "next/server";
import PDFParser from "pdf2json";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return new Promise((resolve) => {
            // @ts-ignore - The types for pdf2json are slightly outdated
            const pdfParser = new PDFParser(null, 1); // 1 = text parsing mode

            pdfParser.on("pdfParser_dataError", (errData: any) => {
                console.error("PDF Parsing Error:", errData.parserError || errData);
                resolve(NextResponse.json({ error: "Failed to parse PDF" }, { status: 500 }));
            });

            pdfParser.on("pdfParser_dataReady", pdfData => {
                // The text comes back as a giant string with specific formatting from pdf2json
                const rawText = pdfParser.getRawTextContent();

                // Clean up the text: pdf2json separates lines with \r\n and paragraphs by -------------Page (0)---------------
                const paragraphs = rawText
                    .replace(/-+Page \(\d+\) Break-+/g, '') // remove page dividers with Break
                    .replace(/-+Page \(\d+\)-+/g, '') // remove page dividers without Break
                    .split(/\r\n\r\n|\n\n/) // split on double newlines
                    .map(p => p.replace(/\r\n|\n/g, ' ').trim()) // join single line breaks inside paragraphs
                    .filter(p => p.length > 20); // filter noise

                resolve(NextResponse.json({ paragraphs }));
            });

            pdfParser.parseBuffer(buffer);
        });

    } catch (error) {
        console.error("PDF extraction error:", error);
        return NextResponse.json(
            { error: "Failed to extract text from PDF" },
            { status: 500 }
        );
    }
}
