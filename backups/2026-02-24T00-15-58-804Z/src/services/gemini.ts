import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment variables!");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export interface AnalysisResult {
    is_issue: boolean;
    confidence: number;
    category: string;
}

export const analyzeImage = async (imageBuffer: Buffer, description?: string): Promise<AnalysisResult> => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        let prompt = `Analyze if this image shows a city infrastructure issue like a pothole, broken street light, garbage, or damaged public property. 
    Answer in strictly JSON format: { "is_issue": boolean, "confidence": number, "category": string }. 
    If isn't an issue, set category to "none".`;

        if (description) {
            prompt += `\nThe user provided this description of the issue: "${description}". Take this into account.`;
        }

        const imagePart = {
            inlineData: {
                data: imageBuffer.toString("base64"),
                mimeType: "image/jpeg",
            },
        };

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // Clean up potential markdown code blocks
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanedText) as AnalysisResult;

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return { is_issue: false, confidence: 0, category: "error" };
    }
};
