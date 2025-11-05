# Руководство по развертыванию приложения SBP Payment Demo

## Описание приложения

**SBP Payment Demo** — демонстрационное веб-приложение для интеграции с платежной системой YooKassa через Систему Быстрых Платежей (СБП).

### Архитектура

- **Frontend:** React 18 + TypeScript + Vite (статические файлы)
- **Backend:** Node.js 22 + Fastify (REST API)
- **База данных:** In-memory хранилище (для демо, без БД)
- **API:** YooKassa test API

### Компоненты

1. **Frontend (порт 5173 в dev, статика в prod):**
   - Форма создания платежа
   - Отображение QR-кода для оплаты
   - Мониторинг статуса платежа в реальном времени

2. **Backend (порт 3000):**
   - POST `/api/payments` - создание платежа
   - GET `/api/payments/:id` - получение статуса (опрос YooKassa API)
   - POST `/api/webhooks/yookassa` - обработка вебхуков

3. **Интеграция:**
   - YooKassa API v3
   - Тип подтверждения: redirect (перенаправление на страницу оплаты)
   - Только тестовый режим

---

## Требования к серверу

### Системные требования

- **ОС:** Ubuntu 20.04 LTS или новее
- **Процессор:** 1 CPU (минимум)
- **RAM:** 512 MB (минимум, рекомендуется 1 GB)
- **Диск:** 100 MB свободного места (~10 MB для приложения + буфер)
- **Сеть:** Публичный IP-адрес

### Необходимое ПО

**На сервере должно быть установлено (из-под root):**

```bash
# Node.js 22.x LTS
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

# PM2 (опционально, для управления процессами)
npm install -g pm2
```

**Примечание:** Nginx должен быть уже установлен на VPS.

### Проверка установки

```bash
node --version  # должно быть v22.x.x (LTS)
npm --version   # должно быть 10.x.x
nginx -v        # любая версия
```

---

## Подготовка к развертыванию

### Сборка на локальной машине

**1. Клонируйте репозиторий локально:**

```bash
git clone https://github.com/aiaiai-copilot/showcase-sbp-payment-fullstack.git
cd showcase-sbp-payment-fullstack
```

**2. Настройте base path для frontend:**

Frontend будет развернут в поддиректории `/showcase/payments/sbp/`, поэтому нужно настроить Vite:

```bash
cd frontend
```

Откройте `vite.config.ts` и добавьте параметр `base`:

```typescript
export default defineConfig({
  base: '/showcase/payments/sbp/',  // <-- Добавьте эту строку
  plugins: [react()],
  // ... остальные настройки
});
```

Сохраните файл.

**3. Установите зависимости и соберите frontend:**

```bash
npm install
npm run build
# Создается директория frontend/dist/ (~5 MB)
cd ..
```

**Важно:** Все ссылки и assets в собранном приложении будут использовать префикс `/showcase/payments/sbp/`.

**4. Установите зависимости и соберите backend:**

```bash
cd backend
npm install
npm run build
# Создается директория backend/dist/ с забандленным server.js (~2-3 MB)
cd ..
```

**Примечание:** Файл `.env` с секретными ключами НЕ создаётся локально. Он будет создан напрямую на сервере для безопасности.

---

### Загрузка на сервер

**ВАЖНО:** Все команды на сервере выполняются из-под root (после `ssh root@your-server`).

**1. Создайте структуру директорий на сервере:**

```bash
mkdir -p /var/www/alexanderlapygin.com/html/showcase/payments/sbp/frontend
mkdir -p /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend
```

**2. Загрузите файлы с локальной машины (выполняйте локально):**

```bash
# Frontend - только собранная статика
scp -r frontend/dist/ root@your-server:/var/www/alexanderlapygin.com/html/showcase/payments/sbp/frontend/

# Backend - собранный и забандленный код (один файл!)
scp -r backend/dist/ root@your-server:/var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/
```

**Важно:** Благодаря бандлингу esbuild, backend/dist/server.js содержит весь код вместе с зависимостями. package.json и node_modules на сервере НЕ нужны!

**3. Создайте файл .env на сервере (НЕ передавайте через scp!):**

**На сервере:**

```bash
nano /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env
```

Вставьте конфигурацию:

