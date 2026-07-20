# Да, держи готовый документ

Ниже — полный markdown-файл со всеми best practices из нашего чата. Скопируй содержимое в файл `react-hooks-best-practices.md` (или `.txt`, если хочешь без форматирования).

---

```markdown
# Best Practices работы с хуками в React

> Контекст: React 16+ (Fiber), React 19 (React Compiler)
> Дата: Июль 2026

---

## 1. Фундамент: почему хуки работают именно так

### 1.1 Fiber и прерываемый рендер

С React 16 рендер стал **прерываемым**:
- React разбил работу на Fiber-узлы (связный список).
- Между узлами React отдаёт управление браузеру.
- Функция компонента может быть вызвана **несколько раз** за один "рендер" (Strict Mode, прерывания, приоритеты).

**Следствие:** тело функции-компонента должно быть **чистым** — без побочных эффектов.

### 1.2 Две фазы рендера

| Фаза | Характеристики | Что можно |
|------|----------------|-----------|
| **Render** | Прерываемая, может вызываться многократно | Только чистые вычисления, вызовы хуков |
| **Commit** | Синхронная, непрерываемая | Побочные эффекты (`useEffect`), мутации DOM |

**Правило:** всё, что меняет внешний мир (fetch, подписки, таймеры, localStorage) — **только в `useEffect`**.

### 1.3 Связный список хуков

React хранит состояние хуков в **связном списке**. Каждый хук — узел. При вызове компонента React проходит по списку **по порядку**.

**Следствие:** порядок вызова хуков должен быть **стабильным** между рендерами.

---

## 2. Золотые правила всех хуков

### Правило 1: Хуки — только на верхнем уровне

```jsx
// ❌ ПЛОХО
function Component({ condition, items }) {
  if (condition) {
    const [value, setValue] = useState(0); // порядок ломается
  }
  items.forEach(item => {
    useEffect(() => {}); // хук в цикле
  });
  if (!data) return null;
  const [other, setOther] = useState(0); // хук после return
}

// ✅ ХОРОШО
function Component({ condition, items, data }) {
  const [value, setValue] = useState(0);
  const [other, setOther] = useState(0);
  
  useEffect(() => {
    items.forEach(item => { /* ... */ });
  }, [items]);
  
  if (!data) return null;
  if (condition) { /* используем value */ }
  return <div />;
}
```

### Правило 2: Хуки — только из функций React или других хуков

Нельзя вызывать хуки из обычных JS-функций, классов, обработчиков событий.

### Правило 3: Тело компонента — чистая функция

```jsx
// ❌ ПЛОХО
function Component({ userId }) {
  fetch(`/api/users/${userId}`); // побочный эффект
  localStorage.setItem('lastVisit', Date.now()); // мутация
  console.log('render'); // побочный эффект
  
  return <div />;
}

// ✅ ХОРОШО
function Component({ userId }) {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(setUser);
    localStorage.setItem('lastVisit', Date.now());
  }, [userId]);
  
  return <div>{user?.name}</div>;
}
```

---

## 3. Best practices по каждому хуку

### 3.1 `useState`

#### Ленивая инициализация для дорогих вычислений

```jsx
// ❌ ПЛОХО: вычисление при каждом рендере
const [data, setData] = useState(expensiveComputation());

// ✅ ХОРОШО: вычисление только при первом рендере
const [data, setData] = useState(() => expensiveComputation());
```

#### Никогда не мутировать состояние

```jsx
// ❌ ПЛОХО
const addItem = (item) => {
  items.push(item); // мутация
  setItems(items);  // React не увидит изменений
};

// ✅ ХОРОШО
const addItem = (item) => {
  setItems([...items, item]); // новый массив
};

// ✅ ХОРОШО (для объектов)
const updateUser = (updates) => {
  setUser(prev => ({ ...prev, ...updates }));
};
```

#### Функциональные обновления при зависимости от предыдущего состояния

```jsx
// ❌ ПЛОХО: может использовать устаревшее значение
setCount(count + 1);

// ✅ ХОРОШО
setCount(prev => prev + 1);
```

---

### 3.2 `useEffect`

#### Всегда указывать все зависимости

```jsx
// ❌ ПЛОХО: stale closure
useEffect(() => {
  fetch(`/api/users/${userId}`); // userId из замыкания
}, []); // но не указан в зависимостях

