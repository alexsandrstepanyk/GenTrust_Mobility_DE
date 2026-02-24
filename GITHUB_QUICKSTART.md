# 🚀 GENTRUST MOBILITY - GitHub Quick Start

## ✅ Поточний статус

| Компонент | Статус | Версія |
|-----------|--------|--------|
| **Git Репозиторій** | ✅ Створено | main |
| **Останній Commit** | ✅ v4.0.0 | 37c0d52 |
| **GitHub Workflow** | ✅ Налаштовано | v1.0 |

---

## 📦 Швидкий старт з GitHub

### 1️⃣ Створення репозиторію на GitHub

```bash
# На GitHub.com створіть новий репозиторій:
# Name: GenTrust_Mobility_DE
# Visibility: Private (або Public)
# НЕ ініціалізуйте з README!
```

### 2️⃣ Додавання віддаленого репозиторію

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE

# Додайте GitHub як віддалений репозиторій
git remote add origin https://github.com/YOUR_USERNAME/GenTrust_Mobility_DE.git

# Або через SSH (рекомендується)
git remote add origin git@github.com:YOUR_USERNAME/GenTrust_Mobility_DE.git

# Перевірка
git remote -v
```

### 3️⃣ Перший Push на GitHub

```bash
# Push всієї історії
git push -u origin main

# З тегом v4.0.0
git push origin v4.0.0
```

---

## 🔄 Щоденний Workflow

### Після КОЖНОЇ зміни:

#### Варіант A: Ручний (детальний)

```bash
# 1. Перевірка змін
git status

# 2. Додавання файлів
git add -A

# 3. Commit з описом
git commit -m "fix: Виправлено помилку в LoginScreen

🐛 Bugfix: Виправлено проблему з валідацією email
✅ Тести: Додано тести на валідацію"

# 4. Push
git push origin main
```

#### Варіант B: Автоматичний (швидкий)

```bash
# Використовуйте push.sh скрипт
./push.sh "v3.1.1" "Виправлено помилку в LoginScreen"
```

---

## 📋 Версії та Релізи

### v3.1.1 - Малі зміни (PATCH)
```bash
./push.sh "v3.1.1" "Виправлено баг з email валідацією"
```

### v3.1.2 - Середні зміни (MINOR)
```bash
./push.sh "v3.1.2" "Додано новий екран Profile

- Додано DashboardScreen
- Додано Statistics component
- Оновлено навігацію"
```

### v4.0.0 - Глобальні зміни (MAJOR)
```bash
./push.sh "v4.0.0" "Повне відновлення системи

✅ Backend API (порт 3000)
✅ Staff Panel (порт 5173)
✅ Admin Panel (порт 5174)
✅ Mobile Client (порт 8081)
✅ Mobile School (порт 8082)"
```

---

## 🏷️ Створення GitHub Release

### Через GitHub CLI:

```bash
# Встановлення (якщо немає)
brew install gh

# Авторизація
gh auth login

# Створення релізу
gh release create v4.0.0 \
  --title "Release v4.0.0 - Повне відновлення" \
  --notes "Повний функціонал відновлено" \
  --generate-notes
```

### Через GitHub Web:

1. Відкрийте https://github.com/YOUR_USERNAME/GenTrust_Mobility_DE/releases
2. Натисніть "Draft a new release"
3. Виберіть тег (v4.0.0)
4. Додайте опис
5. Натисніть "Publish release"

---

## 📊 Перегляд історії

```bash
# Останні 10 комітів
git log --oneline -10

# Детальна історія
git log --pretty=format:"%h - %an, %ar : %s" -10

# Зміни в файлі
git log -p -- src/index.ts

# Хто і коли змінив
git blame src/index.ts
```

---

## 🛡️ Backup на GitHub

### Автоматичний backup:

```bash
# Після кожної зміни
git add -A
git commit -m "backup: $(date +%Y-%m-%d-%H-%M)"
git push origin main
```

### Ручний backup перед змінами:

```bash
# Створіть гілку для безпеки
git checkout -b backup-before-major-changes
git push origin backup-before-major-changes

# Поверніться на main
git checkout main
```

---

## 🌿 Робота з гілками

### Створення нової гілки:

```bash
# Створити гілку
git checkout -b feature/new-dashboard

# Працювати в гілці
git add -A
git commit -m "feat: Додано новий dashboard"
git push origin feature/new-dashboard

# Створити Pull Request на GitHub
# https://github.com/YOUR_USERNAME/GenTrust_Mobility_DE/compare
```

### Злиття гілок:

```bash
# Повернутися на main
git checkout main

# Отримати останні зміни
git pull origin main

# Злити гілку
git merge feature/new-dashboard

# Push на GitHub
git push origin main
```

---

## 📝 Commit Message Convention

### Формат:
```
<type>: <description>

[optional body]

[optional footer]
```

### Типи:

| Тип | Опис | Приклад |
|-----|------|---------|
| `feat` | Нова функція | `feat: Додано Profile Screen` |
| `fix` | Виправлення багу | `fix: Виправлено валідацію email` |
| `docs` | Документація | `docs: Оновлено README` |
| `style` | Стилі, форматування | `style: Prettier formatting` |
| `refactor` | Рефакторинг | `refactor: Оптимізовано API` |
| `perf` | Продуктивність | `perf: Зменшено час завантаження` |
| `test` | Тести | `test: Додано unit тести` |
| `chore` | Інфраструктура | `chore: Оновлено dependencies` |
| `ci` | CI/CD | `ci: Додано GitHub Actions` |
| `revert` | Скасування | `revert: Скасовано попередній commit` |

### Приклади:

```bash
# Простий
git commit -m "fix: Виправлено помилку в LoginScreen"

# З описом
git commit -m "feat: Додано новий екран Profile

- Додано DashboardScreen
- Додано Statistics component
- Оновлено навігацію між екранами

Closes #123"

# З BREAKING CHANGE
git commit -m "feat(v4)!: Повна переробка API

BREAKING CHANGE: Змінено формат відповідей API
- Тепер JSON замість XML
- Нові endpoints
- Оновлено автентифікацію"
```

---

## 🔧 Корисні команди

```bash
# Скасувати зміни в файлі
git checkout -- src/index.ts

# Скасувати commit (зберегти зміни)
git reset --soft HEAD~1

# Скасувати commit (видалити зміни)
git reset --hard HEAD~1

# Переглянути зміни
git diff

# Переглянути зміни в commit
git show abc123

# Знайти commit
git log --all --grep="LoginScreen"

# Статистика змін
git shortlog -sn
```

---

## 📊 Поточна версія: **v4.0.0**

**Git Status:** ✅ Ready to push
**GitHub:** https://github.com/YOUR_USERNAME/GenTrust_Mobility_DE
**Останній Commit:** 9be8bbe - feat: Додано push.sh скрипт

---

## 🎯 Наступні кроки:

1. ✅ Створити репозиторій на GitHub
2. ✅ Додати віддалений репозиторій: `git remote add origin ...`
3. ✅ Зробити перший push: `git push -u origin main`
4. ✅ Створити реліз v4.0.0 на GitHub
