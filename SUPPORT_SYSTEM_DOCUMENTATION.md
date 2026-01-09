# Документация системы поддержки и жалоб

## Обзор

Система поддержки позволяет пользователям создавать тикеты (жалобы/вопросы), а администраторам — отвечать на них и управлять их статусами. Система поддерживает WebSocket уведомления в реальном времени.

## API Endpoints

### Для пользователей (клиентов)

#### 1. Создать тикет поддержки

**POST** `/support/tickets`

**Авторизация:** Требуется (JWT токен)

**Описание:** Позволяет пользователю создать новый тикет поддержки.

**Тело запроса:**

```json
{
  "subject": "Проблема с заказом #12345",
  "message": "Мой заказ не был доставлен в указанное время. Пожалуйста, помогите разобраться."
}
```

**Валидация:**

- `subject`: строка, 5-255 символов
- `message`: строка, 10-5000 символов

**Ответ (201 Created):**

```json
{
  "id": 1,
  "userId": 5,
  "subject": "Проблема с заказом #12345",
  "message": "Мой заказ не был доставлен в указанное время. Пожалуйста, помогите разобраться.",
  "status": "open",
  "adminResponse": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Пример использования (JavaScript/TypeScript):**

```typescript
const createTicket = async (subject: string, message: string) => {
  const response = await fetch('http://localhost:3000/support/tickets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ subject, message }),
  });

  if (!response.ok) {
    throw new Error('Failed to create ticket');
  }

  return await response.json();
};
```

---

#### 2. Получить все свои тикеты

**GET** `/support/tickets`

**Авторизация:** Требуется (JWT токен)

**Описание:** Получает список всех тикетов текущего пользователя с поддержкой пагинации, фильтрации и сортировки.

**Query параметры:**

- `limit` (опционально): количество тикетов на странице (по умолчанию: 20, максимум: 100)
- `offset` (опционально): количество тикетов для пропуска (по умолчанию: 0)
- `status` (опционально): фильтр по статусу (`open`, `in_progress`, `resolved`, `closed`)
- `sortBy` (опционально): поле для сортировки (`createdAt`, `updatedAt`, `status`, по умолчанию: `createdAt`)
- `sortOrder` (опционально): порядок сортировки (`asc`, `desc`, по умолчанию: `desc`)

**Пример запроса:**

```
GET /support/tickets?limit=20&offset=0&status=open&sortBy=createdAt&sortOrder=desc
```

**Ответ (200 OK):**

```json
{
  "tickets": [
    {
      "id": 1,
      "userId": 5,
      "subject": "Проблема с заказом #12345",
      "message": "Мой заказ не был доставлен...",
      "status": "open",
      "adminResponse": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

**Пример использования:**

```typescript
const getMyTickets = async (filters?: {
  limit?: number;
  offset?: number;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
}) => {
  const params = new URLSearchParams();
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.offset) params.append('offset', filters.offset.toString());
  if (filters?.status) params.append('status', filters.status);

  const response = await fetch(`http://localhost:3000/support/tickets?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
};
```

---

#### 3. Получить один тикет

**GET** `/support/tickets/:id`

**Авторизация:** Требуется (JWT токен)

**Описание:** Получает информацию о конкретном тикете. Пользователь может получить только свои тикеты.

**Параметры пути:**

- `id`: ID тикета (число)

**Ответ (200 OK):**

```json
{
  "id": 1,
  "userId": 5,
  "subject": "Проблема с заказом #12345",
  "message": "Мой заказ не был доставлен...",
  "status": "in_progress",
  "adminResponse": "Спасибо за обращение. Мы проверили ваш заказ...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Ошибки:**

- `404 Not Found`: Тикет не найден или не принадлежит пользователю

---

### Для администраторов

#### 1. Получить все тикеты (Admin)

**GET** `/support/admin/tickets`

**Авторизация:** Требуется (JWT токен + роль admin)

**Описание:** Получает список всех тикетов в системе. Поддерживает пагинацию, фильтрацию и сортировку.

**Query параметры:** (те же, что и для пользователей)

**Ответ (200 OK):**

```json
{
  "tickets": [
    {
      "id": 1,
      "userId": 5,
      "subject": "Проблема с заказом #12345",
      "message": "Мой заказ не был доставлен...",
      "status": "open",
      "adminResponse": null,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 50,
  "limit": 20,
  "offset": 0
}
```

---

#### 2. Получить один тикет (Admin)

**GET** `/support/admin/tickets/:id`

**Авторизация:** Требуется (JWT токен + роль admin)

**Описание:** Получает детальную информацию о конкретном тикете.

**Параметры пути:**

- `id`: ID тикета (число)

---

#### 3. Ответить на тикет (Admin)

**PATCH** `/support/admin/tickets/:id/reply`

**Авторизация:** Требуется (JWT токен + роль admin)

**Описание:** Позволяет администратору ответить на тикет. Статус тикета автоматически изменится на `in_progress`, если он был `open`.

**Параметры пути:**

- `id`: ID тикета (число)

**Тело запроса:**

```json
{
  "response": "Спасибо за обращение. Мы проверили ваш заказ и связались с курьером. Заказ будет доставлен сегодня до 18:00."
}
```

**Валидация:**

- `response`: строка, 10-5000 символов

**Ответ (200 OK):**

```json
{
  "id": 1,
  "userId": 5,
  "subject": "Проблема с заказом #12345",
  "message": "Мой заказ не был доставлен...",
  "status": "in_progress",
  "adminResponse": "Спасибо за обращение. Мы проверили ваш заказ...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Ошибки:**

- `400 Bad Request`: Нельзя ответить на закрытый тикет
- `404 Not Found`: Тикет не найден

**Пример использования:**

```typescript
const replyToTicket = async (ticketId: number, response: string) => {
  const res = await fetch(`http://localhost:3000/support/admin/tickets/${ticketId}/reply`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ response }),
  });

  return await res.json();
};
```

---

#### 4. Изменить статус тикета (Admin)

**PATCH** `/support/admin/tickets/:id/status`

**Авторизация:** Требуется (JWT токен + роль admin)

**Описание:** Позволяет администратору изменить статус тикета.

**Параметры пути:**

- `id`: ID тикета (число)

**Тело запроса:**

```json
{
  "status": "resolved"
}
```

**Возможные статусы:**

- `open` — открыт (новый тикет)
- `in_progress` — в работе (админ ответил)
- `resolved` — решен
- `closed` — закрыт

**Ответ (200 OK):**

```json
{
  "id": 1,
  "userId": 5,
  "subject": "Проблема с заказом #12345",
  "message": "Мой заказ не был доставлен...",
  "status": "resolved",
  "adminResponse": "Спасибо за обращение...",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:30:00.000Z"
}
```

---

## WebSocket события

Система поддерживает WebSocket уведомления в реальном времени.

### Для администраторов

#### 1. Новый тикет создан

**Событие:** `support:ticket_created`

**Описание:** Отправляется всем подключенным администраторам при создании нового тикета пользователем.

**Payload:**

```json
{
  "ticketId": 1,
  "userId": 5,
  "subject": "Проблема с заказом #12345",
  "status": "open",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Пример обработки (JavaScript):**

```javascript
socket.on('support:ticket_created', (data) => {
  console.log('New ticket created:', data);
  // Показать уведомление администратору
  showNotification(`Новый тикет #${data.ticketId}: ${data.subject}`);
  // Обновить список тикетов
  refreshTicketsList();
});
```

---

### Для пользователей

#### 1. Получен ответ на тикет

**Событие:** `support:ticket_replied`

**Описание:** Отправляется пользователю, когда администратор ответил на его тикет.

**Payload:**

```json
{
  "ticketId": 1,
  "userId": 5,
  "response": "Спасибо за обращение. Мы проверили ваш заказ...",
  "status": "in_progress",
  "updatedAt": "2024-01-15T11:00:00.000Z",
  "timestamp": "2024-01-15T11:00:00.000Z"
}
```

**Пример обработки:**

```javascript
socket.on('support:ticket_replied', (data) => {
  // Проверяем, что это наш тикет
  if (data.userId === currentUserId) {
    console.log('Received reply to ticket:', data);
    // Показать уведомление
    showNotification(`Получен ответ на тикет #${data.ticketId}`);
    // Обновить тикет в UI
    updateTicketInUI(data.ticketId, {
      adminResponse: data.response,
      status: data.status,
    });
  }
});
```

---

#### 2. Изменен статус тикета

**Событие:** `support:ticket_status_updated`

**Описание:** Отправляется пользователю, когда администратор изменил статус его тикета.

**Payload:**

```json
{
  "ticketId": 1,
  "userId": 5,
  "status": "resolved",
  "updatedAt": "2024-01-15T11:30:00.000Z",
  "timestamp": "2024-01-15T11:30:00.000Z"
}
```

**Пример обработки:**

```javascript
socket.on('support:ticket_status_updated', (data) => {
  if (data.userId === currentUserId) {
    console.log('Ticket status updated:', data);
    showNotification(`Статус тикета #${data.ticketId} изменен на: ${data.status}`);
    updateTicketStatusInUI(data.ticketId, data.status);
  }
});
```

---

## Интеграция WebSocket (полный пример)

### Для клиентского приложения

```typescript
import { io, Socket } from 'socket.io-client';

