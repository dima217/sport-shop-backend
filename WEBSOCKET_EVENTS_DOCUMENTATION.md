# WebSocket Events Documentation

## Подключение

WebSocket сервер доступен по адресу: `ws://your-server:3000` или `wss://your-server:3000` (для HTTPS)

### Подключение с авторизацией

Для подключения с авторизацией передайте JWT токен в параметрах подключения:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://your-server:3000', {
  auth: {
    token: `Bearer ${yourJwtToken}`,
  },
});
```

## События (Events)

Все события отправляются всем подключенным клиентам. События генерируются автоматически при изменении данных администратором.

### События товаров (Products)

#### `product:created`

Событие отправляется при создании нового товара администратором.

**Payload:**

```typescript
{
  product: {
    id: string;              // UUID товара
    name: string;            // Название товара
    description: string;     // Описание
    price: number;          // Текущая цена
    oldPrice: number | null; // Старая цена (если есть скидка)
    images: string[];        // Массив URL изображений
    brand: string;           // Бренд
    sku: string;            // Артикул
    inStock: boolean;       // В наличии
    stockQuantity: number;  // Количество на складе
    sizes: string[] | null; // Доступные размеры
    colors: string[] | null; // Доступные цвета
    rating: number | null;  // Рейтинг
    reviewCount: number;    // Количество отзывов
    category: {             // Категория
      id: string;
      name: string;
      slug: string;
    };
    // ... другие поля товара
  };
  timestamp: string;        // ISO 8601 timestamp
}
```

**Пример обработки:**

```javascript
socket.on('product:created', (payload) => {
  console.log('Новый товар создан:', payload.product.name);
  // Обновить список товаров на фронтенде
  updateProductsList(payload.product);
});
```

---

#### `product:updated`

Событие отправляется при обновлении товара администратором.

**Payload:** Аналогичен `product:created`

**Пример обработки:**

```javascript
socket.on('product:updated', (payload) => {
  console.log('Товар обновлен:', payload.product.name);
  // Обновить информацию о товаре на фронтенде
  updateProductInList(payload.product);
});
```

---

#### `product:price_changed`

Событие отправляется при изменении цены товара (не через скидку).

**Payload:**

```typescript
{
  productId: string; // UUID товара
  oldPrice: number; // Старая цена
  newPrice: number; // Новая цена
  product: {
    // Полный объект товара
    id: string;
    name: string;
    price: number;
    // ... все поля товара
  }
  timestamp: string; // ISO 8601 timestamp
}
```

**Пример обработки:**

```javascript
socket.on('product:price_changed', (payload) => {
  console.log(
    `Цена товара ${payload.product.name} изменилась: ${payload.oldPrice} -> ${payload.newPrice}`,
  );
  // Обновить цену товара на фронтенде
  updateProductPrice(payload.productId, payload.newPrice);
  // Показать уведомление пользователю
  showNotification(`Цена на ${payload.product.name} изменилась!`);
});
```

---

#### `product:discount_applied`

Событие отправляется при применении скидки на товар.

**Payload:**

```typescript
{
  productId: string; // UUID товара
  discountPercent: number; // Процент скидки (например, 20)
  oldPrice: number; // Цена до скидки
  newPrice: number; // Цена со скидкой
  product: {
    // Полный объект товара
    id: string;
    name: string;
    price: number;
    oldPrice: number;
    // ... все поля товара
  }
  timestamp: string; // ISO 8601 timestamp
}
```

**Пример обработки:**

```javascript
socket.on('product:discount_applied', (payload) => {
  console.log(`Скидка ${payload.discountPercent}% на товар ${payload.product.name}`);
  // Обновить цену товара на фронтенде
  updateProductPrice(payload.productId, payload.newPrice, payload.oldPrice);
  // Показать уведомление о скидке
  showDiscountNotification(payload.product.name, payload.discountPercent);
});
```

---

#### `product:discount_removed`

Событие отправляется при удалении скидки с товара.

**Payload:**

```typescript
{
  productId: string; // UUID товара
  discountPercent: number; // Всегда 0
  oldPrice: number; // Цена со скидкой (до удаления)
  newPrice: number; // Цена без скидки (после удаления)
  product: {
    // Полный объект товара
    id: string;
    name: string;
    price: number;
    oldPrice: null;
    // ... все поля товара
  }
  timestamp: string; // ISO 8601 timestamp
}
```

**Пример обработки:**

```javascript
socket.on('product:discount_removed', (payload) => {
  console.log(`Скидка удалена с товара ${payload.product.name}`);
  // Обновить цену товара на фронтенде
  updateProductPrice(payload.productId, payload.newPrice);
});
```

---

#### `product:stock_changed`

Событие отправляется при изменении количества товара на складе или статуса наличия.

**Payload:**

```typescript
{
  productId: string; // UUID товара
  oldStock: number; // Старое количество
  newStock: number; // Новое количество
  inStock: boolean; // В наличии ли товар
  product: {
    // Полный объект товара
    id: string;
    name: string;
    stockQuantity: number;
    inStock: boolean;
    // ... все поля товара
  }
  timestamp: string; // ISO 8601 timestamp
}
```

**Пример обработки:**

```javascript
socket.on('product:stock_changed', (payload) => {
  console.log(`Склад товара ${payload.product.name}: ${payload.oldStock} -> ${payload.newStock}`);
  // Обновить информацию о наличии на фронтенде
  updateProductStock(payload.productId, payload.newStock, payload.inStock);

  // Если товар закончился, показать уведомление
  if (!payload.inStock) {
    showNotification(`Товар ${payload.product.name} закончился`);
  }
});
```

---

#### `product:deleted`

Событие отправляется при удалении товара администратором.

**Payload:**

```typescript
{
  productId: string; // UUID удаленного товара
  timestamp: string; // ISO 8601 timestamp
}
```

**Пример обработки:**

```javascript
socket.on('product:deleted', (payload) => {
  console.log(`Товар удален: ${payload.productId}`);
  // Удалить товар из списка на фронтенде
  removeProductFromList(payload.productId);
});
```

---

### События категорий (Categories)

#### `category:created`

Событие отправляется при создании новой категории администратором.

**Payload:**

```typescript
{
  category: {
    id: string; // UUID категории
    name: string; // Название категории
    slug: string; // URL-слаг категории
    description: string | null; // Описание
    image: string | null; // URL изображения
    // ... другие поля категории
  }
  timestamp: string; // ISO 8601 timestamp
}
```

**Пример обработки:**

```javascript
socket.on('category:created', (payload) => {
  console.log('Новая категория создана:', payload.category.name);
  // Добавить категорию в список на фронтенде
  addCategoryToList(payload.category);
});
```

---

#### `category:updated`

Событие отправляется при обновлении категории администратором.

**Payload:** Аналогичен `category:created`

**Пример обработки:**

```javascript
socket.on('category:updated', (payload) => {
  console.log('Категория обновлена:', payload.category.name);
  // Обновить информацию о категории на фронтенде
  updateCategoryInList(payload.category);
});
```

---

#### `category:deleted`

Событие отправляется при удалении категории администратором.

**Payload:**

```typescript
{
  categoryId: string; // UUID удаленной категории
  timestamp: string; // ISO 8601 timestamp
}
```

**Пример обработки:**

```javascript
socket.on('category:deleted', (payload) => {
  console.log(`Категория удалена: ${payload.categoryId}`);
  // Удалить категорию из списка на фронтенде
  removeCategoryFromList(payload.categoryId);
});
```

---

### События заказов (Orders)

#### `order:status_updated`

Событие отправляется при изменении статуса заказа администратором.

**Payload:**

```typescript
{
  orderId: string; // UUID заказа
  oldStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Старый статус
  newStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; // Новый статус
  order: {
    // Полный объект заказа
    id: string;
    userId: number;
    status: string;
    total: number;
    deliveryStreet: string;
    deliveryCity: string;
    deliveryPostalCode: string;
    deliveryCountry: string;
    paymentMethod: 'card' | 'cash';
    comment: string | null;
    createdAt: string;
    items?: Array<{
      // Элементы заказа (если включены в relations)
      id: string;
      productId: string;
      quantity: number;
      size: string | null;
      color: string | null;
      price: number;
      product?: {
        // Информация о товаре (если включена в relations)
        id: string;
        name: string;
        // ... другие поля товара
      };
    }>;
    user?: {
      // Информация о пользователе (если включена в relations)
      id: number;
      email: string;
      profile?: {
        firstName: string;
        lastName: string;
      };
    };
  };
  timestamp: string; // ISO 8601 timestamp
}
```

**Пример обработки:**

```javascript
socket.on('order:status_updated', (payload) => {
  console.log(
    `Статус заказа ${payload.orderId} изменен: ${payload.oldStatus} -> ${payload.newStatus}`,
  );
  
  // Обновить статус заказа на фронтенде
  updateOrderStatus(payload.orderId, payload.newStatus);
  
  // Показать уведомление пользователю (если это его заказ)
  if (isUserOrder(payload.order.userId)) {
    const statusMessages = {
      pending: 'Заказ ожидает обработки',
      processing: 'Заказ обрабатывается',
      shipped: 'Заказ отправлен',
      delivered: 'Заказ доставлен',
      cancelled: 'Заказ отменен',
    };
    
    showNotification(
      `Статус вашего заказа изменен: ${statusMessages[payload.newStatus]}`,
    );
  }
});
```

---

## Полный пример интеграции

```javascript
import { io } from 'socket.io-client';

