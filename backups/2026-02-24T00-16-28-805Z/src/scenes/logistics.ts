import { Scenes, Markup } from "telegraf";
import { BotContext } from "../middleware/auth";
import prisma from "../services/prisma";
import { awardDignity } from "../services/reputation";
import { mainMenu } from "../keyboards";
import { recordActivity } from "../services/life_recorder";

export const logisticsScene = new Scenes.BaseScene<BotContext>("logistics");

// Utility to generate random 4-digit code
const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

logisticsScene.enter(async (ctx) => {
    // Check if already has quest
    if (ctx.session.activeQuest) {
        await ctx.reply(`📦 Du hast bereits eine aktive Bestellung!\n\n📌 **${ctx.session.activeQuest.title || 'Lieferung'}**\n🔑 Dein Abholcode: *${ctx.session.activeQuest.pickupCode}*\n\nGib den Code vom Kunden ein, um abzuschließen:`, { parse_mode: "Markdown" });
        return;
    }

    // Fetch real quests
    const quests = await (prisma as any).quest.findMany({
        where: {
            status: "OPEN",
            city: ctx.user?.city || undefined
        },
        take: 5
    });

    if (quests.length === 0) {
        await ctx.reply("📭 Leider gibt es in deiner Stadt aktuell keine freien Bestellungen. Schau später vorbei!", mainMenu);
        return ctx.scene.leave();
    }

    const buttons = quests.map((q: any) => [
        Markup.button.callback(`📦 ${q.title || 'Lieferung'} (${q.reward}€)`, `take_real_quest_${q.id}`)
    ]);
    buttons.push([Markup.button.callback("🚪 Zurück", "exit_logistics")]);

    await ctx.reply(
        `📦 Verfügbare Bestellungen in der Stadt ${ctx.user?.city || ''}:`,
        Markup.inlineKeyboard(buttons)
    );
});

logisticsScene.action(/^take_real_quest_(.+)/, async (ctx) => {
    const questId = ctx.match[1];

    // Update quest in DB
    const pickupCode = generateCode();
    const deliveryCode = generateCode();

    const quest = await (prisma as any).quest.update({
        where: { id: questId },
        data: {
            status: "IN_PROGRESS",
            assigneeId: ctx.user?.id,
            pickupCode,
            deliveryCode
        }
    });

    if (ctx.user?.id) {
        await recordActivity(ctx.user.id, "QUEST_STARTED", { questId, title: quest.title });
    }

    // Store in session
    ctx.session.activeQuest = {
        id: quest.id,
        title: quest.title,
        reward: quest.reward,
        pickupCode,
        deliveryCode
    };

    await ctx.answerCbQuery("Bestellung angenommen!");

    await ctx.reply(`✅ Du hast die Bestellung angenommen: **${quest.title}**
    
1️⃣ Geh zur Abholstation.
🔑 Abholcode: *${pickupCode}*

2️⃣ Bring die Bestellung zum Kunden.
🤔 Wenn der Kunde dir den BESTÄTIGUNGSCODE sagt, gib ihn hier ein.
(🕵️‍♂️ Kundencode: ${deliveryCode})`, { parse_mode: "Markdown" });
});

logisticsScene.on("message", async (ctx) => {
    // Check for text code confirmation
    // @ts-ignore
    const text = ctx.message?.text;

    if (text && text.startsWith("/")) {
        await ctx.scene.leave();
        await ctx.reply("Nutze das Menü unten:", mainMenu);
        return;
    }

    if (ctx.session.activeQuest && text) {
        if (text.trim() === ctx.session.activeQuest.deliveryCode) {
            // Success!
            const reward = ctx.session.activeQuest.reward;
            if (ctx.user) {
                // Update DB
                await prisma.user.update({
                    where: { id: ctx.user.id },
                    data: {
                        balance: { increment: reward }
                    }
                });
                // Update Quest status in DB
                await (prisma as any).quest.update({
                    where: { id: ctx.session.activeQuest.id },
                    data: {
                        status: "COMPLETED",
                    }
                });

                await recordActivity(ctx.user.id, "QUEST_COMPLETED", { questId: ctx.session.activeQuest.id });

                await awardDignity(ctx.user.id, 5);

                await ctx.reply(`🎉 RICHTIG! Aufgabe "${ctx.session.activeQuest.title}" erledigt.\n💰 Dein Guthaben wurde um ${reward}€ erhöht.\n🏆 +5 Dignity Score.`, mainMenu);
                delete ctx.session.activeQuest;
                return ctx.scene.leave();
            }
        } else {
            await ctx.reply("❌ Falscher Code! Bitte den Kunden, den richtigen Code erneut zu sagen.");
        }
    } else if (ctx.session.activeQuest) {
        await ctx.reply("⌨️ Gib den 4-stelligen Code ein, den dir der Kunde genannt hat.");
    } else {
        // Should usually be handled by enter, but if they text garbage in menu
        await ctx.reply("Wähle eine Bestellung aus dem Menü.");
    }
});

logisticsScene.action("exit_logistics", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("Zurück zum Hauptmenü.", mainMenu);
    return ctx.scene.leave();
});
