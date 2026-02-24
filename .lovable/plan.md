

## Диагностика: почему пропадает окрас на Unlock Button и Search Input

### Корневая причина (100%)

В проекте работают **ДВЕ системы стилизации одновременно** на одних и тех же DOM-элементах:

1. **React inline styles** — через `previewData` в `WalletPreviewContainer.tsx` (строки 236, 287)
2. **RuntimeMappingEngine** — через DOM-манипуляцию в `runtimeMappingEngine.ts` (строка 100)

Проблема возникает из-за конфликта при переключении тем:

```text
Шаг 1: Пользователь кликает на новую тему
Шаг 2: setTheme(newTheme) обновляет Zustand store
Шаг 3: React re-render — ставит ПРАВИЛЬНЫЕ inline styles
Шаг 4: Одновременно dispatched event "theme-updated" с forceFullApply
Шаг 5: runtimeMappingEngine делает double requestAnimationFrame
Шаг 6: Через 2 кадра applyThemeToDOM() применяет стили через DOM

НО: между шагами 3 и 6, если в runtimeMappingEngine
обрабатывается gradient-значение, вызывается:
  el.style.removeProperty('background-color')  // строка 97

Это УДАЛЯЕТ backgroundColor, который React поставил в шаге 3.
```

### Конкретный механизм сбоя

В файле `runtimeMappingEngine.ts`, строки 94-105:

```typescript
if (key === 'backgroundcolor') {
    if (isGradient) {
      el.style.background = String(value);
      el.style.removeProperty('background-color');  // <-- УДАЛЯЕТ React inline style!
    } else {
      el.style.backgroundColor = String(value);
      el.style.removeProperty('background');
    }
}
```

Когда предыдущая тема имела gradient-значение для backgroundColor (например `linear-gradient(...)`), engine вызывает `removeProperty('background-color')`. При переключении на новую тему:

1. React ставит `backgroundColor: "#F2A23A"` (inline)
2. Старый RAF callback (от предыдущей темы) еще не выполнился
3. Новый `theme-updated` event запускает НОВЫЙ double RAF
4. Возникает момент, когда `background-color` удалён, а новый еще не применён

Session replay подтверждает: `background-color` устанавливается в `false` (rrweb обозначение "свойство удалено").

### Вторая причина: useEffect в ThemeSelectorCoverflow

Файл `ThemeSelectorCoverflow.tsx`, строки 110-123:

```typescript
useEffect(() => {
    if (activeThemeId && themes.length > 0 && !isLoading) {
      const activeTheme = themes.find(t => t.id === activeThemeId);
      if (activeTheme && activeTheme.themeData) {
        applyJsonTheme(activeTheme.themeData, activeTheme.id);
      }
    }
}, [activeThemeId, themes, isLoading, applyJsonTheme]);
```

Этот useEffect вызывает `applyJsonTheme` каждый раз при смене `activeThemeId`. Это приводит к ДВОЙНОМУ вызову `setTheme` — первый раз из `selectTheme()`, второй раз из этого useEffect. Хотя `setTheme` имеет проверку на одинаковые данные, каждый вызов отправляет `theme-updated` event с `forceFullApply: true`, создавая гонку RAF callbacks.

---

### План исправления

#### Шаг 1: Защита от удаления backgroundColor в runtimeMappingEngine.ts

В `applyValueToNodeUnified` добавить проверку: не удалять `background-color` если элемент имеет React inline style.

```typescript
if (key === 'backgroundcolor') {
    if (isGradient) {
      el.style.background = String(value);
      // НЕ удалять background-color — React может использовать его
    } else {
      el.style.backgroundColor = String(value);
    }
}
```

#### Шаг 2: Убрать дублирующий useEffect в ThemeSelectorCoverflow.tsx

Удалить или переработать useEffect (строки 110-123), который повторно вызывает `applyJsonTheme` при смене `activeThemeId`. Тема уже применяется в `handleThemeClick` -> `selectTheme`. Дублирование создает race condition.

#### Шаг 3: Добавить debounce/cancel для RAF в runtimeMappingEngine

Отменять предыдущий pending RAF callback при получении нового `theme-updated` event, чтобы старый callback не конфликтовал с новым.

```typescript
let pendingRAF: number | null = null;

if (forceFullApply && isLockLayerVisible) {
    if (pendingRAF) cancelAnimationFrame(pendingRAF);
    pendingRAF = requestAnimationFrame(() => {
        pendingRAF = requestAnimationFrame(() => {
            applyThemeToDOM(theme);
            pendingRAF = null;
        });
    });
}
```

### Затронутые файлы

| Файл | Изменение |
|------|-----------|
| `src/services/runtimeMappingEngine.ts` | Убрать `removeProperty`, добавить RAF cancel |
| `src/components/customization/ThemeSelectorCoverflow.tsx` | Убрать дублирующий useEffect |

### Ожидаемый результат

После исправления: Unlock Button и Search Input сохраняют свои цвета из JSON-темы при любом переключении, без мерцания и сброса в белый цвет.

