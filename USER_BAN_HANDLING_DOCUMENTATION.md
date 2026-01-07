# Инструкция по обработке бана пользователя на фронтенде

## Обзор

Когда администратор банит пользователя через `PUT /users/:id` с `isBanned: true`, все последующие запросы забаненного пользователя будут возвращать ошибку `401 Unauthorized` с сообщением `"Your account has been banned."`.

Фронтенд должен обрабатывать эту ситуацию и корректно разлогинивать пользователя.

## Как обнаружить бан пользователя

### 1. HTTP ответы от API

При любом запросе к защищенным эндпоинтам, если пользователь забанен, сервер вернет:

```json
{
  "statusCode": 401,
  "message": "Your account has been banned.",
  "error": "Unauthorized"
}
```

### 2. WebSocket соединение

Если пользователь забанен, WebSocket соединение будет автоматически разорвано сервером при попытке подключения или при следующей проверке авторизации.

## Рекомендуемая реализация

### 1. HTTP Interceptor для обработки бана

Создайте HTTP interceptor, который будет перехватывать все ответы от API и проверять, не забанен ли пользователь:

```typescript
// interceptors/ban-handler.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpErrorResponse, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class BanHandlerInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Проверяем, является ли ошибка баном пользователя
        if (error.status === 401 && error.error?.message === 'Your account has been banned.') {
          this.handleUserBan();
        }
        return throwError(() => error);
      }),
    );
  }

  private handleUserBan(): void {
    // Очищаем токены
    this.authService.logout();

    // Перенаправляем на страницу входа
    this.router.navigate(['/login'], {
      queryParams: { banned: 'true' },
    });

    // Показываем уведомление пользователю
    // Используйте ваш сервис уведомлений
    this.showBanNotification();
  }

  private showBanNotification(): void {
    // Пример с использованием snackbar/toast
    // this.snackBar.open(
    //   'Ваш аккаунт был заблокирован администратором.',
    //   'Закрыть',
    //   { duration: 10000, panelClass: ['error-snackbar'] }
    // );
  }
}
```

**Для React (axios):**

```typescript
// interceptors/banHandler.ts
import axios, { AxiosError } from 'axios';
import { authService } from '../services/authService';
import { router } from '../router';

// Response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === 'Your account has been banned.'
    ) {
      handleUserBan();
    }
    return Promise.reject(error);
  },
);

function handleUserBan(): void {
  // Очищаем токены
  authService.logout();

  // Перенаправляем на страницу входа
  router.navigate('/login?banned=true');

  // Показываем уведомление
  // Используйте ваш toast/snackbar сервис
  showBanNotification();
}

function showBanNotification(): void {
  // Пример с react-toastify
  // toast.error('Ваш аккаунт был заблокирован администратором.', {
  //   position: 'top-center',
  //   autoClose: 10000,
  // });
}
```

### 2. Обработка в Auth Service

Добавьте метод для проверки бана в ваш сервис аутентификации:

```typescript
// services/auth.service.ts
export class AuthService {
  // ... другие методы

  async checkUserStatus(): Promise<void> {
    try {
      const response = await this.http.get('/auth/me'); // или другой эндпоинт для проверки статуса
      // Если запрос успешен, пользователь не забанен
    } catch (error) {
      if (error.status === 401 && error.message === 'Your account has been banned.') {
        this.handleBan();
      }
    }
  }

  private handleBan(): void {
    this.logout();
    // Показываем уведомление и перенаправляем
  }
}
```

### 3. Обработка WebSocket отключения

Если используется WebSocket, обрабатывайте отключение:

```typescript
// services/websocket.service.ts
socket.on('disconnect', (reason: string) => {
  if (reason === 'transport close' || reason === 'ping timeout') {
    // Проверяем, не был ли пользователь забанен
    this.checkIfBanned();
  }
});

private async checkIfBanned(): Promise<void> {
  try {
    // Пытаемся выполнить любой защищенный запрос
    await this.http.get('/profile');
  } catch (error) {
    if (error.status === 401 && error.message === 'Your account has been banned.') {
      this.handleUserBan();
    }
  }
}
```

### 4. Страница входа с сообщением о бане

Добавьте обработку параметра `banned` на странице входа:

