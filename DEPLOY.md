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
- **RAM:** 1 GB (минимум)
- **Диск:** 2 GB свободного места
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

**2. Установите зависимости и соберите frontend:**

```bash
cd frontend
npm install
npm run build
# Создается директория frontend/dist/ (~5 MB)
cd ..
```

**3. Установите зависимости и соберите backend:**

```bash
cd backend
npm install
npm run build
# Создается директория backend/dist/
cd ..
```

**4. Создайте файл backend/.env локально:**

```env
# Конфигурация сервера
PORT=3000
NODE_ENV=production

# YooKassa API (ТЕСТОВЫЙ РЕЖИМ)
# Получите учетные данные: https://yookassa.ru/ -> Интеграция -> API
YOOKASSA_SHOP_ID=ваш_shop_id
YOOKASSA_SECRET_KEY=test_ваш_секретный_ключ

# CORS
FRONTEND_URL=https://ваш-домен.com

# Логирование
LOG_LEVEL=info
```

**ВАЖНО:**
- Используйте только тестовые ключи (начинаются с `test_`)
- Никогда не используйте продакшн-ключи в демо-приложении

---

### Загрузка на сервер

**ВАЖНО:** Все команды на сервере выполняются из-под root (после `ssh root@your-server`).

**1. Создайте структуру директорий на сервере:**

```bash
mkdir -p /var/www/alexanderlapygin.com/html/showcase/sbp-payment/frontend
mkdir -p /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend
```

**2. Загрузите файлы с локальной машины (выполняйте локально):**

```bash
# Frontend - только собранная статика
scp -r frontend/dist/ root@your-server:/var/www/alexanderlapygin.com/html/showcase/sbp-payment/frontend/

# Backend - собранный код
scp -r backend/dist/ root@your-server:/var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/

# Backend - package.json и .env
scp backend/package.json root@your-server:/var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/
scp backend/package-lock.json root@your-server:/var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/
scp backend/.env root@your-server:/var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/
```

**3. На сервере установите зависимости:**

```bash
# Установить только production зависимости backend
cd /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend
npm ci --omit=dev

# Вернуться
cd /var/www/alexanderlapygin.com/html/showcase/sbp-payment
```

**4. Настройте права доступа для Nginx:**

```bash
# Установить владельца www-data для всех файлов
chown -R www-data:www-data /var/www/alexanderlapygin.com/html/showcase/sbp-payment

# Ограничить доступ к .env файлу
chmod 600 /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/.env
```

**Итоговая структура на сервере:**

```
/var/www/alexanderlapygin.com/html/showcase/sbp-payment/
├── backend/
│   ├── dist/              # Собранный backend код
│   ├── node_modules/      # Только production зависимости (~150 MB)
│   ├── package.json
│   ├── package-lock.json
│   └── .env               # Конфигурация
└── frontend/
    └── dist/              # Собранная статика (~5 MB)
```

**Преимущества этого подхода:**
- ✅ Минимальный размер на сервере (~160 MB вместо ~500 MB)
- ✅ Нет исходного кода на production
- ✅ Нет dev-зависимостей
- ✅ Быстрая загрузка и обновление
- ✅ Прямая загрузка файлов из-под root без промежуточных перемещений

---

## Конфигурация Nginx

### 1. Создание конфигурационного файла

```bash
nano /etc/nginx/sites-available/sbp-payment
```

### 2. Базовая конфигурация (HTTP)

```nginx
server {
    listen 80;
    server_name ваш-домен.com www.ваш-домен.com;

    # Логи
    access_log /var/log/nginx/sbp-payment-access.log;
    error_log /var/log/nginx/sbp-payment-error.log;

    # Frontend - статические файлы
    location / {
        root /var/www/alexanderlapygin.com/html/showcase/sbp-payment/frontend/dist;
        try_files $uri $uri/ /index.html;

        # Кэширование статики
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # Backend API - проксирование
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;

        # Заголовки
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Таймауты
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Отключить кэширование API
        proxy_cache_bypass $http_upgrade;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Безопасность
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

### 3. Включение сайта

```bash
# Создать символическую ссылку
ln -s /etc/nginx/sites-available/sbp-payment /etc/nginx/sites-enabled/

# Удалить дефолтный сайт (опционально)
rm /etc/nginx/sites-enabled/default

