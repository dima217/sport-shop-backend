# Документация для разработки веб-приложения кладовщика/администратора

## Обзор

Это полная техническая документация для разработки веб-приложения управления складом и заказами для интернет-магазина спортивных товаров. Приложение предназначено для кладовщиков и администраторов, которые управляют каталогом товаров, категориями, заказами и отслеживают статистику.

## Технические требования

### Рекомендуемый технологический стек

- **Frontend Framework**: React (с TypeScript) или Vue.js
- **State Management**: Redux Toolkit / Zustand / Pinia
- **HTTP Client**: Axios / Fetch API
- **UI Framework**: Material-UI / Ant Design / Tailwind CSS
- **Routing**: React Router / Vue Router
- **Form Handling**: React Hook Form / Formik / VeeValidate
- **Date/Time**: date-fns / dayjs
- **Charts/Graphs**: Recharts / Chart.js / ApexCharts (для статистики)

### Требования к браузеру

- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Поддержка ES6+
- Разрешение экрана: минимум 1280x720 (рекомендуется 1920x1080)

## Аутентификация и авторизация

### Base URL

```
http://84.201.188.209:3000
```

или

```
http://localhost:3000 (для разработки)
```

### Заголовки запросов

Все запросы к защищенным эндпоинтам должны включать:

```
Authorization: Bearer {accessToken}
Content-Type: application/json
```

### Получение токена доступа

#### POST /auth/login

**Описание**: Вход в систему администратора/кладовщика

**Request Body**:

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response 200**:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "profile": {
      "id": "1",
      "firstName": "Иван",
      "lastName": "Иванов"
    }
  }
}
```

**Response 401**: Неверные учетные данные

**Важно**:

- Токен действителен 30 дней
- Сохраняйте токен в localStorage или sessionStorage
- При 401 ошибке перенаправляйте на страницу входа

---

## 1. Управление категориями

### 1.1 Получить все категории

**GET** `/categories`

**Описание**: Получить список всех категорий с количеством товаров

**Query Parameters** (опционально):

- `limit?: number` - количество результатов
- `offset?: number` - смещение для пагинации

**Response 200**:

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Одежда",
    "image": "https://example.com/category-image.jpg",
    "slug": "odezhda",
    "parentId": null,
    "productCount": 45
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "name": "Обувь",
    "image": "https://example.com/shoes.jpg",
    "slug": "obuv",
    "parentId": null,
    "productCount": 32
  }
]
```

**Использование в UI**:

- Отобразить список категорий в таблице или карточках
- Показать количество товаров в каждой категории
- Реализовать пагинацию, если категорий много

---

### 1.2 Получить категорию по ID

**GET** `/categories/{categoryId}`

**Описание**: Получить детальную информацию о категории

**Path Parameters**:

- `categoryId` (string, UUID) - ID категории

