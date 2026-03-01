# Photo Verification System - Implementation Plan

## 🎯 Мета
Додати систему підтвердження виконаних завдань з фото-звітами для батьків та клієнтів.

---

## 📋 Вимоги

### Workflow:
1. **Студент виконує завдання** → завантажує фото-звіт
2. **Фото надсилається**:
   - Батькам (якщо завдання від батьків через PersonalTask)
   - Клієнту (якщо завдання від клієнта через TaskOrder/Quest)
3. **Підтвердження**:
   - Батько/Клієнт переглядає фото
   - Підтверджує (APPROVE) або відхиляє (REJECT)
4. **Винагорода**:
   - Тільки після APPROVE зараховується оплата
   - При REJECT - завдання не оплачується

---

## 🗃️ Database Changes

### 1. Нова модель TaskCompletion

```prisma
model TaskCompletion {
  id              String   @id @default(uuid())
  
  // Зв'язок з Quest
  quest           Quest    @relation(fields: [questId], references: [id], onDelete: Cascade)
  questId         String
  
  // Виконавець
  student         User     @relation("completedBy", fields: [studentId], references: [id])
  studentId       String
  
  // Фото-звіт
  photoUrl        String?  // URL фото у Cloudinary/S3/local storage
  photoTelegramId String?  // file_id з Telegram (для ботів)
  description     String?  // Опис виконаної роботи
  
  // Статус підтвердження
  status          String   @default("PENDING")  // PENDING, APPROVED, REJECTED
  
  // Хто підтверджує
  verifiedBy      User?    @relation("verifiedBy", fields: [verifiedById], references: [id])
  verifiedById    String?
  verifiedAt      DateTime?
  rejectionReason String?  // Причина відхилення
  
  // Винагорода
  rewardAmount    Float?   // Скільки нараховано
  rewardPaid      Boolean  @default(false)
  
  completedAt     DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([questId, status])
  @@index([studentId, status])
}
```

### 2. Оновлення Quest model

```prisma
model Quest {
  // ...existing fields...
  
  completions   TaskCompletion[]  // Зв'язок з виконаннями
  
  // Додаткові поля
  requiresPhoto Boolean @default(true)   // Чи потрібне фото для підтвердження
  autoApprove   Boolean @default(false)  // Автопідтвердження без перевірки
}
```

### 3. Оновлення User model

```prisma
model User {
  // ...existing fields...
  
  completedTasks TaskCompletion[] @relation("completedBy")
  verifiedTasks  TaskCompletion[] @relation("verifiedBy")
}
```

---

## 🔧 Backend API Changes

### New Endpoints

#### 1. Complete Quest with Photo
```typescript
POST /api/quests/:questId/complete
Headers: Authorization: Bearer <student_token>
Body: FormData {
  photo: File
  description?: string
  latitude?: number
  longitude?: number
}

Response: {
  success: true,
  completion: TaskCompletion,
  message: "Завдання виконано. Очікується підтвердження від замовника."
}
```

#### 2. Get Pending Completions (for Parent/Client)
```typescript
GET /api/completions/pending
Headers: Authorization: Bearer <parent_or_client_token>

Response: {
  completions: TaskCompletion[]
}
```

#### 3. Approve Completion
```typescript
POST /api/completions/:completionId/approve
Headers: Authorization: Bearer <parent_or_client_token>

Response: {
  success: true,
  completion: TaskCompletion,
  message: "Завдання підтверджено. Винагорода нарахована."
}
```

#### 4. Reject Completion
```typescript
POST /api/completions/:completionId/reject
Headers: Authorization: Bearer <parent_or_client_token>
Body: {
  reason: string
}

Response: {
  success: true,
  completion: TaskCompletion,
  message: "Завдання відхилено."
}
```

---

## 📱 Mobile App Changes

### School App (Student)

**New Screen: CompleteQuestScreen.tsx**
```typescript
// Features:
- Photo capture from camera
- Photo selection from gallery
- Description text input
- GPS location capture
- Submit button
- Loading state during upload
```

**Updated QuestDetailsScreen.tsx**
```typescript
// Add "Відмітити виконання" button
// Navigate to CompleteQuestScreen
```

---

### Parent App

**New Screen: PendingApprovalsScreen.tsx**
```typescript
// Features:
- List of pending task completions
- Photo preview
- Student name & task title
- Approve button
- Reject button with reason modal
- Filter by child
```

**Updated Navigation**
```typescript
// Add new tab "Підтвердження" 
// Or add to existing Tasks tab
```

---

### Client App

**New Screen: MyTaskCompletionsScreen.tsx**
```typescript
// Features:
- List of completions for user's TaskOrders
- Photo preview
- Student name
- Approve/Reject buttons
- Status filter (Pending/Approved/Rejected)
```

---

## 🤖 Telegram Bot Changes

### Student Bot (bot.ts)

**New Command: /complete**
```typescript
bot.command('complete', async (ctx) => {
  // Show list of user's IN_PROGRESS quests
  // Select quest
  // Upload photo
  // Add description
  // Submit completion
});
```

**Photo Handler**
```typescript
bot.on('photo', async (ctx) => {
  // If in completion flow
  // Save photo file_id
  // Ask for description
  // Submit completion
});
```

**Notification to Student**
```typescript
// When parent/client approves
"✅ Ваше завдання '{title}' підтверджено! 
💰 Нараховано: {reward} EUR
📊 Dignity Score: +{points}"

// When parent/client rejects
"❌ Завдання '{title}' відхилено
📝 Причина: {reason}
Спробуйте ще раз або зв'яжіться з замовником."
```

---

### Parent Bot / Notification

**Photo Verification Alert**
```typescript
// When student completes task
sendToParent(parentTelegramId, {
  message: `
