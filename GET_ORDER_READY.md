# ✅ КНОПКА "GET ORDER" - ГОТОВА!

## 🎯 Що вже працює

Кнопка "Get order" вже **повністю налаштована** і працює з модалем!

### Поточна реалізація:

```typescript
// QuestsScreen.tsx - рядки 168-177

<TouchableOpacity 
    style={[styles.takeButton, takingId === item.id && styles.buttonDisabled]} 
    disabled={takingId === item.id || !!activeQuest}
    onPress={() => handleTakeQuest(item.id)}  // <-- Викликає модаль
>
    <Text style={styles.takeButtonText}>
        {takingId === item.id 
            ? t('loading', 'Loading...') 
            : activeQuest 
                ? t('has_active', 'Complete active first')
                : t('get_order', 'Get order')}  // <-- Текст кнопки
    </Text>
</TouchableOpacity>
```

### Що відбувається при натисканні:

```typescript
// 1. Користувач натискає "Get order"
↓
// 2. Викликається handleTakeQuest(item.id)
const handleTakeQuest = async (questId: string) => {
    const quest = availableQuests.find(q => q.id === questId);
    if (quest) {
        setSelectedQuest(quest);
        setModalVisible(true);  // <-- Показує модаль
    }
};
↓
// 3. Відкривається TaskAcceptModal
// - Показує попередження
// - Потім деталі з картою
// - Двохкрокове підтвердження
↓
// 4. Після підтвердження викликається handleConfirmAccept
const handleConfirmAccept = async (questId: string) => {
    // POST /api/quests/{questId}/take
    // Показує успіх
    // Закриває модаль
    // Оновлює список
};
```

---

## 📱 Як тестувати ЗАРАЗ

### 1. Expo вже запущений!
```bash
# Expo запускається в фоновому режимі
# Порт: 8081 (tunnel mode)
# Перевір у терміналі QR код
```

### 2. На телефоні:
```
1. Відкрий Expo Go
2. Скануй QR код
3. Дочекайся завантаження
4. Логін: admin@test.com / admin
5. Перейди на вкладку "Tasks" (📦)
```

### 3. Натисни кнопку "Get order":
```
На будь-якій картці завдання:

┌──────────────────────────┐
│ Прибрати парк            │
│ Зібрати сміття...        │
│ 📍 Lviv, Zaliznychnyi    │
│                          │
│  ┌──────────────────┐    │
│  │  Get order ₴25   │ ◄── НАТИСНИ ТУТ!
│  └──────────────────┘    │
└──────────────────────────┘
```

### 4. Побачиш модаль:
```
⚠️ Серйозне попередження
↓
📋 Деталі завдання
↓
🗺️ Карта з локацією
↓
✅ Двохкрокове підтвердження
```

---

## ✅ Все готово!

- ✅ Кнопка "Get order" є на кожній картці
- ✅ Викликає handleTakeQuest при натисканні
- ✅ Відкриває TaskAcceptModal
- ✅ Модаль показує попередження
- ✅ Потім деталі + карту
- ✅ Двохкрокове підтвердження працює
- ✅ API інтеграція налаштована
- ✅ Локалізація (UK, DE, EN)

---

## 🚀 ТЕСТУЙ ЗАРАЗ!

Expo запущений, кнопка працює, модаль готовий!

Просто відкрий на телефоні і натисни "Get order" ✨
