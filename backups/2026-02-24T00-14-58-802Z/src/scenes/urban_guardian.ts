import { Scenes, Markup } from "telegraf";
import { BotContext } from "../middleware/auth";
import { analyzeImage } from "../services/gemini";
import prisma from "../services/prisma";
import axios from "axios";
import { awardDignity } from "../services/reputation";
import { cityHallBot } from "../city_hall_bot";
import { mainMenu } from "../keyboards";
import { recordActivity } from "../services/life_recorder";

export const urbanGuardianScene = new Scenes.WizardScene<BotContext>(
    "urban_guardian",
    // Step 1: Ask for Photo
    async (ctx) => {
        await ctx.reply("📸 Sende ein Foto des Infrastrukturproblems (Schlagloch, Müll, defekte Laterne usw.).");
        return ctx.wizard.next();
    },
    // Step 2: Receive Photo (or Text Override)
    async (ctx) => {
        // @ts-ignore
        const message = ctx.message;
        if (!message) return; // Should not happen in wizard

        let buffer: Buffer;
        let description: string | undefined = undefined;

        // Type guards
        // @ts-ignore
        const hasPhoto = message.photo && message.photo.length > 0;
        // @ts-ignore
        const hasText = message.text && message.text.length > 0;

        if (hasPhoto) {
            // New Photo Flow
            // @ts-ignore
            const photo = message.photo.pop();
            try {
                const fileLink = await ctx.telegram.getFileLink(photo.file_id);
                const response = await axios.get(fileLink.href, { responseType: "arraybuffer" });
                buffer = Buffer.from(response.data, "binary");

                // Cache in session
                // @ts-ignore
                if (!ctx.session.reportData) ctx.session.reportData = {};
                // @ts-ignore
                ctx.session.reportData.photoId = photo.file_id;
                // @ts-ignore
                ctx.session.reportData.lastImageBase64 = buffer.toString("base64");

            } catch (e) {
                console.error(e);
                await ctx.reply("❌ Fehler beim Hochladen des Fotos.");
                return;
            }

            // --- GEMINI ANALYSIS START ---
            await ctx.reply("🔍 Analysiere...");

            try {
                const analysis = await analyzeImage(buffer);
                console.log("Analysis:", analysis);

                if (analysis.is_issue) {
                    // Success
                    // @ts-ignore
                    ctx.session.reportData.aiVerdict = JSON.stringify(analysis);
                    // @ts-ignore
                    ctx.session.reportData.category = analysis.category; // Gemini suggested category

                    await ctx.reply(`✅ Problem erkannt: ${analysis.category} (Sicherheit: ${(analysis.confidence * 100).toFixed(1)}%)\n\nDu kannst die Kategorie bestätigen oder eine andere wählen:`,
                        Markup.inlineKeyboard([
                            [Markup.button.callback("🛣️ Straßen", "cat_Roads"), Markup.button.callback("💡 Beleuchtung", "cat_Lighting")],
                            [Markup.button.callback("🗑️ Müll", "cat_Waste"), Markup.button.callback("🌳 Parks", "cat_Parks")],
                            [Markup.button.callback("🎨 Vandalismus", "cat_Vandalism"), Markup.button.callback("🚰 Wasser", "cat_Water")],
                            [Markup.button.callback("🚗 Fahrzeuge", "cat_Vehicles"), Markup.button.callback("❓ Sonstiges", "cat_Other")]
                        ])
                    );
                    return ctx.wizard.next();
                } else {
                    // Failure / Unsure
                    await ctx.reply(`🤔 Gemini ist unsicher (${analysis.category}).\n\nBitte Kategorie manuell wählen:`,
                        Markup.inlineKeyboard([
                            [Markup.button.callback("🛣️ Straßen", "cat_Roads"), Markup.button.callback("💡 Beleuchtung", "cat_Lighting")],
                            [Markup.button.callback("🗑️ Müll", "cat_Waste"), Markup.button.callback("🌳 Parks", "cat_Parks")],
                            [Markup.button.callback("🎨 Vandalismus", "cat_Vandalism"), Markup.button.callback("🚰 Wasser", "cat_Water")],
                            [Markup.button.callback("🚗 Fahrzeuge", "cat_Vehicles"), Markup.button.callback("❓ Sonstiges", "cat_Other")]
                        ])
                    );
                    return ctx.wizard.next();
                }

            } catch (e) {
                console.error(e);
                await ctx.reply("❌ Bei der Analyse ist ein Fehler aufgetreten.");
                return ctx.scene.leave();
            }
            // --- GEMINI ANALYSIS END ---

        } else if (hasText) {
            // Description Flow (Manual Override)
            // @ts-ignore
            if (ctx.session.reportData?.lastImageBase64) {
                // @ts-ignore
                const userDescription = message.text;
                // @ts-ignore
                ctx.session.reportData.description = userDescription;
                // Override Verdict
                // @ts-ignore
                ctx.session.reportData.aiVerdict = JSON.stringify({ is_issue: true, confidence: 1, category: "manual_override" });

                await ctx.reply(`✍️ Beschreibung erhalten. Bitte Kategorie wählen:`,
                    Markup.inlineKeyboard([
                        [Markup.button.callback("🛣️ Straßen", "cat_Roads"), Markup.button.callback("💡 Beleuchtung", "cat_Lighting")],
                        [Markup.button.callback("🗑️ Müll", "cat_Waste"), Markup.button.callback("🌳 Parks", "cat_Parks")],
                        [Markup.button.callback("🎨 Vandalismus", "cat_Vandalism"), Markup.button.callback("🚰 Wasser", "cat_Water")],
                        [Markup.button.callback("🚗 Fahrzeuge", "cat_Vehicles"), Markup.button.callback("❓ Sonstiges", "cat_Other")]
                    ])
                );
                return ctx.wizard.next();
            } else {
                await ctx.reply("📸 Bitte zuerst ein Foto senden.");
                return;
            }
        } else {
            await ctx.reply("Bitte sende ein Foto oder Text.");
            return;
        }
    },
    // Step 3: Handle Category Selection
    async (ctx) => {
        // @ts-ignore
        const callbackData = ctx.callbackQuery?.data;
        if (!callbackData || !callbackData.startsWith("cat_")) {
            await ctx.reply("Bitte wähle eine Kategorie, indem du auf die Taste klickst.");
            return;
        }

        const category = callbackData.replace("cat_", "");
        // @ts-ignore
        ctx.session.reportData.category = category;

        await ctx.answerCbQuery(`Ausgewählt: ${category}`);
        await ctx.reply(`📍 Bestätigt: ${category}.\n\nJetzt sende deinen Standort (Büroklammer -> Standort).`);
        return ctx.wizard.next();
    },
    // Step 4: Location (Reached after Category Selection)
    async (ctx) => {
        // @ts-ignore
        if (!ctx.message?.location) {
            await ctx.reply("Bitte sende deinen Standort (Büroklammer -> Standort).");
            return;
        }

        // @ts-ignore
        const location = ctx.message.location;

        // Save report
        if (ctx.user && ctx.session.reportData) {
            const report = await prisma.report.create({
                data: {
                    authorId: ctx.user.id,
                    photoId: ctx.session.reportData.photoId,
                    aiVerdict: ctx.session.reportData.aiVerdict,
                    category: ctx.session.reportData.category,
                    // @ts-ignore
                    description: ctx.session.reportData.description || null,
                    latitude: location.latitude,
                    longitude: location.longitude,
                } as any
            });

            // Log Activity
            await recordActivity(ctx.user.id, "REPORT_SUBMITTED", { reportId: report.id, category: (report as any).category });

            // Update user's updatedAt to pull them to the top of the admin's 'Recent' list
            await prisma.user.update({
                where: { id: ctx.user.id },
                data: { updatedAt: new Date() }
            });

            await awardDignity(ctx.user.id, 2);

            // User UX Reply
            let nextSteps = "";
            let keyboard = undefined;

            if (ctx.session.activeQuest) {
                // Redirect user to Maps for their delivery
                // Just mock link to Würzburg center or user's last known loc
                nextSteps = "🎒 Lieferung läuft weiter! Kehre zur Route zurück.";
                // Could verify against delivery address but for MVP generic
                keyboard = Markup.inlineKeyboard([
                    Markup.button.url("🗺️ Zur Route (Google Maps)", "https://www.google.com/maps"),
                    Markup.button.callback("📜 Quest-Menü", "exit_to_menu") // Should be handled or just text
                ]);
            } else {
                nextSteps = "Du bist frei! Einen schönen Tag und danke für deine Hilfe für die Stadt! 🏙️";
                keyboard = mainMenu;
            }

            await ctx.reply(`✅ Danke! Dein Bericht wurde angenommen.\n\nWenn das Rathaus das Problem bestätigt, wird dein Rating verdoppelt (+5 Punkte)!\n\n${nextSteps}`, keyboard);

            // SEND TO CITY HALL BOT
            if (cityHallBot) {
                const adminChatId = process.env.ADMIN_CHAT_ID;
                if (adminChatId && adminChatId !== "0") {
                    const isLowPriority = ctx.user?.urbanBanExpiresAt && new Date(ctx.user.urbanBanExpiresAt) > new Date();
                    const priorityZone = isLowPriority ? "🔴 KATEGORIE B (Niedrigere Priorität - Fehler)" : "🟢 KATEGORIE A (Hohe Priorität)";

                    const categoryEmojiMap: Record<string, string> = {
                        "Roads": "🛣️", "Lighting": "💡", "Waste": "🗑️", "Parks": "🌳",
                        "Vandalism": "🎨", "Water": "🚰", "Vehicles": "🚗", "Other": "❓"
                    };
                    const emoji = categoryEmojiMap[(report as any).category || ""] || "📋";

                    const caption = `🏛️ NEUER BERICHT (ID: ${report.id.slice(0, 4)})\n\n${priorityZone}\n\n👤 Autor ID: ${ctx.user?.id.slice(0, 8)}\n📂 Kategorie: ${emoji} ${(report as any).category}\n📝 Beschreibung: ${report.description || "—"}\n📍 Standort: ${location.latitude}, ${location.longitude}`;

                    // Convert base64 back to buffer for City Hall Bot (different bots can't share file IDs)
                    const imageBuffer = Buffer.from(ctx.session.reportData.lastImageBase64 || "", "base64");

                    await cityHallBot.telegram.sendPhoto(adminChatId, { source: imageBuffer }, {
                        caption: caption,
                        ...Markup.inlineKeyboard([
                            [Markup.button.callback("✅ Bestätigen (Wahr)", `approve_report_${report.id}`), Markup.button.callback("❌ Fake (Falsch)", `reject_report_${report.id}`)],
                            [Markup.button.callback("👤 Autor verwalten", `manage_user_${report.authorId}`)]
                        ])
                    });
                } else {
                    console.log("Admin Chat ID not set. Report saved but not sent to City Hall.");
                }
            }
        }

        return ctx.scene.leave();
    }
);
