# 🚀 GENTRUST MOBILITY - GitHub Workflow

## 📋 Версіонування

Використовуємо **Semantic Versioning** (SemVer): `MAJOR.MINOR.PATCH`

### Типи релізів:

#### 🔧 v3.1.1 - Малі зміни (PATCH)
- Виправлення багів
- Дрібні покращення UI
- Виправлення помилок в тексті
- Hotfix для критичних проблем

**Приклади:**
- Виправлено помилку в LoginScreen
- Оновлено кольори кнопок
- Виправлено переклад на українську

---

#### 📦 v3.1.2 - Середні зміни (MINOR)
- Нові функції (не ламають зворотну сумісність)
- Нові екрани/компоненти
- Інтеграція нових сервісів
- Покращення продуктивності

**Приклади:**
- Додано новий екран Profile
- Інтегровано push notifications
- Додано i18n підтримку

---

#### 🌍 v4.0.0 - Глобальні зміни (MAJOR)
- Архітектурні зміни
- Злам зворотної сумісності
- Нові технології/фреймворки
- Повний редизайн

**Приклади:**
- Переїзд на React Native 0.81
- Нова архітектура Backend API
- Повне оновлення бази даних

---

## 🔄 GitHub Workflow

### Після КОЖНОЇ зміни:

```bash
# 1. Перевірка змін
git status

# 2. Додавання файлів
git add -A

# 3. Commit з описом
git commit -m "v3.1.1 - Виправлено помилку в LoginScreen

🐛 Bugfix: Виправлено проблему з валідацією email
✅ Тести: Додано тести на валідацію
📝 Docs: Оновлено документацію"

# 4. Push на GitHub
git push origin main

# 5. Створення релізу (опціонально)
git tag -a v3.1.1 -m "Release v3.1.1 - Bugfix release"
git push origin v3.1.1
```

---

## 📝 Commit Message Convention

### Формат:
```
<type>: <description>

[optional body]

[optional footer]
```

### Типи комітів:

| Тип | Опис |
|-----|------|
| `feat` | Нова функція |
| `fix` | Виправлення багу |
| `docs` | Зміни в документації |
| `style` | Форматування, стилі (не впливають на логіку) |
| `refactor` | Рефакторинг коду (не нова функція, не багфікс) |
| `perf` | Покращення продуктивності |
| `test` | Додавання тестів |
| `chore` | Зміни в збірці, інструментах, бібліотеках |
| `ci` | Зміни в CI/CD конфігурації |
| `revert` | Скасування попередніх змін |

### Приклади:

```bash
# Малий фікс
git commit -m "fix: Виправлено помилку в LoginScreen"

# Середня зміна
git commit -m "feat: Додано новий екран Profile

- Додано DashboardScreen
- Додано Statistics component
- Оновлено навігацію"

# Глобальна зміна
git commit -m "feat(v4)!: Повна переробка архітектури

BREAKING CHANGE: Змінено API endpoints
- REST API тепер на Express.js
- Нова схема бази даних
- Оновлено всі mobile додатки"
```

---

## 🏷️ GitHub Releases

### Створення релізу:

```bash
# Створити тег
git tag -a v3.1.1 -m "Release v3.1.1"

# Push тегу
git push origin v3.1.1

# Або створити реліз через GitHub CLI
gh release create v3.1.1 --title "Release v3.1.1" --notes "Bugfix release"
```

### Release Notes Template:

```markdown
## 🚀 Release v3.1.1

### 🐛 Bug Fixes
- Виправлено помилку в LoginScreen (#123)
- Виправлено проблему з валідацією email (#124)

### 📝 Documentation
- Оновлено README.md
- Додано API документацію

### 📦 Dependencies
- Оновлено React Native до 0.81
- Оновлено Prisma до 5.10.2

### 🔧 Technical Debt
- Refactored auth middleware
- Added unit tests for API
```

---

## 📂 Структура репозиторію

```
GenTrust_Mobility_DE/
├── .gitignore              # ✅ Git ignore файли
├── README.md               # ✅ Головна документація
├── package.json            # ✅ Залежності
├── src/                    # ✅ Backend код
├── mobile/                 # ✅ Mobile Client
├── mobile-school/          # ✅ Mobile School
├── admin-panel/            # ✅ Admin Panel
├── staff-panel/            # ✅ Staff Panel
├── prisma/                 # ✅ Database schema
├── docs/                   # ✅ Документація
└── scripts/                # ✅ Scripts
```

---

## 🎯 Checklist перед Push

### ✅ Обов'язково:
- [ ] Код працює (перевірено локально)
- [ ] Всі тести проходять
- [ ] Немає console.log в production коді
- [ ] Commit message зрозумілий
- [ ] Зміни задокументовані

### ✅ Для великих змін:
- [ ] Оновлено документацію
- [ ] Додано тести
- [ ] Перевірено на всіх платформах
- [ ] Оновлено CHANGELOG.md

---

## 🛡️ Backup Strategy

### Автоматичні бекапи:
- Кожні 30 секунд → `backups/`
- Кожна зміна → Git commit
- Кожен реліз → GitHub Release

### Ручні бекапи:
```bash
# Створити бекап перед великими змінами
./VERIFY.sh backup

# Відновити з бекапу
./VERIFY.sh restore <backup-name>
```

---

## 📊 Поточна версія: **v4.0.0**

**Статус:** ✅ Всі сервіси працюють
**Дата:** 24 лютого 2026
**Зміни:** Повне відновлення системи з GenTrust_Mobility