```env
# Конфигурация сервера
PORT=3000
NODE_ENV=production

# YooKassa API (ТЕСТОВЫЙ РЕЖИМ)
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=test_ваш_секретный_ключ

# CORS
FRONTEND_URL=https://alexanderlapygin.com

# Логирование
LOG_LEVEL=info
```

Сохраните файл (`Ctrl+O`, `Enter`, `Ctrl+X`).

**Почему НЕ через scp:**
- ✅ Секреты не передаются по сети
- ✅ Не попадают в историю команд shell
- ✅ Можно использовать разные ключи для разных серверов

**4. Настройте права доступа для Nginx:**

```bash
# Установить владельца www-data для всех файлов
chown -R www-data:www-data /var/www/alexanderlapygin.com/html/showcase/payments/sbp

# Ограничить доступ к .env файлу
chmod 600 /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env
```

**Итоговая структура на сервере:**

```
/var/www/alexanderlapygin.com/html/showcase/payments/sbp/
├── backend/
│   ├── dist/
│   │   ├── server.js      # Забандленный backend код со всеми зависимостями (~2-3 MB)
│   │   └── server.js.map  # Source map для отладки
│   └── .env               # Конфигурация
└── frontend/
    └── dist/              # Собранная статика (~5 MB)
```

**Преимущества этого подхода:**
- ✅ Минимальный размер на сервере (~10 MB вместо ~160 MB)
- ✅ Нет исходного кода на production
- ✅ Нет node_modules (~150 MB экономии)
- ✅ Нет package.json и package-lock.json
- ✅ НЕ нужен npm на production сервере
- ✅ Быстрая загрузка (один файл ~2MB вместо тысяч файлов)
- ✅ Быстрый старт приложения (меньше I/O операций)
- ✅ Прямая загрузка файлов из-под root без промежуточных перемещений

---

## Конфигурация Nginx

**ВАЖНО:** Приложение разворачивается на существующем домене `alexanderlapygin.com` в поддиректории `/showcase/payments/sbp/`. Не нужно создавать новый server block!

### 1. Структура URL

После развертывания приложение будет доступно по адресам:
- **Frontend:** `https://alexanderlapygin.com/showcase/payments/sbp/`
- **Backend API:** `https://alexanderlapygin.com/api/`

Frontend уже обслуживается существующей конфигурацией Nginx:
```nginx
root /var/www/alexanderlapygin.com/html;
location / {
    try_files $uri $uri/ /index.html;
}
```

Файлы frontend находятся в `/var/www/alexanderlapygin.com/html/showcase/payments/sbp/` и автоматически доступны через Nginx.

### 2. Добавление проксирования Backend API

Откройте существующий конфигурационный файл:

```bash
nano /etc/nginx/sites-enabled/alexanderlapygin.com.conf
```

Найдите блок `server` со строкой `listen 443 ssl;` и **добавьте** следующий location **перед** существующим `location /`:

```nginx
server {
    server_name alexanderlapygin.com www.alexanderlapygin.com;

    # ... существующие настройки ...

    # Backend API для SBP Payment Demo
    location ^~ /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # Заголовки
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Отключить кэширование API
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }

    # ... остальные существующие location ...
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**Примечание:** Используйте `^~` модификатор для location `/api/` чтобы он имел приоритет над `location /`.

### 3. Применение изменений

```bash
# Проверить конфигурацию на ошибки
nginx -t

# Если всё ОК, перезагрузить Nginx
systemctl reload nginx
```

### 4. Проверка конфигурации

```bash
# Проверить что backend API доступен
curl http://localhost:3000/health

# Проверить что проксирование работает
curl https://alexanderlapygin.com/api/health
```

**SSL уже настроен** через Let's Encrypt для домена alexanderlapygin.com, дополнительная настройка не требуется.

---

## Настройка Backend как службы systemd

### 1. Создание service файла

```bash
nano /etc/systemd/system/sbp-backend.service
```

### 2. Содержимое файла

```ini
[Unit]
Description=SBP Payment Demo - Backend API
Documentation=https://github.com/aiaiai-copilot/showcase-sbp-payment-fullstack
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend

# Команда запуска
ExecStart=/usr/bin/node dist/server.js

