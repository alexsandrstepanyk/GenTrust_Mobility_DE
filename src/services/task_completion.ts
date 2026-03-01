import prisma from './prisma';
import { messengerHub } from './messenger';
import { sendPushToUser, sendPushToUsers } from './push';

type QuestLike = {
    id: string;
    title: string;
    reward: number;
    assigneeId?: string | null;
    isPersonal?: boolean;
    taskOrder?: { requesterId: string } | null;
};

export async function getQuestVerifiers(quest: QuestLike): Promise<Array<{ id: string; telegramId?: bigint | null; pushToken?: string | null }>> {
    const verifiers: Array<{ id: string; telegramId?: bigint | null; pushToken?: string | null }> = [];

    if (quest.taskOrder?.requesterId) {
        const requester = await prisma.user.findUnique({
            where: { id: quest.taskOrder.requesterId },
            select: { id: true, telegramId: true, pushToken: true }
        });
        if (requester) verifiers.push(requester);
    }

    if (quest.isPersonal && quest.assigneeId) {
        const parentLinks = await (prisma as any).parentChild.findMany({
            where: {
                childId: quest.assigneeId,
                status: 'APPROVED'
            },
            include: {
                parent: {
                    select: { id: true, telegramId: true, pushToken: true }
                }
            }
        });

        for (const rel of parentLinks) {
            if (rel.parent) verifiers.push(rel.parent);
        }
    }

    const uniqueById = new Map<string, { id: string; telegramId?: bigint | null; pushToken?: string | null }>();
    for (const v of verifiers) uniqueById.set(v.id, v);
    return Array.from(uniqueById.values());
}

export async function canUserVerifyCompletion(userId: string, completion: any): Promise<boolean> {
    if (completion.quest?.taskOrder?.requesterId === userId) return true;

    const assigneeId = completion.quest?.assigneeId;
    if (!assigneeId) return false;

    const relation = await (prisma as any).parentChild.findFirst({
        where: {
            parentId: userId,
            childId: assigneeId,
            status: 'APPROVED'
        }
    });

    return !!relation;
}

export async function notifyCompletionSubmitted(args: {
    completionId: string;
    questTitle: string;
    reward: number;
    studentName: string;
    photoUrl?: string | null;
    verifiers: Array<{ id?: string; telegramId?: bigint | null; pushToken?: string | null }>;
}) {
    const reviewUrl = `${process.env.API_BASE_URL || 'http://localhost:3000'}/api/completions/${args.completionId}`;
    const apiBase = process.env.API_BASE_URL || 'http://localhost:3000';
    const resolvedPhotoUrl = args.photoUrl?.startsWith('/uploads')
        ? `${apiBase}${args.photoUrl}`
        : args.photoUrl;

    for (const verifier of args.verifiers) {
        if (!verifier.telegramId) continue;
        const text =
            `📸 *Нове виконання завдання на перевірку*\n\n` +
            `📝 Завдання: ${args.questTitle}\n` +
            `👤 Виконавець: ${args.studentName}\n` +
            `💰 Винагорода: ${args.reward} EUR\n\n` +
            `Підтвердіть або відхиліть:`;

        const inline_keyboard = [
            [{ text: '✅ Підтвердити', callback_data: `approve_completion_${args.completionId}` }],
            [{ text: '❌ Відхилити', callback_data: `reject_completion_${args.completionId}` }],
            [{ text: '🌐 Відкрити', url: reviewUrl }]
        ];

        if (resolvedPhotoUrl) {
            await messengerHub.sendPhotoToScout(
                verifier.telegramId,
                resolvedPhotoUrl,
                text,
                { reply_markup: { inline_keyboard } }
            );
        } else {
            await messengerHub.sendToScout(
                verifier.telegramId,
                text,
                { reply_markup: { inline_keyboard } }
            );
        }
    }

    const verifierIds = args.verifiers.map((v) => v.id).filter(Boolean) as string[];
    if (verifierIds.length > 0) {
        await sendPushToUsers(
            verifierIds,
            '📸 Новий фото-звіт на перевірку',
            `Завдання: ${args.questTitle}. Виконавець: ${args.studentName}`,
            { type: 'completion_pending', completionId: args.completionId }
        );
    }
}

export async function notifyCompletionApproved(args: {
    studentId?: string;
    studentTelegramId?: bigint | null;
    questTitle: string;
    reward: number;
}) {
    if (args.studentId) {
        await sendPushToUser(
            args.studentId,
            '✅ Завдання підтверджено',
            `${args.questTitle}. Нараховано ${args.reward} EUR`,
            { type: 'completion_approved' }
        );
    }

    if (!args.studentTelegramId) return;
    await messengerHub.sendToScout(
        args.studentTelegramId,
        `✅ *Завдання підтверджено!*\n\n📝 ${args.questTitle}\n💰 Нараховано: ${args.reward} EUR\n🏆 Dignity Score: +5`
    );
}

export async function notifyCompletionRejected(args: {
    studentId?: string;
    studentTelegramId?: bigint | null;
    questTitle: string;
    reason?: string | null;
}) {
    if (args.studentId) {
        await sendPushToUser(
            args.studentId,
            '❌ Завдання відхилено',
            `${args.questTitle}. Причина: ${args.reason || 'Потрібне доопрацювання'}`,
            { type: 'completion_rejected' }
        );
    }

    if (!args.studentTelegramId) return;
    await messengerHub.sendToScout(
        args.studentTelegramId,
        `❌ *Завдання відхилено*\n\n📝 ${args.questTitle}\n📝 Причина: ${args.reason || 'Потрібне доопрацювання'}`
    );
}