**Response 200**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Одежда",
  "image": "https://example.com/category-image.jpg",
  "slug": "odezhda",
  "parentId": null,
  "products": [
    {
      "id": "product-uuid-1",
      "name": "Футболка Nike",
      "price": 2990
    }
  ]
}
```

**Response 404**: Категория не найдена

---

### 1.3 Создать категорию

**POST** `/categories`

**Требуется авторизация**: Да (Admin)

**Request Body**:

```json
{
  "name": "Аксессуары",
  "image": "https://example.com/accessories.jpg",
  "slug": "aksessuary",
  "parentId": null
}
```

**Валидация**:

- `name` (string, required) - название категории
- `image` (string, required, URL) - URL изображения категории
- `slug` (string, required, unique) - URL-friendly идентификатор (латиница, без пробелов)
- `parentId` (string, UUID, optional) - ID родительской категории (для вложенных категорий)

**Response 201**:

```json
{
  "id": "323e4567-e89b-12d3-a456-426614174002",
  "name": "Аксессуары",
  "image": "https://example.com/accessories.jpg",
  "slug": "aksessuary",
  "parentId": null
}
```

**Response 400**: Ошибка валидации
**Response 401**: Не авторизован
**Response 403**: Нет прав администратора

**Использование в UI**:

- Форма создания категории с полями: название, изображение (URL или загрузка), slug
- Валидация slug (только латиница, дефисы, без пробелов)
- Опциональный выбор родительской категории (dropdown)

---

### 1.4 Обновить категорию

**PATCH** `/categories/{categoryId}`

**Требуется авторизация**: Да (Admin)

**Path Parameters**:

- `categoryId` (string, UUID) - ID категории

**Request Body** (все поля опциональны):

```json
{
  "name": "Одежда и аксессуары",
  "image": "https://example.com/new-image.jpg",
  "slug": "odezhda-aksessuary",
  "parentId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Response 200**: Обновленная категория
**Response 404**: Категория не найдена

**Использование в UI**:

- Форма редактирования с предзаполненными данными
- Возможность изменить любое поле

---

### 1.5 Удалить категорию

**DELETE** `/categories/{categoryId}`

**Требуется авторизация**: Да (Admin)

**Path Parameters**:

- `categoryId` (string, UUID) - ID категории

**Response 200**: Успешное удаление
**Response 404**: Категория не найдена

**Важно**:

- При удалении категории товары в ней могут остаться без категории (зависит от реализации бэкенда)
- Показывать предупреждение перед удалением

---

## 2. Управление товарами

### 2.1 Получить список товаров (с фильтрацией)

**GET** `/products`

**Описание**: Получить список товаров с расширенной фильтрацией, поиском и пагинацией

**Query Parameters** (все опциональны):

**Поиск:**

- `search?: string` - поиск по названию, описанию, бренду, SKU

**Фильтры:**

- `categoryId?: string` (UUID) - фильтр по категории (ID)
- `categorySlug?: string` - фильтр по категории (slug)
- `minPrice?: number` - минимальная цена
- `maxPrice?: number` - максимальная цена
- `brands?: string[]` - массив брендов (например: `?brands[]=Nike&brands[]=Adidas`)
- `sizes?: string[]` - массив размеров
- `colors?: string[]` - массив цветов
- `minRating?: number` (0-5) - минимальный рейтинг
- `inStock?: boolean` - только товары в наличии

**Сортировка:**

- `sortBy?: 'price' | 'rating' | 'name' | 'reviewCount' | 'createdAt'` - поле для сортировки
- `sortOrder?: 'asc' | 'desc'` - порядок сортировки

**Пагинация:**

- `limit?: number` (1-100, default: 20) - количество результатов
- `offset?: number` (default: 0) - смещение

**Примеры запросов**:

```
GET /products?categorySlug=odezhda&brands[]=Nike&minPrice=2000&maxPrice=5000&sortBy=price&sortOrder=asc&limit=20&offset=0
GET /products?search=кроссовки&inStock=true
GET /products?sizes[]=M&sizes[]=L&colors[]=Черный
```

**Response 200**:

```json
{
  "products": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Футболка спортивная Nike Dri-FIT",
      "description": "Дышащая футболка с технологией Dri-FIT",
      "price": 2990,
      "oldPrice": 3990,
      "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
      "categoryId": "cat-uuid-1",
      "category": {
        "id": "cat-uuid-1",
        "name": "Одежда"
      },
      "rating": 4.5,
      "reviewCount": 23,
      "inStock": true,
      "stockQuantity": 50,
      "sizes": ["S", "M", "L", "XL"],
      "colors": ["Черный", "Белый"],
      "brand": "Nike",
      "sku": "NKE-TSH-001",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z"
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

**Использование в UI**:

- Таблица товаров с колонками: название, категория, цена, количество на складе, статус, действия
- Панель фильтров: категория, бренд, цена, размер, цвет, наличие
- Поисковая строка
- Сортировка по колонкам
- Пагинация внизу таблицы
- Кнопки действий: редактировать, удалить, просмотреть

---

### 2.2 Получить товар по ID

**GET** `/products/{productId}`

**Path Parameters**:

- `productId` (string, UUID) - ID товара

**Response 200**: Полная информация о товаре (та же структура, что в списке)
**Response 404**: Товар не найден

---

### 2.3 Создать товар

**POST** `/products`

**Требуется авторизация**: Да (Admin)

**Request Body**:

```json
{
  "name": "Футбольный мяч Adidas",
  "description": "Профессиональный футбольный мяч для игры на поле",
  "price": 8990,
  "oldPrice": 10990,
  "images": ["https://example.com/ball1.jpg", "https://example.com/ball2.jpg"],
  "categoryId": "123e4567-e89b-12d3-a456-426614174000",
  "inStock": true,
  "stockQuantity": 25,
  "sizes": null,
  "colors": ["Белый", "Черный"],
  "brand": "Adidas",
  "sku": "AD-FB-001"
}
```

**Валидация**:

- `name` (string, required) - название товара
- `description` (string, required) - описание
- `price` (number, required, min: 0) - текущая цена в рублях (целое число)
- `oldPrice` (number, optional, min: 0) - старая цена (для скидок)
- `images` (string[], required, min: 1) - массив URL изображений
- `categoryId` (string, UUID, required) - ID категории
- `inStock` (boolean, optional, default: true) - есть ли в наличии
- `stockQuantity` (number, optional, min: 0) - количество на складе
- `sizes` (string[], optional) - доступные размеры
- `colors` (string[], optional) - доступные цвета
- `brand` (string, optional) - бренд
- `sku` (string, required) - артикул товара (уникальный)

**Response 201**: Созданный товар
**Response 400**: Ошибка валидации
**Response 401**: Не авторизован
**Response 403**: Нет прав администратора

**Использование в UI**:

- Форма создания товара с разделами:
  - Основная информация: название, описание, категория, SKU
  - Цены: текущая цена, старая цена (для скидки)
  - Изображения: загрузка или ввод URL (минимум 1)
  - Характеристики: бренд, размеры (мультиселект), цвета (мультиселект)
  - Склад: наличие, количество на складе
- Валидация всех полей
- Предпросмотр изображений

---

### 2.4 Обновить товар

**PATCH** `/products/{productId}`

**Требуется авторизация**: Да (Admin)

**Path Parameters**:

- `productId` (string, UUID) - ID товара

**Request Body** (все поля опциональны):

```json
{
  "name": "Футбольный мяч Adidas Pro",
  "price": 7990,
  "oldPrice": 9990,
  "stockQuantity": 30,
  "inStock": true,
  "images": ["https://example.com/new-ball1.jpg"]
}
```

**Response 200**: Обновленный товар
**Response 404**: Товар не найден

**Использование в UI**:

- Форма редактирования с предзаполненными данными
- Возможность изменить любое поле
- Кнопка "Сохранить изменения"

---

### 2.5 Удалить товар

**DELETE** `/products/{productId}`

**Требуется авторизация**: Да (Admin)

**Path Parameters**:

- `productId` (string, UUID) - ID товара

**Response 200**: Успешное удаление
**Response 404**: Товар не найден

**Использование в UI**:

- Кнопка удаления в таблице товаров
- Подтверждение перед удалением (модальное окно)
- После удаления обновить список товаров

---

### 2.6 Установить скидку на товар

**PATCH** `/products/{productId}/discount`

**Требуется авторизация**: Да (Admin)

**Path Parameters**:

- `productId` (string, UUID) - ID товара

**Request Body**:

```json
{
  "discountPercent": 25,
  "oldPrice": 10990
}
```

**Валидация**:

- `discountPercent` (number, required, 0-100) - процент скидки
- `oldPrice` (number, optional, min: 0) - старая цена в рублях (если не указана, будет рассчитана автоматически)

**Логика работы**:

- Если `oldPrice` указана: используется как старая цена, новая цена рассчитывается со скидкой
- Если `oldPrice` не указана: текущая цена становится старой ценой, рассчитывается новая цена со скидкой
- Формула: `новая_цена = старая_цена * (1 - discountPercent / 100)`

**Response 200**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Футбольный мяч Adidas",
  "price": 8243,
  "oldPrice": 10990
  // ... другие поля
}
```

**Response 400**: Ошибка валидации (неверный процент скидки)
**Response 401**: Не авторизован
**Response 403**: Нет прав администратора
**Response 404**: Товар не найден

**Использование в UI**:

- Кнопка "Установить скидку" в таблице товаров или на странице товара
- Модальное окно с формой:
  - Поле "Процент скидки" (0-100)
  - Опциональное поле "Старая цена" (если не указана, будет рассчитана)
  - Предпросмотр новой цены
- После установки скидки товар отображается с перечеркнутой старой ценой

**Примеры**:

1. Установить скидку 25% на товар стоимостью 10000 руб:

   ```json
   {
     "discountPercent": 25
   }
   ```

   Результат: `oldPrice = 10000`, `price = 7500`

2. Установить скидку 20% с указанием старой цены:
   ```json
   {
     "discountPercent": 20,
     "oldPrice": 10000
   }
   ```
   Результат: `oldPrice = 10000`, `price = 8000`

---

### 2.7 Удалить скидку с товара

**PATCH** `/products/{productId}/discount/remove`

**Требуется авторизация**: Да (Admin)

**Path Parameters**:

- `productId` (string, UUID) - ID товара

**Request Body**: Отсутствует

**Response 200**:

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Футбольный мяч Adidas",
  "price": 10990,
  "oldPrice": null
  // ... другие поля
}
```

**Response 401**: Не авторизован
**Response 403**: Нет прав администратора
**Response 404**: Товар не найден

**Использование в UI**:

- Кнопка "Удалить скидку" на товаре со скидкой
- Подтверждение перед удалением
- После удаления цена восстанавливается до старой цены, поле `oldPrice` очищается

---

## 3. Управление заказами

### 3.1 Получить все заказы (для админа)

**GET** `/orders/admin/all`

**Требуется авторизация**: Да (Admin)

**Query Parameters** (опционально):

- `status?: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'` - фильтр по статусу
- `limit?: number` (default: 20) - количество результатов
- `offset?: number` (default: 0) - смещение
- `sortBy?: 'createdAt' | 'total'` - сортировка
- `sortOrder?: 'asc' | 'desc'` (default: 'desc') - порядок сортировки