```typescript
// components/login.component.ts
export class LoginComponent {
  constructor(private route: ActivatedRoute) {
    this.route.queryParams.subscribe((params) => {
      if (params['banned'] === 'true') {
        this.showBanMessage();
      }
    });
  }

  private showBanMessage(): void {
    // Показываем сообщение о бане
    // Например, модальное окно или alert
    alert(
      'Ваш аккаунт был заблокирован администратором. Пожалуйста, свяжитесь с поддержкой для получения дополнительной информации.',
    );
  }
}
```

**Для React:**

```typescript
// components/Login.tsx
import { useSearchParams } from 'react-router-dom';

export function Login() {
  const [searchParams] = useSearchParams();
  const isBanned = searchParams.get('banned') === 'true';

  useEffect(() => {
    if (isBanned) {
      showBanMessage();
    }
  }, [isBanned]);

  // ...
}
```

## Полный пример обработки (React + Axios)

```typescript
// utils/axiosConfig.ts
import axios from 'axios';
import { store } from '../store';
import { logout } from '../store/slices/authSlice';
import { showErrorToast } from '../utils/toast';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

// Request interceptor для добавления токена
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor для обработки бана
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Проверяем, является ли ошибка баном пользователя
    if (response?.status === 401 && response?.data?.message === 'Your account has been banned.') {
      // Очищаем токены
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Очищаем состояние Redux
      store.dispatch(logout());

      // Показываем уведомление
      showErrorToast(
        'Ваш аккаунт был заблокирован администратором. Пожалуйста, свяжитесь с поддержкой.',
        10000,
      );

      // Перенаправляем на страницу входа
      window.location.href = '/login?banned=true';

      return Promise.reject(new Error('User banned'));
    }

    return Promise.reject(error);
  },
);

export default api;
```

## Полный пример обработки (Angular)

```typescript
// interceptors/ban-handler.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class BanHandlerInterceptor implements HttpInterceptor {
  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Проверяем, является ли ошибка баном пользователя
        if (error.status === 401 && error.error?.message === 'Your account has been banned.') {
          this.handleUserBan();
        }
        return throwError(() => error);
      }),
    );
  }

  private handleUserBan(): void {
    // Очищаем токены и состояние
    this.authService.logout();

    // Показываем уведомление
    this.snackBar.open(
      'Ваш аккаунт был заблокирован администратором. Пожалуйста, свяжитесь с поддержкой.',
      'Закрыть',
      {
        duration: 10000,
        panelClass: ['error-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top',
      },
    );

    // Перенаправляем на страницу входа
    this.router.navigate(['/login'], {
      queryParams: { banned: 'true' },
    });
  }
}
```

```typescript
// app.module.ts или app.config.ts
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BanHandlerInterceptor } from './interceptors/ban-handler.interceptor';

// В providers:
{
  provide: HTTP_INTERCEPTORS,
  useClass: BanHandlerInterceptor,
  multi: true,
}
```

## Рекомендации

1. **Централизованная обработка**: Используйте HTTP interceptor для централизованной обработки бана во всех запросах.

2. **Очистка данных**: При обнаружении бана обязательно:
   - Удалите токены из localStorage/sessionStorage
   - Очистите состояние приложения (Redux, Vuex, etc.)
   - Закройте WebSocket соединения
   - Очистите кэш

3. **Уведомление пользователя**: Покажите понятное сообщение о том, что аккаунт заблокирован, и предложите связаться с поддержкой.

4. **Перенаправление**: Перенаправьте пользователя на страницу входа или специальную страницу с информацией о бане.

5. **Предотвращение повторных запросов**: После обнаружения бана прекратите выполнение всех последующих запросов до разлогинивания.

6. **Проверка при загрузке приложения**: При загрузке приложения проверяйте статус пользователя, чтобы обнаружить бан, если пользователь был забанен во время отсутствия.

## Тестирование

Для тестирования обработки бана:

1. Зайдите в систему как обычный пользователь
2. В другом браузере/сессии зайдите как администратор
3. Забаньте пользователя через `PUT /users/:id` с `{ "isBanned": true }`
4. В первом браузере попробуйте выполнить любое действие (обновить страницу, перейти на другую страницу)
5. Должно появиться уведомление о бане и произойти разлогинивание

## Дополнительные соображения

- **Офлайн режим**: Если пользователь был забанен, но приложение работает офлайн, бан будет обнаружен при следующем запросе к серверу.
- **WebSocket**: Если используется WebSocket, соединение будет автоматически разорвано при обнаружении бана на сервере.
- **Множественные вкладки**: Если пользователь открыл приложение в нескольких вкладках, все вкладки должны обработать бан синхронно (можно использовать BroadcastChannel API или localStorage events).