// ✅ ХОРОШО
useEffect(() => {
  fetch(`/api/users/${userId}`);
}, [userId]);
```

#### Всегда делать cleanup

```jsx
// ❌ ПЛОХО: утечка памяти
useEffect(() => {
  const sub = api.subscribe(handler);
}, [userId]);

// ✅ ХОРОШО
useEffect(() => {
  const sub = api.subscribe(handler);
  return () => sub.unsubscribe();
}, [userId]);
```

#### Не делать fetch в теле — использовать useEffect или React Query/SWR

```jsx
// ❌ ПЛОХО (для клиентских компонентов)
function Component({ userId }) {
  const data = await fetch(`/api/users/${userId}`); // ошибка
  return <div />;
}

// ✅ ХОРОШО: useEffect
useEffect(() => {
  fetch(`/api/users/${userId}`).then(/* ... */);
}, [userId]);

// ✅ ЛУЧШЕ: React Query / SWR
const { data } = useSWR(`/api/users/${userId}`, fetcher);
```

#### Серверные компоненты — исключение

В Next.js App Router серверные компоненты (без `'use client'`) **могут** делать fetch в теле:

```jsx
// app/page.jsx — серверный компонент
async function Page() {
  const data = await fetch('https://api.example.com/data').then(r => r.json());
  return <div>{data.title}</div>;
}
```

---

### 3.3 `useMemo` и `useCallback`

#### До React 19 (без компилятора)

```jsx
// ✅ Для дорогих вычислений
const sorted = useMemo(() => items.sort(compareFn), [items]);

// ✅ Для стабильных ссылок (с React.memo)
const handleClick = useCallback(() => { /* ... */ }, [dep]);

// ❌ НЕ нужно для примитивов
const sum = useMemo(() => a + b, [a, b]); // сложнее, чем просто a + b
```

#### С React 19 (React Compiler)

Компилятор **автоматически** мемоизирует компоненты, вычисления и колбэки.

```jsx
// ✅ В React 19 пиши "наивно"
function Component({ items, onClick }) {
  const sorted = items.sort(); // компилятор мемоизирует
  const handleClick = () => onClick(); // компилятор мемоизирует
  return <List items={sorted} onClick={handleClick} />;
}
```

**Когда всё ещё нужен явный `useMemo`/`useCallback`:**
1. Действительно дорогие вычисления (компилятор не знает их стоимость).
2. Колбэки в зависимостях `useEffect` (для ясности намерений).
3. Стабильные ссылки для интеграций с внешними библиотеками.

---

### 3.4 `useRef`

#### Для mutable значений без ререндера

```jsx
// ✅ Счётчик рендеров
const renderCount = useRef(0);
useEffect(() => { renderCount.current += 1; });

// ✅ Предыдущее значение пропса
const prevValue = useRef(value);
useEffect(() => { prevValue.current = value; }, [value]);

// ✅ DOM-ссылки
const inputRef = useRef(null);
const focusInput = () => inputRef.current?.focus();
return <input ref={inputRef} />;

// ✅ Таймеры, подписки (для cleanup)
const timerRef = useRef(null);
useEffect(() => {
  timerRef.current = setTimeout(() => {}, 1000);
  return () => clearTimeout(timerRef.current);
}, []);
```

#### НЕ использовать `useState` для значений, не влияющих на UI

```jsx
// ❌ ПЛОХО: лишний ререндер
const [renderCount, setRenderCount] = useState(0);
useEffect(() => { setRenderCount(c => c + 1); });

// ✅ ХОРОШО: без ререндера
const renderCount = useRef(0);
useEffect(() => { renderCount.current += 1; });
```

---

### 3.5 `use` (React 19+)

Это **не обычный хук** — можно вызывать условно, не имеет состояния.

#### Промис должен быть стабильным

```jsx
// ❌ ПЛОХО: новый промис при каждом рендере → бесконечный loading
function Comments({ postId }) {
  const promise = fetch(`/api/posts/${postId}/comments`).then(r => r.json());
  const comments = use(promise);
  return <div>{comments.length}</div>;
}