**Response 200**:

```json
{
  "orders": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": 1,
      "user": {
        "id": 1,
        "email": "user@example.com",
        "profile": {
          "firstName": "Иван",
          "lastName": "Иванов"
        }
      },
      "status": "pending",
      "deliveryStreet": "ул. Ленина, д. 10, кв. 25",
      "deliveryCity": "Москва",
      "deliveryPostalCode": "123456",
      "deliveryCountry": "Россия",
      "paymentMethod": "card",
      "comment": "Позвоните за час до доставки",
      "total": 12980,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "items": [
        {
          "id": "item-uuid-1",
          "productId": "product-uuid-1",
          "product": {
            "id": "product-uuid-1",
            "name": "Футболка Nike",
            "images": ["https://example.com/image.jpg"]
          },
          "quantity": 2,
          "size": "M",
          "color": "Черный",
          "price": 2990
        }
      ]
    }
  ],
  "total": 150,
  "limit": 20,
  "offset": 0
}
```

**Использование в UI**:

- Таблица заказов с колонками:
  - ID заказа
  - Дата создания
  - Клиент (имя, email)
  - Статус (с цветовой индикацией)
  - Сумма заказа
  - Адрес доставки
  - Способ оплаты
  - Действия (изменить статус, просмотреть детали)
- Фильтр по статусу (dropdown)
- Поиск по ID заказа или email клиента
- Сортировка по дате или сумме
- Пагинация

