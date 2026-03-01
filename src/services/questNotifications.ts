import { sendPushToUser } from './push';
import prisma from './prisma';

/**
 * Send push notification when quest is created by municipality
 */
export async function notifyQuestCreated(questId: string) {
    try {
        const quest = await prisma.quest.findUnique({
            where: { id: questId },
            include: {
                assignee: true
            }
        });

        if (!quest?.assigneeId) return;

        await sendPushToUser(
            quest.assigneeId,
            '🎯 Нове завдання від мерії!',
            `Завдання: ${quest.title}. Винагорода: €${quest.reward}`,
            { questId: quest.id, type: 'quest_created' }
        );

        console.log(`[PUSH] Quest created notification sent to ${quest.assignee?.firstName}`);
    } catch (error) {
        console.error('[PUSH] Error sending quest created notification:', error);
    }
}

/**
 * Send push notification when quest is completed by child
 */
export async function notifyQuestCompleted(questId: string) {
    try {
        const quest = await prisma.quest.findUnique({
            where: { id: questId },
            include: {
                assignee: true
            }
        });

        if (!quest?.assigneeId) return;

        // Notify child
        await sendPushToUser(
            quest.assigneeId,
            '✅ Завдання виконано!',
            `Ви виконали: ${quest.title}. Очікуємо підтвердження мерії.`,
            { questId: quest.id, type: 'quest_completed' }
        );

        console.log(`[PUSH] Quest completed notification sent to ${quest.assignee?.firstName}`);
    } catch (error) {
        console.error('[PUSH] Error sending quest completed notification:', error);
    }
}

/**
 * Send push notification when quest is verified/confirmed
 */
export async function notifyQuestVerified(questId: string, approved: boolean) {
    try {
        const quest = await prisma.quest.findUnique({
            where: { id: questId },
            include: {
                assignee: true
            }
        });

        if (!quest?.assigneeId) return;

        if (approved) {
            await sendPushToUser(
                quest.assigneeId,
                '🎉 Завдання підтверджено!',
                `Вітаємо! Ви отримали €${quest.reward} за "${quest.title}"`,
                { questId: quest.id, type: 'quest_verified' }
            );
        } else {
            await sendPushToUser(
                quest.assigneeId,
                '❌ Завдання відхилено',
                `На жаль, "${quest.title}" не пройшло перевірку. Спробуйте ще раз!`,
                { questId: quest.id, type: 'quest_rejected' }
            );
        }

        console.log(`[PUSH] Quest verified notification sent to ${quest.assignee?.firstName}`);
    } catch (error) {
        console.error('[PUSH] Error sending quest verified notification:', error);
    }
}

/**
 * Send push notification when parent creates a personal task for child
 */
export async function notifyPersonalTaskCreated(taskId: string) {
    try {
        const task = await prisma.personalTask.findUnique({
            where: { id: taskId }
        });

        if (!task?.assignedChildId) return;

        await sendPushToUser(
            task.assignedChildId,
            '👨‍👩‍👧 Нове завдання від батьків!',
            `${task.title}. Винагорода: €${task.reward}`,
            { taskId: task.id, type: 'personal_task_created' }
        );

        console.log(`[PUSH] Personal task notification sent to child ${task.assignedChildId}`);
    } catch (error) {
        console.error('[PUSH] Error sending personal task notification:', error);
    }
}

/**
 * Send push when personal task completion needs parent approval
 */
export async function notifyPersonalTaskNeedsApproval(taskId: string) {
    try {
        const task = await prisma.personalTask.findUnique({
            where: { id: taskId }
        });

        if (!task?.creatorId) return;

        await sendPushToUser(
            task.creatorId,
            '⏳ Завдання очікує підтвердження',
            `Виконано завдання: "${task.title}"`,
            { taskId: task.id, type: 'personal_task_needs_approval' }
        );

        console.log(`[PUSH] Task approval notification sent to parent`);
    } catch (error) {
        console.error('[PUSH] Error sending task approval notification:', error);
    }
}

/**
 * Send push when parent approves/rejects personal task
 */
export async function notifyPersonalTaskVerified(taskId: string, approved: boolean) {
    try {
        const task = await prisma.personalTask.findUnique({
            where: { id: taskId }
        });

        if (!task?.assignedChildId) return;

        if (approved) {
            await sendPushToUser(
                task.assignedChildId,
                '🎉 Батьки підтвердили!',
                `Вітаємо! Ви отримали €${task.reward} за "${task.title}"`,
                { taskId: task.id, type: 'personal_task_approved' }
            );
        } else {
            await sendPushToUser(
                task.assignedChildId,
                '🔄 Завдання не зараховано',
                `Батьки просять переробити: "${task.title}"`,
                { taskId: task.id, type: 'personal_task_rejected' }
            );
        }

        console.log(`[PUSH] Personal task verification sent to child ${task.assignedChildId}`);
    } catch (error) {
        console.error('[PUSH] Error sending personal task verification:', error);
    }
}
