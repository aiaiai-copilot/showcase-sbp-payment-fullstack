# Переменные окружения: полное техническое объяснение

## Обзор

Этот документ объясняет, как именно работают переменные окружения в разных режимах работы приложения.

---

## Архитектура

### Код загрузки переменных

**Файл:** `backend/src/config.ts`

```typescript
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();  // <-- Читает файл .env из рабочей директории

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  // ...
};
```

**Важно:** Вызов `dotenv.config()` есть в исходном коде и **включается в production build** (esbuild бандлит всё, включая библиотеку `dotenv`).

---

## Режимы работы

### 1️⃣ Development на локальной машине

**Команда:**
```bash
cd backend
npm run dev
```

**Что происходит:**
```
npm run dev
  ↓
tsx watch src/server.ts
  ↓
Загружается src/config.ts
  ↓
Выполняется dotenv.config()
  ↓
Читается файл backend/.env
  ↓
Переменные загружаются в process.env
```

**Файл:** `backend/.env` (локальный, не коммитится в git)

```env
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
PORT=3000
YOOKASSA_SHOP_ID=your_test_shop_id
YOOKASSA_SECRET_KEY=test_your_secret_key
LOG_LEVEL=info
```

**Источник переменных:** Файл `.env` через `dotenv.config()`

---

### 2️⃣ Production Preview на локальной машине

**Команды:**
```bash
cd backend
npm run build  # Создаёт dist/server.js
npm start      # Запускает node dist/server.js
```

**Что происходит:**
```
npm run build
  ↓
esbuild компилирует src/server.ts → dist/server.js
  ↓
В dist/server.js включён код dotenv библиотеки
В dist/server.js включён вызов dotenv.config()
  ↓
npm start
  ↓
node dist/server.js
  ↓
Выполняется dotenv.config() (из бандла)
  ↓
Читается файл backend/.env (из рабочей директории)
  ↓
Переменные загружаются в process.env
```

**Файл:** `backend/.env` (тот же локальный файл)

**Для production preview нужно:**
```env
NODE_ENV=production
FRONTEND_URL=https://alexanderlapygin.com  # Или другой production URL
# ... остальные переменные
```

**Источник переменных:** Файл `.env` через `dotenv.config()`

**⚠️ Проблема:** Если в локальном `.env` стоят production значения, а вы запускаете `npm run dev`, получите CORS ошибки!

---

### 3️⃣ Production на сервере (systemd)

**Структура на сервере:**
```
/var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/
├── dist/
│   ├── server.js      # Забандленный код (включая dotenv)
│   └── server.js.map
└── .env               # Production конфигурация
```

**Systemd service:** `/etc/systemd/system/sbp-backend.service`

```ini
[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend

# Команда запуска
ExecStart=/usr/bin/node dist/server.js

# Переменные окружения (два способа)
Environment=NODE_ENV=production
EnvironmentFile=/var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env
```

**Что происходит:**
```
systemctl start sbp-backend
  ↓
systemd читает EnvironmentFile (.env)
  ↓
systemd устанавливает переменные из Environment=
  ↓
systemd запускает: /usr/bin/node dist/server.js
  ↓
  (рабочая директория: .../backend)
  ↓
Выполняется dist/server.js
  ↓
Выполняется dotenv.config() (включённый в бандл)
  ↓
dotenv.config() ищет .env в текущей директории
  ↓
dotenv.config() НЕ перезаписывает уже установленные переменные
  ↓
Итоговые переменные = systemd Environment + systemd EnvironmentFile + dotenv .env
```

**Файл:** `/var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env`

```env
NODE_ENV=production
FRONTEND_URL=https://alexanderlapygin.com
PORT=3000
YOOKASSA_SHOP_ID=production_shop_id
YOOKASSA_SECRET_KEY=test_production_secret_key
LOG_LEVEL=info
```

**Источник переменных:**
1. systemd `Environment=` директива
2. systemd `EnvironmentFile=` (читает `.env`)
3. `dotenv.config()` в коде (читает `.env` из WorkingDirectory)

**Примечание:** Пункты 2 и 3 дублируют друг друга, но это безопасно и обеспечивает надёжность.

---

### 4️⃣ Production на сервере (PM2)

**Альтернатива systemd:**

```bash
cd /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend
pm2 start dist/server.js --name sbp-backend
```

**Что происходит:**
```
pm2 start dist/server.js
  ↓
PM2 запускает: node dist/server.js
  ↓
  (рабочая директория: .../backend)
  ↓
Выполняется dist/server.js
  ↓
Выполняется dotenv.config() (включённый в бандл)
  ↓
dotenv.config() читает .env из текущей директории
  ↓
Переменные загружаются в process.env
```

**Файл:** `/var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env` (тот же)

**Источник переменных:** Файл `.env` через `dotenv.config()`

---

## Ключевые моменты

### ✅ Факты