# Проверить конфигурацию
nginx -t

# Перезагрузить Nginx
systemctl reload nginx
```

### 4. SSL/HTTPS с Let's Encrypt (рекомендуется)

```bash
# Установить Certbot
apt-get install -y certbot python3-certbot-nginx

# Получить сертификат
certbot --nginx -d ваш-домен.com -d www.ваш-домен.com

# Автоматическое продление (уже настроено)
certbot renew --dry-run
```

После установки SSL, Nginx автоматически обновит конфигурацию.

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
WorkingDirectory=/var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend

# Команда запуска
ExecStart=/usr/bin/node dist/server.js

# Перезапуск при падении
Restart=always
RestartSec=10

# Переменные окружения
Environment=NODE_ENV=production
EnvironmentFile=/var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/.env

# Логи
StandardOutput=journal
StandardError=journal
SyslogIdentifier=sbp-backend

# Ограничения (опционально)
LimitNOFILE=4096

[Install]
WantedBy=multi-user.target
```

### 3. Настройка прав доступа

**ВАЖНО:** Права уже должны быть настроены после шага "Загрузка на сервер", но проверьте еще раз:

```bash
# Сделать www-data владельцем директорий
chown -R www-data:www-data /var/www/alexanderlapygin.com/html/showcase/sbp-payment

# Права на .env (только чтение владельцем)
chmod 600 /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/.env
```

### 4. Запуск службы

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

### 5. Управление службой

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
cd /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend

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
ls -la /var/www/alexanderlapygin.com/html/showcase/sbp-payment/frontend/dist/
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
scp -r frontend/dist/ root@your-server:/var/www/alexanderlapygin.com/html/showcase/sbp-payment/frontend/dist-new
scp -r backend/dist/ root@your-server:/var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/dist-new
scp backend/package.json root@your-server:/var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/
scp backend/package-lock.json root@your-server:/var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/
```

**На сервере:**

```bash
# Остановить backend
systemctl stop sbp-backend
# или
pm2 stop sbp-backend

# Заменить frontend
rm -rf /var/www/alexanderlapygin.com/html/showcase/sbp-payment/frontend/dist
mv /var/www/alexanderlapygin.com/html/showcase/sbp-payment/frontend/dist-new /var/www/alexanderlapygin.com/html/showcase/sbp-payment/frontend/dist

# Заменить backend
rm -rf /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/dist
mv /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/dist-new /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/dist

# Обновить зависимости backend (если изменились)
cd /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend
npm ci --omit=dev

# Настроить права доступа
chown -R www-data:www-data /var/www/alexanderlapygin.com/html/showcase/sbp-payment

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
cp /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/.env /root/backup-env
```

5. **Ограничение прав:**
```bash
# Убедиться что файлы принадлежат www-data
chown -R www-data:www-data /var/www/alexanderlapygin.com/html/showcase/sbp-payment
chmod 600 /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/.env
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
ls -la /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/.env

# 3. Неправильные права
chown www-data:www-data /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/.env
chmod 600 /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/.env
```

### Frontend не загружается

```bash
# Проверить Nginx
nginx -t
systemctl status nginx

# Проверить файлы
ls -la /var/www/alexanderlapygin.com/html/showcase/sbp-payment/frontend/dist/

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
cat /var/www/alexanderlapygin.com/html/showcase/sbp-payment/backend/.env

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
- [ ] Собран frontend (npm run build)
- [ ] Собран backend (npm run build)
- [ ] Создан файл backend/.env с учетными данными
- [ ] Файлы загружены на сервер (scp)

**На сервере:**
- [ ] Установлен Node.js 22.x LTS
- [ ] Создана структура директорий /var/www/alexanderlapygin.com/html/showcase/sbp-payment
- [ ] Файлы перемещены в правильные директории
- [ ] Установлены production зависимости backend
- [ ] Настроен Nginx
- [ ] Создана служба systemd или PM2
- [ ] Backend запущен и работает
- [ ] SSL сертификат установлен (Let's Encrypt)
- [ ] Файрвол настроен (UFW)
- [ ] Права доступа настроены (www-data)
- [ ] Проверена работа через браузер
- [ ] Настроены логи и мониторинг

---

**Успешного развертывания!** 🚀