---

### 3.2 Получить заказ по ID

**GET** `/orders/{orderId}`

**Требуется авторизация**: Да (Admin или владелец заказа)

**Path Parameters**:

- `orderId` (string, UUID) - ID заказа

**Response 200**: Полная информация о заказе (включая все товары)
**Response 404**: Заказ не найден

**Использование в UI**:

- Страница деталей заказа:
  - Информация о клиенте
  - Адрес доставки
  - Список товаров в заказе (таблица с изображениями)
  - Общая сумма
  - Статус заказа
  - История изменений статуса (если реализовано)

---

### 3.3 Обновить статус заказа

**PATCH** `/orders/{orderId}/status`

**Требуется авторизация**: Да (Admin)

**Path Parameters**:

- `orderId` (string, UUID) - ID заказа

**Request Body**:

```json
{
  "status": "processing"
}
```

**Валидация**:

- `status` (string, required, enum) - новый статус заказа:
  - `pending` - ожидает обработки
  - `processing` - в обработке
  - `shipped` - отправлен
  - `delivered` - доставлен
  - `cancelled` - отменен

**Response 200**:

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "processing",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Response 400**: Неверный статус
**Response 404**: Заказ не найден

**Использование в UI**:

- Dropdown для изменения статуса в таблице заказов
- Или отдельная форма на странице деталей заказа
- Валидация переходов статусов (например, нельзя перейти из `delivered` в `pending`)
- Уведомление об успешном изменении статуса

