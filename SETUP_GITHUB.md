# 🔧 Налаштування GitHub

## 1️⃣ Створіть репозиторій на GitHub

1. Відкрийте https://github.com/new
2. Name: `GenTrust_Mobility_DE`
3. Visibility: **Private** (рекомендується) або Public
4. **НЕ** ініціалізуйте з README/.gitignore
5. Натисніть "Create repository"

---

## 2️⃣ Налаштуйте віддалений репозиторій

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE

# Через HTTPS
git remote add origin https://github.com/YOUR_USERNAME/GenTrust_Mobility_DE.git

# Або через SSH (рекомендується)
git remote add origin git@github.com:YOUR_USERNAME/GenTrust_Mobility_DE.git

# Перевірка
git remote -v
```

---

## 3️⃣ Перший push

```bash
# Push на GitHub
git push -u origin main

# Або використовуйте auto_commit.sh
./auto_commit.sh "v4.0.0 - Початкове налаштування"
```

---

## ✅ Після налаштування

Я (Qwen Code) буду **автоматично**:
- ✅ Робити commit після кожної зміни
- ✅ Оновлювати версію (v3.1.1 → v3.1.2 → v4.0.0)
- ✅ Створювати теги
- ✅ Робити push на GitHub

**Вам нічого не потрібно робити!**

---

## 🔐 SSH Keys (для SSH доступу)

```bash
# Генерація SSH ключа
ssh-keygen -t ed25519 -C "your_email@example.com"

# Додавання ключа до GitHub
cat ~/.ssh/id_ed25519.pub

# Скопіюйте вивід і додайте на:
# https://github.com/settings/keys
```

---

## 📊 Поточний статус

```bash
# Перевірка remote
git remote -v

# Перевірка гілки
git branch -a

# Останні коміти
git log --oneline -5
```