# Перезапуск при падении
Restart=always
RestartSec=10

# Переменные окружения
Environment=NODE_ENV=production
EnvironmentFile=/var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env

# Логи
StandardOutput=journal
StandardError=journal
SyslogIdentifier=sbp-backend

# Ограничения (опционально)
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
```

### 3. Запуск службы

**Важно:** Убедитесь что права доступа настроены (шаг 4 из "Загрузка на сервер").

```bash
# Перезагрузить systemd
systemctl daemon-reload

# Включить автозапуск
systemctl enable sbp-backend

# Запустить службу
systemctl start sbp-backend

# Проверить статус
systemctl status sbp-backend
```

### 4. Управление службой

```bash
# Остановить
systemctl stop sbp-backend

# Перезапустить
systemctl restart sbp-backend

# Просмотр логов
journalctl -u sbp-backend -f

# Последние 100 строк логов
journalctl -u sbp-backend -n 100
```

---

## Альтернатива: PM2 (вместо systemd)

### 1. Установка и запуск

```bash
cd /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend

# Запуск приложения
pm2 start dist/server.js --name sbp-backend

# Сохранить список процессов
pm2 save

# Автозапуск при перезагрузке
pm2 startup systemd
# Выполните команду, которую выведет pm2
```

### 2. Управление

```bash
# Статус
pm2 status

# Логи
pm2 logs sbp-backend

# Перезапуск
pm2 restart sbp-backend

# Остановка
pm2 stop sbp-backend

# Удаление
pm2 delete sbp-backend
```

---

## Проверка установки

### 1. Проверка Backend

```bash
# Проверить запущен ли процесс
systemctl status sbp-backend
# или
pm2 status

# Проверить порт
curl http://localhost:3000/health
# Ожидаемый ответ: {"status":"ok","timestamp":"..."}

# Проверить логи
journalctl -u sbp-backend -n 50
```

### 2. Проверка Frontend

```bash
# Проверить файлы собраны
ls -la /var/www/alexanderlapygin.com/html/showcase/payments/sbp/frontend/dist/
# Должны быть: index.html, assets/, и др.

# Проверить Nginx
nginx -t
curl http://localhost/
```

### 3. Проверка через браузер

1. Откройте `http://ваш-домен.com`
2. Должна загрузиться форма оплаты
3. Введите сумму (например, 100)
4. Нажмите "Pay 100 ₽"
5. Должен появиться QR-код
6. Попробуйте оплатить через банковское приложение (тестовый режим)

### 4. Проверка API

```bash
# Создание платежа
curl -X POST http://ваш-домен.com/api/payments \
  -H "Content-Type: application/json" \
  -d '{"amount":100}'

# Должен вернуть JSON с id, status, confirmation_url
```

---

## Мониторинг и обслуживание

### Логи

```bash
# Backend логи (systemd)
journalctl -u sbp-backend -f

# Backend логи (PM2)
pm2 logs sbp-backend

# Nginx логи
tail -f /var/log/nginx/sbp-payment-access.log
tail -f /var/log/nginx/sbp-payment-error.log

# Системные логи
journalctl -xe
```

### Мониторинг ресурсов

```bash
# Использование CPU и памяти
htop
# или
top

# PM2 мониторинг
pm2 monit

# Использование диска
df -h
```

### Обновление приложения

**На локальной машине:**

```bash
cd showcase-sbp-payment-fullstack

# Получить обновления
git pull

# Пересобрать frontend
cd frontend
npm install
npm run build
cd ..

# Пересобрать backend
cd backend
npm install
npm run build
cd ..

# Загрузить обновленные файлы
scp -r frontend/dist/ root@your-server:/var/www/alexanderlapygin.com/html/showcase/payments/sbp/frontend/dist-new
scp -r backend/dist/ root@your-server:/var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/dist-new
```

**На сервере:**

```bash
# Остановить backend
systemctl stop sbp-backend
# или
pm2 stop sbp-backend

# Заменить frontend
rm -rf /var/www/alexanderlapygin.com/html/showcase/payments/sbp/frontend/dist
mv /var/www/alexanderlapygin.com/html/showcase/payments/sbp/frontend/dist-new /var/www/alexanderlapygin.com/html/showcase/payments/sbp/frontend/dist

# Заменить backend
rm -rf /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/dist
mv /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/dist-new /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/dist

# Настроить права доступа
chown -R www-data:www-data /var/www/alexanderlapygin.com/html/showcase/payments/sbp

# Запустить backend
systemctl start sbp-backend
# или
pm2 restart sbp-backend

# Перезагрузить Nginx (если нужно)
systemctl reload nginx
```

