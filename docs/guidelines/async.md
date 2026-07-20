# 🛡️ React & Next.js: Bulletproof Guide to `useState` and Async Operations

Этот документ описывает строгие стандарты работы с состоянием и асинхронностью в экосистеме React/Next.js. Отклонение от этих правил ведёт к race conditions, memory leaks и непредсказуемому UI.

---

## 🟢 ЧАСТЬ 1: `useState` (Управление состоянием)

### 1. Запрет на мутации (Immutability is Law)
Никогда не мутируй объекты или массивы в стейте напрямую. React использует сравнение ссылок (Object.is) для оптимизации рендеров.
* **Плохо (Антипаттерн):** `state.items.push(newItem); setState(state);` (Ссылка не изменилась, React не поймёт, что нужно ре-рендерить).
* **Плохо (Небезопасно):** `setState({ ...state, items: state.items }); state.items.push(newItem);`
* **Пуленепробиваемо:** Всегда создавай новые копии.
  ```typescript
  // Для массивов
  setState(prev => ({ ...prev, items: [...prev.items, newItem] }));
  // Для вложенных объектов (если вложенность > 2 уровней, используй useReducer или Immer)
  setState(prev => ({ ...prev, user: { ...prev.user, profile: { ...prev.user.profile, age: 31 } } }));
  ```

### 2. Функциональные обновления (Functional Updates)
Если новое состояние **зависит** от предыдущего, использование прямой переменной из замыкания (`state`) запрещено из-за риска *stale closures*.
* **Правило:** Всегда используй колбэк `prev => ...`.
* **Пример:** `setCount(prev => prev + 1);`

### 3. Синхронизация и "Производное состояние" (Derived State)
Не используй `useState` для хранения данных, которые можно вычислить из пропсов или другого стейта. Это приводит к рассинхрону.
* **Антипаттерн:** `const [fullName, setFullName] = useState(firstName + lastName);` с последующим `useEffect` для обновления.
* **Пуленепробиваемо:** Вычисляй в процессе рендера или используй `useMemo` для тяжёлых вычислений.
  ```typescript
  const fullName = `${firstName} ${lastName}`; // Просто и без багов
  ```

### 4. Ленивая инициализация (Lazy Initialization)
Если начальное значение стейта требует тяжёлых вычислений (парсинг огромного JSON из `localStorage`, генерация массивов), не вычисляй это при каждом рендере.
* **Плохо:** `const [data, setData] = useState(expensiveComputation());` (Функция вызывается каждый раз, хоть и используется только при первом рендере).
* **Пуленепробиваемо:** Передавай функцию.
  ```typescript
  const [data, setData] = useState(() => expensiveComputation());
  ```

---

## 🟢 ЧАСТЬ 2: Асинхронность (Async / Await / Fetching)

### 1. `useEffect` не может быть `async`
Колбэк `useEffect` должен либо не возвращать ничего, либо возвращать функцию очистки (cleanup). `async` функция всегда возвращает `Promise`.
* **Антипаттерн:** `useEffect(async () => { await fetch(); }, []);` (React выдаст warning и сломается cleanup).
* **Пуленепробиваемо:** Объявляй async функцию ВНУТРИ эффекта.
  ```typescript
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get();
        setData(res);
      } catch (err) {
        setError(err);
      }
    };
    fetchData();
  }, []);
  ```

### 2. Race Conditions и Очистка (The Cleanup Rule)
Если компонент размонтировался (или зависимости `useEffect` изменились) до завершения запроса, обновление стейта вызовет Memory Leak и, что хуже, перезапишет актуальные данные устаревшими.
* **Решение 1 (Boolean flag):**
  ```typescript
  useEffect(() => {
    let isMounted = true;
    fetchData().then(res => {
      if (isMounted) setData(res);
    });
    return () => { isMounted = false; };
  }, []);
  ```
* **Решение 2 (AbortController - Рекомендуется для fetch):**
  ```typescript
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/data', { signal: controller.signal })
      .then(res => res.json())
      .then(setData)
      .catch(err => { if (err.name !== 'AbortError') setError(err); });
    
    return () => controller.abort(); // Отменяет запрос при размонтировании
  }, []);
  ```

### 3. Архитектура состояния загрузки (Discriminated Unions)
Избегай разрозненных переменных `isLoading`, `isError`, `data`. Они позволяют логически невозможные состояния (например, `isLoading: true` и `isError: true` одновременно). Используй TypeScript Discriminated Unions.
```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success', data: T }
  | { status: 'error', error: Error };

const [state, setState] = useState<AsyncState<User>>({ status: 'idle' });

// В JSX:
if (state.status === 'loading') return <Spinner />;
if (state.status === 'error') return <Error message={state.error.message} />;
if (state.status === 'success') return <Profile user={state.data} />;
```

---

## 🔴 ЧАСТЬ 3: Next.js Специфика (Сдвиг парадигмы)

Если ты пишешь на Next.js (App Router), ты обязан забыть классический паттерн `useEffect + fetch` для получения начальных данных.

1. **Server Components по умолчанию:** Если данные нужны для первого рендера страницы, делай компонент Асинхронным Серверным Компонентом.
   ```typescript
   // app/users/page.tsx
   export default async function UsersPage() {
     const users = await db.query('SELECT * FROM users'); // Прямой запрос к БД!
     return <UsersList users={users} />;
   }
   ```
2. **Мутации через Server Actions:** Для POST/PUT/DELETE запросов от клиента используй Server Actions, а не `fetch` из клиентского `onClick`.
3. **Клиентский `useEffect` для фетчинга — это антипаттерн в Next.js**, если только это не специфический client-side поиск, зависящий от действий пользователя (и даже там лучше использовать `useSearchParams` или библиотеки вроде React Query).

---

## 🛡️ Итоговый чеклист перед коммитом:
- [ ] Я не мутирую стейт напрямую?
- [ ] Я использую `prev =>` там, где новое состояние зависит от старого?
- [ ] У меня нет `async` прямо на `useEffect`?
- [ ] Я отменяю сетевые запросы при размонтировании компонента (Cleanup)?
- [ ] Я использую `Discriminated Unions` для UI состояний?
- [ ] (Для Next.js) Я не делаю на клиенте то, что можно сделать на сервере?
```