---

## 4. Статистика и мониторинг

### 4.1 Получить общую статистику

**GET** `/admin/statistics`

**Требуется авторизация**: Да (Admin)

**Response 200**:

```json
{
  "orders": {
    "total": 1250,
    "pending": 15,
    "processing": 8,
    "shipped": 12,
    "delivered": 1200,
    "cancelled": 15
  },
  "products": {
    "total": 450,
    "inStock": 380,
    "outOfStock": 70,
    "lowStock": 25
  },
  "revenue": {
    "today": 125000,
    "week": 850000,
    "month": 3500000,
    "total": 12500000
  },
  "categories": {
    "total": 7
  }
}
```

**Использование в UI**:

- Dashboard с карточками статистики:
  - Общее количество заказов
  - Заказы по статусам (с индикаторами)
  - Товары в наличии / нет в наличии
  - Выручка за период
- Графики:
  - Выручка по дням/неделям/месяцам
  - Распределение заказов по статусам (pie chart)
  - Топ продаваемых товаров

---

### 4.2 Получить статистику по товарам

**GET** `/admin/statistics/products`

**Требуется авторизация**: Да (Admin)

**Query Parameters**:

- `period?: 'day' | 'week' | 'month' | 'year'` (default: 'month')

**Response 200**:

```json
{
  "topProducts": [
    {
      "productId": "product-uuid-1",
      "productName": "Футболка Nike",
      "salesCount": 150,
      "revenue": 448500
    }
  ],
  "lowStock": [
    {
      "productId": "product-uuid-2",
      "productName": "Кроссовки Adidas",
      "stockQuantity": 3,
      "inStock": true
    }
  ],
  "outOfStock": [
    {
      "productId": "product-uuid-3",
      "productName": "Мяч футбольный",
      "stockQuantity": 0,
      "inStock": false
    }
  ]
}
```

**Использование в UI**:

- Таблица топ продаваемых товаров
- Список товаров с низким остатком (требуют пополнения)
- Список товаров, которых нет в наличии

---

## 5. Структура приложения

### 5.1 Роутинг

```
/admin
  /login                    - Страница входа
  /dashboard                - Главная страница (статистика)
  /categories               - Список категорий
    /create                 - Создание категории
    /:id/edit               - Редактирование категории
  /products                 - Список товаров
    /create                 - Создание товара
    /:id/edit               - Редактирование товара
    /:id                    - Просмотр товара
  /orders                   - Список заказов
    /:id                    - Детали заказа
  /statistics              - Расширенная статистика
```

### 5.2 Компоненты

**Общие компоненты:**

- `Layout` - основной layout с навигацией
- `Header` - шапка с меню и профилем пользователя
- `Sidebar` - боковое меню навигации
- `Table` - универсальная таблица с пагинацией и сортировкой
- `Modal` - модальные окна
- `FormInput` - универсальный input для форм
- `Select` - выпадающий список
- `Button` - кнопка
- `Card` - карточка для статистики
- `Chart` - компонент для графиков

**Специфичные компоненты:**