---

## Безопасность

### Рекомендации

1. **Файрвол (UFW):**
```bash
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
```

2. **Закрыть порт 3000:**
Backend должен быть доступен только через Nginx, не напрямую:
```bash
# Порт 3000 НЕ должен быть открыт публично
ufw status
```

3. **Регулярные обновления:**
```bash
apt-get update
apt-get upgrade -y
```

4. **Backup .env файла:**
```bash
# Создать резервную копию
cp /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env /root/backup-env
```

5. **Ограничение прав:**
```bash
# Убедиться что файлы принадлежат www-data
chown -R www-data:www-data /var/www/alexanderlapygin.com/html/showcase/payments/sbp
chmod 600 /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env
```

---

## Устранение неполадок

### Backend не запускается

```bash
# Проверить логи
journalctl -u sbp-backend -n 100

# Типичные проблемы:
# 1. Порт 3000 занят
lsof -i :3000
# Убить процесс если нужно
kill -9 <PID>

# 2. Отсутствует .env
ls -la /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env

# 3. Неправильные права
chown www-data:www-data /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env
chmod 600 /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env
```

### Frontend не загружается

```bash
# Проверить Nginx
nginx -t
systemctl status nginx

# Проверить файлы
ls -la /var/www/alexanderlapygin.com/html/showcase/payments/sbp/frontend/dist/

# Проверить логи Nginx
tail -f /var/log/nginx/sbp-payment-error.log
```

### API не отвечает

```bash
# Проверить backend работает
curl http://localhost:3000/health

# Проверить Nginx проксирование
curl http://localhost/api/payments
# или
curl http://ваш-домен.com/api/payments
```

### Ошибки YooKassa API

```bash
# Проверить .env
cat /var/www/alexanderlapygin.com/html/showcase/payments/sbp/backend/.env

# Проверить ключ начинается с test_
# Проверить shop_id корректный

# Проверить доступность YooKassa API
curl https://api.yookassa.ru/v3
```

---

## Производительность

### Рекомендации для production

1. **Node.js кластеризация (если нужна высокая нагрузка):**
   - Использовать PM2 в режиме cluster: `pm2 start dist/server.js -i max`

2. **Nginx кэширование:**
   - Настроить proxy_cache для статических ответов API

3. **CDN для статики:**
   - Разместить frontend/dist на CDN

4. **Мониторинг:**
   - Установить Prometheus + Grafana
   - Настроить алерты при падении

---

## Контакты и поддержка

- **Репозиторий:** https://github.com/aiaiai-copilot/showcase-sbp-payment-fullstack
- **Документация YooKassa:** https://yookassa.ru/developers/api
- **Issues:** https://github.com/aiaiai-copilot/showcase-sbp-payment-fullstack/issues

---

## Чеклист развертывания

**Локально:**
- [ ] Клонирован репозиторий
- [ ] Настроен Vite base path (`/showcase/payments/sbp/`)
- [ ] Собран frontend (npm run build)
- [ ] Собран backend с бандлингом (npm run build)
- [ ] Файлы загружены на сервер (scp)

**На сервере:**
- [ ] Установлен Node.js 22.x LTS
- [ ] Создана структура директорий в /var/www/alexanderlapygin.com/html/showcase/payments/sbp/
- [ ] Создан файл .env с YooKassa ключами
- [ ] Настроен Nginx (добавлен location /api/)
- [ ] Создана служба systemd или PM2
- [ ] Права доступа настроены (www-data)
- [ ] Backend запущен и работает
- [ ] Проверена работа через браузер
- [ ] Настроены логи и мониторинг

**Примечания:**
- SSL сертификат уже настроен для alexanderlapygin.com
- Файрвол (UFW) настраивается по необходимости
- node_modules НЕ нужны благодаря бандлингу

---

**Успешного развертывания!** 🚀
