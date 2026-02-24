import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
import { z } from "zod";

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

const analysisSchema = z.object({
    is_issue: z.boolean(),
    confidence: z.number().min(0).max(1),
    category: z.string()
});

const tryExtractJson = (text: string): string => {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const match = cleaned.match(/\{[\s\S]*\}/);
    return match ? match[0] : cleaned;
};

export const analyzeImage = async (imageBuffer: Buffer, description?: string): Promise<AnalysisResult> => {
    try {
        if (!apiKey) {
            return { is_issue: false, confidence: 0, category: "missing_api_key" };
        }

        const preferredModel = process.env.GEMINI_MODEL || "gemini-1.5-flash";
        const fallbackModels = [
            preferredModel,
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash",
            "gemini-2.0-flash",
            "gemini-1.5-pro"
        ];

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

        let text = "";
        let lastError: unknown = null;

        for (const modelName of fallbackModels) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                text = response.text();
                if (text) break;
            } catch (err) {
                lastError = err;
                continue;
            }
        }

        if (!text) {
            console.error("Gemini Analysis Error (all models failed):", lastError);
            return { is_issue: false, confidence: 0, category: "error" };
        }
        const extracted = tryExtractJson(text);
        const parsed = JSON.parse(extracted);
        const validated = analysisSchema.safeParse(parsed);

        if (!validated.success) {
            console.warn("Gemini Analysis Validation Failed:", validated.error.flatten());
            return { is_issue: false, confidence: 0, category: "invalid_ai_response" };
        }

        return validated.data as AnalysisResult;

    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return { is_issue: false, confidence: 0, category: "error" };
    }
};