- `CategoryList` - список категорий
- `CategoryForm` - форма создания/редактирования категории
- `ProductList` - список товаров с фильтрами
- `ProductForm` - форма создания/редактирования товара
- `OrderList` - список заказов
- `OrderDetails` - детали заказа
- `StatusBadge` - бейдж статуса заказа
- `Dashboard` - главная страница со статистикой

### 5.3 State Management

**Рекомендуемая структура:**

```
store/
  auth/
    - authSlice.ts          - состояние аутентификации
  categories/
    - categoriesSlice.ts    - состояние категорий
    - categoriesApi.ts       - API запросы для категорий
  products/
    - productsSlice.ts      - состояние товаров
    - productsApi.ts         - API запросы для товаров
  orders/
    - ordersSlice.ts        - состояние заказов
    - ordersApi.ts           - API запросы для заказов
  statistics/
    - statisticsSlice.ts    - состояние статистики
    - statisticsApi.ts       - API запросы для статистики
```

### 5.4 API Service Layer

Создайте централизованный сервис для работы с API:

```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://84.201.188.209:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor для обработки ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Перенаправить на страницу входа
      localStorage.removeItem('accessToken');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  },
);

export default api;
```

---

## 6. UI/UX Требования

### 6.1 Дизайн

- **Стиль**: Современный, минималистичный, профессиональный
- **Цветовая схема**:
  - Основной: синий/темно-синий
  - Успех: зеленый
  - Ошибка: красный
  - Предупреждение: оранжевый
  - Фон: светло-серый/белый
- **Типографика**: Четкие, читаемые шрифты (Roboto, Inter, или системные)

### 6.2 Навигация

- Боковое меню (Sidebar) с основными разделами:
  - 📊 Dashboard
  - 📦 Товары
  - 📁 Категории
  - 🛒 Заказы
  - 📈 Статистика
- Хлебные крошки (breadcrumbs) для навигации
- Поиск в шапке (для быстрого поиска товаров/заказов)

### 6.3 Таблицы

- Сортировка по колонкам (клик по заголовку)
- Фильтрация (панель фильтров над таблицей)
- Пагинация внизу таблицы
- Действия в каждой строке (редактировать, удалить, просмотреть)
- Выделение строки при наведении
- Адаптивная таблица (горизонтальный скролл на мобильных)

### 6.4 Формы

- Валидация в реальном времени
- Показ ошибок под полями
- Кнопки "Сохранить" и "Отмена"
- Индикатор загрузки при отправке
- Подтверждение перед удалением (модальное окно)

### 6.5 Уведомления

- Toast-уведомления для успешных операций
- Toast-уведомления для ошибок
- Модальные окна для важных действий (удаление, изменение статуса)

---

## 7. Обработка ошибок

### 7.1 HTTP Ошибки

- **400 Bad Request**: Показать ошибки валидации под полями формы
- **401 Unauthorized**: Перенаправить на страницу входа
- **403 Forbidden**: Показать сообщение "Недостаточно прав"
- **404 Not Found**: Показать страницу "Не найдено"
- **500 Server Error**: Показать сообщение "Ошибка сервера, попробуйте позже"

### 7.2 Сетевые ошибки

- Показывать сообщение при отсутствии интернета
- Retry механизм для критичных запросов
- Офлайн режим (если возможно)

---

## 8. Безопасность

### 8.1 Аутентификация

- Хранить токен в `localStorage` или `sessionStorage`
- Автоматический logout при истечении токена (401 ошибка)
- Защита роутов: проверка авторизации перед доступом к страницам

### 8.2 Валидация

- Валидация всех форм на клиенте
- Не доверять только клиентской валидации (бэкенд тоже валидирует)
- Санитизация пользовательского ввода

---

## 9. Производительность

### 9.1 Оптимизация

- Ленивая загрузка (lazy loading) для роутов
- Виртуализация для больших списков (react-window, react-virtualized)
- Кэширование данных (React Query, SWR)
- Debounce для поиска (задержка 300-500ms)

### 9.2 Загрузка данных

- Показывать скелетоны (skeleton loaders) во время загрузки
- Индикаторы загрузки для действий
- Оптимистичные обновления (обновлять UI до ответа сервера)

