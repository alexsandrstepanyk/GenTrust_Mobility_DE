import prisma from './prisma';
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const recordActivity = async (userId: string, type: string, metadata?: any) => {
    try {
        await (prisma as any).activityRecord.create({
            data: {
                userId,
                type,
                metadata: metadata ? JSON.stringify(metadata) : null
            }
        });
    } catch (e) {
        console.error("[LifeRecorder] Error recording activity:", e);
    }
};

export const generateBioReport = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            reports: true,
            quests: true,
            activities: true
        } as any
    });

    if (!user) throw new Error("User not found");

    const stats = {
        totalReports: (user as any).reports.length,
        approvedReports: (user as any).reports.filter((r: any) => r.status === 'APPROVED').length,
        totalQuests: (user as any).quests.length,
        completedQuests: (user as any).quests.filter((q: any) => q.status === 'COMPLETED').length,
        activityCount: (user as any).activities.length,
                age: user.birthDate ? calculateAge(user.birthDate) : "Unbekannt"
    };

    const prompt = `
        Du bist ein professioneller HR-Analyst und Psychologe des GenTrust-Systems. Deine Aufgabe ist es,
        den „digitalen Fußabdruck“ eines Scouts zu analysieren und eine Lebenscharakteristik für das
        Verantwortungszertifikat zu erstellen.

        SCOUT-DATEN:
        - Name: ${user.firstName} ${user.lastName}
        - Stadt: ${(user as any).city}
        - Problemmeldungen: ${stats.totalReports} (${stats.approvedReports} genehmigt)
        - Quests erledigt: ${stats.completedQuests} von ${stats.totalQuests}
        - Gesamtanzahl Aktivitäten: ${stats.activityCount}
    
        AKTIONSVERLAUF (letzte Logs):
        ${(user as any).activities.slice(-20).map((a: any) => `- ${a.createdAt.toISOString()}: ${a.type}`).join('\n')}

        SCHREIBE:
        1. Eine detaillierte Charakteristik (3–4 Absätze). Beurteile Verantwortung, Stabilität (ob er/sie verschwand),
             soziale Aktivität.
        2. Vergib eine Note auf der Skala A+, A, B, C, D.
        3. Bewerte Responsibility und Stability auf einer Skala von 0–100.

        Die Antwort muss auf Deutsch sein und im JSON-Format erfolgen:
        {
            "content": "Charakteristiktext",
            "rating": "Bewertung",
            "responsibility": Zahl,
            "stability": Zahl
        }
    `;

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().replace(/```json/g, "").replace(/```/g, "").trim();
        const json = JSON.parse(responseText);

        return await (prisma as any).bioReport.create({
            data: {
                userId,
                content: json.content,
                rating: json.rating,
                responsibility: json.responsibility,
                stability: json.stability
            }
        });
    } catch (e) {
        console.error("[LifeRecorder] AI Generation failed:", e);
        throw e;
    }
};

function calculateAge(birthDate: string): number {
    const parts = birthDate.split('.');
    const birth = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    const diff = Date.now() - birth.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
}