// ✅ ХОРОШО: промис кэшируется
function getComments(postId) {
  if (!cache[postId]) {
    cache[postId] = fetch(`/api/posts/${postId}/comments`).then(r => r.json());
  }
  return cache[postId];
}

function Comments({ postId }) {
  const comments = use(getComments(postId));
  return <div>{comments.length}</div>;
}
```

#### Создавать промис в родителе

```jsx
// ✅ Правильный паттерн
function Page({ postId }) {
  const commentsPromise = useMemo(
    () => fetchComments(postId),
    [postId]
  );
  
  return (
    <ErrorBoundary fallback={<div>Error</div>}>
      <Suspense fallback={<div>Loading...</div>}>
        <Comments commentsPromise={commentsPromise} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

#### Только для чтения, не для side effects

`use` может вызываться несколько раз. Промис должен только читать данные.

#### Всегда оборачивать в ErrorBoundary

Промис может быть rejected — без ErrorBoundary приложение упадёт.

---

## 4. Антипаттерны: чего избегать

### Антипаттерн 1: Хук в условной ветке

```jsx
// ❌
if (condition) { const [v, setV] = useState(0); }
```

### Антипаттерн 2: Хук в колбэке

```jsx
// ❌
const handleClick = () => { const [v, setV] = useState(0); };
```

### Антипаттерн 3: Зависимость эффекта — функция из рендера

```jsx
// ❌
const fetchUser = () => fetch(`/api/users/${userId}`);
useEffect(() => { fetchUser(); }, [userId]);
// fetchUser меняется при каждом рендере, но не в зависимостях

// ✅
useEffect(() => {
  const fetchUser = () => fetch(`/api/users/${userId}`);
  fetchUser();
}, [userId]);
```

### Антипаттерн 4: useEffect без cleanup для подписок/таймеров

### Антипаттерн 5: Мутация состояния напрямую

### Антипаттерн 6: useEffect для синхронных вычислений из пропсов

```jsx
// ❌ ПЛОХО
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${first} ${last}`);
}, [first, last]);

// ✅ ХОРОШО: вычислять в рендере
const fullName = `${first} ${last}`;
```

---

## 5. Итоговая шпаргалка

| Ситуация | Решение |
|----------|---------|
| Побочный эффект | `useEffect` с cleanup |
| Дорогое вычисление | `useMemo` (или довериться компилятору в React 19) |
| Стабильный колбэк для дочернего компонента | `useCallback` (или компилятор) |
| Значение, не влияющее на UI | `useRef` |
| DOM-ссылка | `useRef` |
| Чтение промиса в рендере | `use(promise)` + Suspense + ErrorBoundary |
| Чтение контекста условно | `use(Context)` |
| Синхронное вычисление из пропсов | Просто переменная в теле компонента |
| Данные с API (клиентский компонент) | React Query / SWR |
| Данные с API (серверный компонент) | `await fetch()` в теле |

---

## 6. Проверь себя

1. **Почему нельзя вызывать хуки внутри условий?**
   Связный список хуков требует стабильного порядка.

2. **Что произойдёт, если в `useEffect` не указать зависимость?**
   Stale closure — эффект использует устаревшее значение.

3. **Почему `useRef` не вызывает ререндер?**
   Это просто объект с полем `.current`, React не отслеживает его изменения.

4. **Почему нельзя создавать промис внутри компонента для `use`?**
   Новый промис при каждом рендере → Suspense бесконечно виснет.

5. **Что изменилось с React Compiler в React 19?**
   Автоматическая мемоизация компонентов, вычислений и колбэков. `useMemo`/`useCallback` нужны только для действительно дорогих операций.

6. **Чем серверные компоненты отличаются от клиентских в контексте fetch?**
   Серверные рендерятся один раз на сервере — можно делать `await fetch` в теле. Клиентские используют Fiber — только через `useEffect` или data-fetching библиотеки.

---

## 7. Источники и дальнейшее чтение

- React Docs: [Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks)
- React Docs: [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- React Docs: [use Hook](https://react.dev/reference/react/use)
- React 19 Blog Post: [React Compiler](https://react.dev/blog/2024/04/25/react-19-upgrade-guide)
- Dan Abramov: [useEffect vs lifecycle methods](https://overreacted.io/)
```

---