class SupportWebSocketService {
  private socket: Socket | null = null;
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  connect() {
    this.socket = io('http://localhost:3000', {
      auth: {
        token: this.token,
      },
    });

    this.socket.on('connect', () => {
      console.log('Connected to WebSocket');
    });

    // Обработка ответа на тикет
    this.socket.on('support:ticket_replied', (data) => {
      if (data.userId === this.getCurrentUserId()) {
        this.onTicketReplied(data);
      }
    });

    // Обработка изменения статуса
    this.socket.on('support:ticket_status_updated', (data) => {
      if (data.userId === this.getCurrentUserId()) {
        this.onTicketStatusUpdated(data);
      }
    });
  }

  private onTicketReplied(data: any) {
    // Показать уведомление
    this.showNotification(`Получен ответ на тикет #${data.ticketId}`);
    // Обновить UI
    this.updateTicket(data.ticketId, {
      adminResponse: data.response,
      status: data.status,
    });
  }

  private onTicketStatusUpdated(data: any) {
    this.showNotification(`Статус тикета #${data.ticketId} изменен`);
    this.updateTicketStatus(data.ticketId, data.status);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}
```

### Для админ-панели

```typescript
class AdminSupportWebSocketService {
  private socket: Socket | null = null;
  private adminToken: string;