1. **Файл `.env` используется везде:**
   - ✅ Local development (`npm run dev`)
   - ✅ Production preview (`npm start`)
   - ✅ Production на сервере (systemd/PM2)

2. **`dotenv.config()` выполняется везде:**
   - ✅ В исходном коде (`src/config.ts`)
   - ✅ В собранном коде (`dist/server.js`)
   - ✅ На production сервере

3. **`dotenv` библиотека забандлена в `dist/server.js`:**
   - ✅ esbuild включает весь код (см. `build.js`: `external: []`)
   - ✅ На production сервере НЕ нужен `node_modules/`

4. **Рабочая директория важна:**
   - `dotenv.config()` ищет `.env` в **текущей рабочей директории**
   - В systemd: `WorkingDirectory=/var/www/.../backend`
   - При запуске PM2: текущая директория при вызове команды

### ⚠️ Распространённые ошибки

**Ошибка 1: Production значения в локальном `.env`**
```env
# backend/.env (НЕПРАВИЛЬНО для local dev!)
NODE_ENV=production  ❌
FRONTEND_URL=https://alexanderlapygin.com  ❌
```

**Результат:** CORS ошибки при `npm run dev`

**Решение:** В локальном `.env` должны быть development значения:
```env
NODE_ENV=development  ✅
FRONTEND_URL=http://localhost:5173  ✅
```

---

**Ошибка 2: Отсутствие `.env` на сервере**

**Симптом:** Backend не запускается, warnings в логах

**Решение:** Создать файл `.env` на сервере с production значениями

---

**Ошибка 3: Неправильные права доступа к `.env`**

**Симптом:** Backend не может прочитать `.env`

**Решение:**
```bash
chown www-data:www-data /var/www/.../backend/.env
chmod 600 /var/www/.../backend/.env
```

---

## Проверка конфигурации

### Local Development

```bash
# Проверить содержимое .env
cat backend/.env

# Должно быть:
# NODE_ENV=development
# FRONTEND_URL=http://localhost:5173

# Запустить backend
cd backend && npm run dev

# Проверить логи - должно показать:
# Environment: development
# Frontend URL: http://localhost:5173
```

### Production на сервере

```bash
# Проверить содержимое .env
cat /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env

# Должно быть:
# NODE_ENV=production
# FRONTEND_URL=https://alexanderlapygin.com

# Проверить права доступа
ls -la /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env
# Должно быть: -rw------- (600) www-data www-data

# Проверить systemd service
systemctl status sbp-backend

# Проверить логи
journalctl -u sbp-backend -n 50

# Должно показать:
# Environment: production
# Frontend URL: https://alexanderlapygin.com
```

---

## Диаграмма потока данных

### Development Mode

```
Разработчик
    ↓
npm run dev
    ↓
tsx watch src/server.ts
    ↓
src/config.ts
    ↓
dotenv.config()
    ↓
Читает: backend/.env (development настройки)
    ↓
process.env.NODE_ENV = "development"
process.env.FRONTEND_URL = "http://localhost:5173"
    ↓
Server запущен с development конфигурацией
```

### Production Mode (на сервере)

```
systemd/PM2
    ↓
node dist/server.js
(WorkingDirectory: /var/www/.../backend/)
    ↓
dist/server.js (забандленный код)
    ↓
dotenv.config() (из бандла)
    ↓
Читает: /var/www/.../backend/.env (production настройки)
    ↓
process.env.NODE_ENV = "production"
process.env.FRONTEND_URL = "https://alexanderlapygin.com"
    ↓
Server запущен с production конфигурацией
```

---

## Выводы

1. **Один механизм, разные файлы:**
   - И локально, и на production используется файл `.env`
   - Содержимое файлов должно быть разным для разных режимов

2. **Безопасность:**
   - `.env` **НЕ** коммитится в git (в `.gitignore`)
   - Секреты создаются локально на каждой машине

3. **Deployment:**
   - `.env` создаётся **вручную** на production сервере
   - НЕ передаётся через git или scp

4. **Debugging:**
   - Всегда проверяйте логи при старте:
     - `Environment: development` или `production`
     - `Frontend URL: http://...` или `https://...`
   - Эти значения показывают какая конфигурация загружена

---

## Чек-лист настройки

### Локальная машина

- [ ] Файл `backend/.env` существует
- [ ] `NODE_ENV=development`
- [ ] `FRONTEND_URL=http://localhost:5173`
- [ ] YooKassa credentials (test режим)
- [ ] Права: `-rw-r--r--` (644) или `-rw-------` (600)

### Production сервер

- [ ] Файл `/var/www/.../backend/.env` существует
- [ ] `NODE_ENV=production`
- [ ] `FRONTEND_URL=https://your-domain.com`
- [ ] YooKassa credentials (test режим)
- [ ] Права: `-rw-------` (600)
- [ ] Владелец: `www-data:www-data`

---

**Вопросы?** Проверьте логи backend при запуске - они покажут какие значения загружены.