---

## 10. Тестирование

### 10.1 Unit тесты

- Тесты для утилит и хелперов
- Тесты для компонентов (React Testing Library)

### 10.2 E2E тесты

- Тесты критичных сценариев (создание товара, изменение статуса заказа)
- Использовать Cypress или Playwright

---

## 11. Деплой

### 11.1 Сборка

```bash
npm run build
# или
yarn build
```

### 11.2 Хостинг

- Рекомендуется: Vercel, Netlify, или собственный сервер
- Настроить переменные окружения:
  - `REACT_APP_API_URL` - URL бэкенда

---

## 12. Дополнительные функции (опционально)

### 12.1 Экспорт данных

- Экспорт списка товаров в CSV/Excel
- Экспорт заказов в PDF
- Печать накладных

### 12.2 Уведомления

- Push-уведомления о новых заказах
- Email-уведомления о критичных событиях

### 12.3 История изменений

- Лог изменений товаров
- История изменения статусов заказов
- Аудит действий администратора

---

## 13. Примеры кода

### 13.1 Создание товара (React + TypeScript)

```typescript
// components/ProductForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';

interface ProductFormData {
  name: string;
  description: string;
  price: number;
  oldPrice?: number;
  images: string[];
  categoryId: string;
  inStock: boolean;
  stockQuantity?: number;
  sizes?: string[];
  colors?: string[];
  brand?: string;
  sku: string;
}

export const ProductForm = ({ productId, onSuccess }: Props) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    try {
      if (productId) {
        await api.patch(`/products/${productId}`, data);
      } else {
        await api.post('/products', data);
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Поля формы */}
      <button type="submit" disabled={loading}>
        {loading ? 'Сохранение...' : 'Сохранить'}
      </button>
    </form>
  );
};
```

### 13.2 Список заказов с фильтрацией

```typescript
// components/OrderList.tsx
import { useState, useEffect } from 'react';
import api from '../services/api';

export const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const response = await api.get('/orders/admin/all', { params });
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      fetchOrders(); // Обновить список
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div>
      <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
        <option value="">Все статусы</option>
        <option value="pending">Ожидает</option>
        <option value="processing">В обработке</option>
        <option value="shipped">Отправлен</option>
        <option value="delivered">Доставлен</option>
        <option value="cancelled">Отменен</option>
      </select>

      <table>
        {/* Таблица заказов */}
      </table>
    </div>
  );
};
```

---

## 14. Чеклист разработки

### Фаза 1: Настройка проекта

- [ ] Создать проект (React/Vue)
- [ ] Настроить роутинг
- [ ] Настроить state management
- [ ] Создать API service layer
- [ ] Настроить UI framework

### Фаза 2: Аутентификация

- [ ] Страница входа
- [ ] Хранение токена
- [ ] Защита роутов
- [ ] Interceptors для API

### Фаза 3: Категории

- [ ] Список категорий
- [ ] Создание категории
- [ ] Редактирование категории
- [ ] Удаление категории

### Фаза 4: Товары

- [ ] Список товаров с фильтрами
- [ ] Создание товара
- [ ] Редактирование товара
- [ ] Удаление товара
- [ ] Загрузка изображений

### Фаза 5: Заказы

- [ ] Список заказов
- [ ] Детали заказа
- [ ] Изменение статуса заказа
- [ ] Фильтрация по статусу

### Фаза 6: Статистика

- [ ] Dashboard со статистикой
- [ ] Графики и диаграммы
- [ ] Топ товаров
- [ ] Низкие остатки

### Фаза 7: Полировка

- [ ] Обработка ошибок
- [ ] Уведомления
- [ ] Адаптивность
- [ ] Оптимизация производительности
- [ ] Тестирование

---

## 15. Контакты и поддержка

При возникновении вопросов по API обращайтесь к документации Swagger:

- Swagger UI: `http://84.201.188.209:3000/api-docs`
- Swagger JSON: `http://84.201.188.209:3000/api-docs-json`

---

**Удачи в разработке! 🚀**