  constructor(adminToken: string) {
    this.adminToken = adminToken;
  }

  connect() {
    this.socket = io('http://localhost:3000', {
      auth: {
        token: this.adminToken,
      },
    });

    // Обработка нового тикета
    this.socket.on('support:ticket_created', (data) => {
      this.onNewTicket(data);
    });
  }

  private onNewTicket(data: any) {
    // Показать уведомление
    this.showNotification(`Новый тикет #${data.ticketId}: ${data.subject}`);
    // Обновить список тикетов
    this.refreshTicketsList();
    // Показать звуковое уведомление
    this.playNotificationSound();
  }
}
```

---

## Статусы тикетов

- **`open`** — Тикет только что создан, ожидает ответа администратора
- **`in_progress`** — Администратор ответил на тикет, работа ведется
- **`resolved`** — Проблема решена
- **`closed`** — Тикет закрыт (нельзя ответить)

---

## Рекомендации по реализации UI

### Для клиентского приложения

1. **Страница "Мои обращения"**
   - Список всех тикетов пользователя
   - Фильтрация по статусу
   - Индикатор непрочитанных ответов
   - Кнопка "Создать новое обращение"

2. **Форма создания тикета**
   - Поле "Тема" (subject)
   - Поле "Сообщение" (message)
   - Валидация на фронтенде

3. **Детальная страница тикета**
   - Информация о тикете
   - Сообщение пользователя
   - Ответ администратора (если есть)
   - Статус тикета с цветовой индикацией

4. **Уведомления**
   - Показывать уведомление при получении ответа
   - Обновлять список тикетов в реальном времени
   - Звуковое уведомление (опционально)

### Для админ-панели

1. **Дашборд тикетов**
   - Список всех тикетов с фильтрацией
   - Счетчики по статусам (open, in_progress, resolved, closed)
   - Индикатор новых тикетов

2. **Детальная страница тикета**
   - Информация о пользователе
   - Сообщение пользователя
   - Форма для ответа
   - Выбор статуса
   - История изменений (опционально)

3. **Уведомления**
   - Звуковое уведомление при новом тикете
   - Всплывающее уведомление
   - Обновление счетчиков в реальном времени

---

## Обработка ошибок

### Общие ошибки

- **401 Unauthorized**: Токен отсутствует или невалиден
- **403 Forbidden**: Недостаточно прав (для админских эндпоинтов)
- **404 Not Found**: Тикет не найден
- **400 Bad Request**: Ошибка валидации данных

### Пример обработки ошибок

```typescript
try {
  const ticket = await createTicket(subject, message);
  // Успех
} catch (error) {
  if (error.response?.status === 401) {
    // Перенаправить на страницу входа
    redirectToLogin();
  } else if (error.response?.status === 400) {
    // Показать ошибки валидации
    showValidationErrors(error.response.data);
  } else {
    // Общая ошибка
    showError('Произошла ошибка при создании тикета');
  }
}
```

---

## Тестирование

### Создание тестового тикета

```bash
curl -X POST http://localhost:3000/support/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subject": "Тестовый тикет",
    "message": "Это тестовое сообщение для проверки системы поддержки"
  }'
```

### Получение тикетов пользователя

```bash
curl -X GET "http://localhost:3000/support/tickets?limit=20&offset=0" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Ответ администратора на тикет

```bash
curl -X PATCH http://localhost:3000/support/admin/tickets/1/reply \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "response": "Спасибо за обращение. Мы работаем над решением вашей проблемы."
  }'
```

---

## Заключение

Система поддержки полностью интегрирована в бэкенд и готова к использованию. Все эндпоинты документированы в Swagger UI по адресу `/api-docs`.

Для получения дополнительной информации обратитесь к Swagger документации или свяжитесь с командой разработки.
