import { Scenes, Markup } from "telegraf";
import { BotContext } from "../middleware/auth";
import prisma from "../services/prisma";
import { awardDignity } from "../services/reputation";
import { mainMenu } from "../keyboards";

export const logisticsScene = new Scenes.BaseScene<BotContext>("logistics");

// Utility to generate random 4-digit code
const generateCode = () => Math.floor(1000 + Math.random() * 9000).toString();

logisticsScene.enter(async (ctx) => {
    // Check if already has quest
    if (ctx.session.activeQuest) {
        await ctx.reply(`📦 В тебе вже є активне замовлення!\n\n📌 **${ctx.session.activeQuest.title || 'Доставка'}**\n🔑 Твій код отримання: *${ctx.session.activeQuest.pickupCode}*\n\nВведи код від клієнта для завершення:`, { parse_mode: "Markdown" });
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
        await ctx.reply("📭 На жаль, у твоєму місті поки немає вільних замовлень. Заходь пізніше!", mainMenu);
        return ctx.scene.leave();
    }

    const buttons = quests.map((q: any) => [
        Markup.button.callback(`📦 ${q.title || 'Доставка'} (${q.reward}€)`, `take_real_quest_${q.id}`)
    ]);
    buttons.push([Markup.button.callback("🚪 Повернутися", "exit_logistics")]);

    await ctx.reply(
        `📦 Доступні замовлення у місті ${ctx.user?.city || ''}:`,
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

    // Store in session
    ctx.session.activeQuest = {
        id: quest.id,
        title: quest.title,
        reward: quest.reward,
        pickupCode,
        deliveryCode
    };

    await ctx.answerCbQuery("Замовлення прийнято!");

    await ctx.reply(`✅ Ти взяв замовлення: **${quest.title}**
    
1️⃣ Йди до точки видачі.
🔑 Код видачі: *${pickupCode}*

2️⃣ Віднеси замовлення клієнту.
🤔 Коли клієнт скаже тобі КОД ПІДТВЕРДЖЕННЯ, введи його сюди.
(🕵️‍♂️ Код клієнта: ${deliveryCode})`, { parse_mode: "Markdown" });
});

logisticsScene.on("message", async (ctx) => {
    // Check for text code confirmation
    // @ts-ignore
    const text = ctx.message?.text;

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

                await awardDignity(ctx.user.id, 5);

                await ctx.reply(`🎉 ПРАВИЛЬНО! Завдання "${ctx.session.activeQuest.title}" виконано.\n💰 Твій баланс поповнено на ${reward}€.\n🏆 +5 Dignity Score.`, mainMenu);
                delete ctx.session.activeQuest;
                return ctx.scene.leave();
            }
        } else {
            await ctx.reply("❌ Невірний код! Попроси клієнта продиктувати правильний код ще раз.");
        }
    } else if (ctx.session.activeQuest) {
        await ctx.reply("⌨️ Введи 4-значний код, який тобі сказав клієнт.");
    } else {
        // Should usually be handled by enter, but if they text garbage in menu
        await ctx.reply("Обери замовлення з меню.");
    }
});

logisticsScene.action("exit_logistics", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.reply("Повертаємося до головного меню.", mainMenu);
    return ctx.scene.leave();
});