class WebSocketService {
  constructor(serverUrl, token) {
    this.socket = io(serverUrl, {
      auth: {
        token: `Bearer ${token}`,
      },
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Обработка подключения
    this.socket.on('connect', () => {
      console.log('WebSocket подключен');
    });

    // Обработка отключения
    this.socket.on('disconnect', () => {
      console.log('WebSocket отключен');
    });

    // События товаров
    this.socket.on('product:created', this.handleProductCreated.bind(this));
    this.socket.on('product:updated', this.handleProductUpdated.bind(this));
    this.socket.on('product:price_changed', this.handlePriceChanged.bind(this));
    this.socket.on('product:discount_applied', this.handleDiscountApplied.bind(this));
    this.socket.on('product:discount_removed', this.handleDiscountRemoved.bind(this));
    this.socket.on('product:stock_changed', this.handleStockChanged.bind(this));
    this.socket.on('product:deleted', this.handleProductDeleted.bind(this));

    // События категорий
    this.socket.on('category:created', this.handleCategoryCreated.bind(this));
    this.socket.on('category:updated', this.handleCategoryUpdated.bind(this));
    this.socket.on('category:deleted', this.handleCategoryDeleted.bind(this));

    // События заказов
    this.socket.on('order:status_updated', this.handleOrderStatusUpdated.bind(this));
  }

  handleProductCreated(payload) {
    // Добавить товар в список
    this.addProductToList(payload.product);
    this.showNotification(`Новый товар: ${payload.product.name}`);
  }

  handleProductUpdated(payload) {
    // Обновить товар в списке
    this.updateProductInList(payload.product);
  }

  handlePriceChanged(payload) {
    // Обновить цену товара
    this.updateProductPrice(payload.productId, payload.newPrice);
    this.showNotification(
      `Цена на ${payload.product.name} изменилась: ${payload.oldPrice}₽ → ${payload.newPrice}₽`,
    );
  }

  handleDiscountApplied(payload) {
    // Обновить цену со скидкой
    this.updateProductPrice(payload.productId, payload.newPrice, payload.oldPrice);
    this.showDiscountBadge(payload.productId, payload.discountPercent);
    this.showNotification(`Скидка ${payload.discountPercent}% на ${payload.product.name}!`);
  }

  handleDiscountRemoved(payload) {
    // Убрать скидку
    this.updateProductPrice(payload.productId, payload.newPrice);
    this.removeDiscountBadge(payload.productId);
  }

  handleStockChanged(payload) {
    // Обновить информацию о наличии
    this.updateProductStock(payload.productId, payload.newStock, payload.inStock);

    if (!payload.inStock) {
      this.showNotification(`Товар ${payload.product.name} закончился`);
    }
  }

  handleProductDeleted(payload) {
    // Удалить товар из списка
    this.removeProductFromList(payload.productId);
  }

  handleCategoryCreated(payload) {
    // Добавить категорию в список
    this.addCategoryToList(payload.category);
  }

  handleCategoryUpdated(payload) {
    // Обновить категорию в списке
    this.updateCategoryInList(payload.category);
  }

  handleCategoryDeleted(payload) {
    // Удалить категорию из списка
    this.removeCategoryFromList(payload.categoryId);
  }

  handleOrderStatusUpdated(payload) {
    // Обновить статус заказа
    this.updateOrderStatus(payload.orderId, payload.newStatus);
    
    // Показать уведомление пользователю
    const statusMessages = {
      pending: 'Заказ ожидает обработки',
      processing: 'Заказ обрабатывается',
      shipped: 'Заказ отправлен',
      delivered: 'Заказ доставлен',
      cancelled: 'Заказ отменен',
    };
    
    this.showNotification(
      `Статус заказа #${payload.orderId.slice(0, 8)} изменен: ${statusMessages[payload.newStatus]}`,
    );
  }

  disconnect() {
    this.socket.disconnect();
  }
}

// Использование
const wsService = new WebSocketService('http://your-server:3000', jwtToken);
```

## Рекомендации

1. **Обработка ошибок**: Всегда обрабатывайте ошибки подключения и переподключения
2. **Debouncing**: При частых обновлениях используйте debouncing для обновления UI
3. **Кэширование**: Кэшируйте данные товаров и категорий для быстрого обновления
4. **Уведомления**: Показывайте пользователю уведомления о важных изменениях (скидки, изменение цен)
5. **Оптимистичные обновления**: Обновляйте UI сразу при получении события, не дожидаясь подтверждения

## Типы событий (TypeScript)

Если вы используете TypeScript, можете импортировать типы из бэкенда:

```typescript
// Типы событий
enum WebSocketEvent {
  PRODUCT_CREATED = 'product:created',
  PRODUCT_UPDATED = 'product:updated',
  PRODUCT_PRICE_CHANGED = 'product:price_changed',
  PRODUCT_DISCOUNT_APPLIED = 'product:discount_applied',
  PRODUCT_DISCOUNT_REMOVED = 'product:discount_removed',
  PRODUCT_STOCK_CHANGED = 'product:stock_changed',
  PRODUCT_DELETED = 'product:deleted',
  CATEGORY_CREATED = 'category:created',
  CATEGORY_UPDATED = 'category:updated',
  CATEGORY_DELETED = 'category:deleted',
  ORDER_STATUS_UPDATED = 'order:status_updated',
}

// Типы статусов заказа
enum OrderStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

// Типы payload для событий заказов
interface OrderStatusUpdatePayload {
  orderId: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  order: Order; // Полный объект заказа
  timestamp: string;
}
```