📸 НОВЕ ПІДТВЕРДЖЕННЯ ЗАВДАННЯ

👤 Студент: ${student.firstName} ${student.lastName}
📋 Завдання: ${quest.title}
💰 Винагорода: ${quest.reward} EUR

Переглянути фото та підтвердити:
${webAppLink}
  `,
  photo: photoTelegramId,
  keyboard: [
    [{ text: '✅ Підтвердити', callback_data: `approve_${completionId}` }],
    [{ text: '❌ Відхилити', callback_data: `reject_${completionId}` }],
    [{ text: '🌐 Відкрити додаток', url: webAppLink }]
  ]
});
```

**Callback Handlers**
```typescript
bot.action(/approve_(.+)/, async (ctx) => {
  const completionId = ctx.match[1];
  // Call API to approve
  // Send success message
});

bot.action(/reject_(.+)/, async (ctx) => {
  const completionId = ctx.match[1];
  // Ask for reason
  // Call API to reject
});
```

---

## 💾 File Storage

### Options:

1. **Cloudinary** (Recommended for production)
   - Free tier: 25GB storage
   - Image optimization
   - CDN delivery
   - Easy React Native integration

2. **Local Storage** (Development)
   - Save to `/uploads/task-completions/`
   - Serve via Express static

3. **AWS S3**
   - Scalable
   - Pay-as-you-go

### Implementation:

```typescript
// src/services/fileStorage.ts
import { v2 as cloudinary } from 'cloudinary';

export async function uploadCompletionPhoto(
  file: Express.Multer.File,
  metadata: {
    studentId: string;
    questId: string;
    completionId: string;
  }
): Promise<string> {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: 'task-completions',
    public_id: `${metadata.completionId}_${Date.now()}`,
    tags: [metadata.studentId, metadata.questId]
  });
  
  return result.secure_url;
}
```

---

## 🔔 Notifications

### When Task Completed by Student:

**To Parent (if PersonalTask)**
```
📸 Ваша дитина виконала завдання!

👤 ${child.firstName} ${child.lastName}
📋 ${quest.title}
🕐 ${completedAt}

Переглянути фото та підтвердити в додатку
```

**To Client (if TaskOrder)**
```
📸 Завдання виконано студентом!

👤 ${student.firstName} ${student.lastName}
📋 ${quest.title}
💰 Винагорода: ${quest.reward} EUR

Перевірте якість виконання в додатку
```

### When Approved:

**To Student**
```
✅ Завдання підтверджено!

📋 ${quest.title}
💰 +${reward} EUR
📊 Dignity Score: +${points}

Дякуємо за якісну роботу! 🎉
```

### When Rejected:

**To Student**
```
❌ Завдання потребує доопрацювання

📋 ${quest.title}
📝 Причина: ${reason}

Зв'яжіться з замовником або виконайте ще раз
```

---

## 📊 Business Logic

### Approval Rules:

1. **Auto-approve** (if quest.autoApprove = true)
   - Instant reward
   - No verification needed
   - For low-value or trust-based tasks

2. **Manual approve** (default)
   - Status: PENDING → wait for parent/client
   - Within 24 hours → auto-approve
   - After 24 hours → send reminder

3. **Multi-approval** (future)
   - Require 2+ confirmations
   - For high-value tasks (>100 EUR)

### Reward Logic:

```typescript
async function processApproval(completionId: string) {
  const completion = await prisma.taskCompletion.update({
    where: { id: completionId },
    data: { 
      status: 'APPROVED',
      verifiedAt: new Date(),
      rewardPaid: true
    },
    include: { quest: true, student: true }
  });
  
  // Add reward to student balance
  await prisma.user.update({
    where: { id: completion.studentId },
    data: {
      balance: { increment: completion.quest.reward },
      dignityScore: { increment: 5 } // Bonus points
    }
  });
  
  // Update quest status
  await prisma.quest.update({
    where: { id: completion.questId },
    data: { status: 'COMPLETED' }
  });
  
  // Send notification
  await sendTelegramNotification(completion.student.telegramId, {
    message: `✅ Завдання підтверджено! +${completion.quest.reward} EUR`
  });
}
```

---

## 🧪 Testing Checklist

- [ ] Student can upload photo for quest completion
- [ ] Photo appears in parent/client app
- [ ] Parent can approve/reject from app
- [ ] Parent can approve/reject from Telegram
- [ ] Client can approve/reject from app
- [ ] Reward is added after approval
- [ ] No reward if rejected
- [ ] Telegram notifications work
- [ ] File upload handles errors
- [ ] Image compression works
- [ ] GPS coordinates saved

---

## 📝 Migration Steps

1. ✅ Update Prisma schema
2. ✅ Run migration: `npx prisma migrate dev --name add_task_completion`
3. ✅ Add file upload middleware (multer)
4. ✅ Add Cloudinary config
5. ✅ Create API endpoints
6. ✅ Update School App (photo upload)
7. ✅ Update Parent App (approval screen)
8. ✅ Update Client App (approval screen)
9. ✅ Update Telegram Bots
10. ✅ Test full workflow
11. ✅ Update README.md

---

## 🚀 Implementation Priority

### Phase 1 (MVP - 2 hours)
- ✅ Database schema
- ✅ API endpoints (complete, approve, reject)
- ✅ Basic file upload (local storage)
- ✅ School App: photo upload UI

### Phase 2 (Notifications - 1 hour)
- ✅ Telegram notifications to parents
- ✅ Telegram notifications to clients
- ✅ Parent App: approval screen

### Phase 3 (Polish - 1 hour)
- ✅ Client App: approval screen
- ✅ Cloudinary integration
- ✅ Image optimization
- ✅ Error handling

---

**Total Estimated Time: 4 hours**
**Priority: HIGH** (Critical for trust and quality control)
