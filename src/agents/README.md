# Discovery System

Адаптерный слой для автоматической синхронизации DOM элементов кошелька с БД `wallet_elements`.

## 🎯 Философия: ONE-PATH MODE

Один `json_path` → одно скалярное значение в Theme JSON → рантайм сам применяет.

**Никаких правок DOM/рендеринга** - Discovery только читает существующий превью и синхронизирует с БД.

## 📂 Архитектура

```
src/agents/
├── spec/
│   └── mappingSpec.ts          # Эталонный словарь data-element-id → json_path
├── mcp/
│   ├── DomInspector.ts         # Интерфейс для сканирования DOM
│   ├── LocalDomInspector.ts    # Локальная реализация (текущий превью)
│   ├── DbAdapter.ts            # Интерфейс для работы с БД
│   └── SupabaseDbAdapter.ts    # Реализация через Supabase
└── discovery/
    ├── DiscoverService.ts      # Основной сервис (scan → plan → apply)
    └── ValidationService.ts    # Валидатор (проверка json_path в Theme JSON)
```

## 🔍 Компоненты

### 1. **mappingSpec.ts** - Эталонный словарь
Определяет SCALAR маппинги для каждого экрана:
```typescript
export const LOCK_SCREEN_SPEC = {
  'unlock-screen-container': '/lockLayer/backgroundColor',
  'lock-title-text': '/lockLayer/title/textColor',
  // ...
}
```

### 2. **DomInspector** - Интерфейс для сканирования
```typescript
interface DomInspector {
  scan(screen: 'lock' | 'home'): DomInspectionResult[];
}
```

**Текущая реализация**: `LocalDomInspector`
- Ищет контейнер: `[data-wallet-container]` (фолбэки: `[data-testid="wallet-preview"]`, `.wallet-preview`)
- Сканирует элементы: `[data-element-id^="lock-"]` или `[data-element-id^="home-"]`

**Будущая реализация**: `ChromeDevtoolsInspector` (MCP chrome-devtools protocol)

### 3. **DbAdapter** - Интерфейс для БД
```typescript
interface DbAdapter {
  upsertWalletElements(items: WalletElementRecord[]): Promise<UpsertResult>;
  fetchWalletElements(screen: 'lock' | 'home'): Promise<WalletElementRecord[]>;
}
```

**Реализация**: `SupabaseDbAdapter`
- UPSERT в `wallet_elements` по `id`
- Fetch существующих элементов для проверки изменений

### 4. **DiscoverService** - Основной сервис
```typescript
class DiscoverService {
  async discover(screen: 'lock' | 'home', dryRun = true): Promise<DiscoveryResult>
}
```

**Workflow**:
1. **Scan** - сканирует DOM через `DomInspector`
2. **Plan** - маппит элементы на `json_path` из `mappingSpec`
3. **Check** - проверяет существование путей в Theme JSON
4. **Detect** - находит изменения путей относительно БД
5. **Apply** - если не `dryRun`, делает UPSERT в БД

### 5. **ValidationService** - Валидатор
```typescript
class ValidationService {
  async validate(screen: 'lock' | 'home'): Promise<ValidationResult[]>
}
```

Проверяет: существуют ли `json_path` из БД в текущем Theme JSON.

## 🎮 Использование

### UI (в Admin Panel)

1. Выбрать экран: **Lock** / **Home**
2. **Dry-run** (по умолчанию ON) - только показать план, без применения
3. **Override existing paths** - разрешить перезапись путей (только если не dry-run)
4. Кнопка **Discover** → сканирует DOM, показывает план
5. Кнопка **Validate** → проверяет существование путей в Theme JSON

### Программно

```typescript
import { DiscoverService } from '@/agents/discovery/DiscoverService';
import { LocalDomInspector } from '@/agents/mcp/LocalDomInspector';
import { SupabaseDbAdapter } from '@/agents/mcp/SupabaseDbAdapter';
import { useThemeStore } from '@/state/themeStore';

const service = new DiscoverService(
  new LocalDomInspector(),
  new SupabaseDbAdapter(),
  () => useThemeStore.getState().theme
);

// Dry-run (только план)
const plan = await service.discover('lock', true);
console.log('Plan:', plan.planned);

// Apply (UPSERT в БД)
const result = await service.discover('lock', false);
console.log('Applied:', result.updated, 'elements');
```

## 🔒 Безопасность

### Защита от случайной перезаписи

Discovery **не перезаписывает** существующие `json_path` в БД без явного подтверждения:

1. При сканировании проверяет, есть ли уже запись в БД для данного `id`
2. Если `json_path` отличается, помечает как **"Path Changed"**
3. В UI показывает:
   - Старый путь: `Was: /oldPath`
   - Новый путь: `/newPath`
   - Статус: `Path Changed` (оранжевый бейдж)
4. Для применения требуется включить чекбокс **"Override existing paths"**

### Dry-run по умолчанию

- **Dry-run = ON** жирно подсвечено в UI
- При dry-run показывается только план, БД не меняется
- Для применения нужно явно снять чекбокс

## 🚀 Roadmap: MCP Integration

### Текущая архитектура
```
LocalDomInspector → сканирует локальный DOM в браузере
```

### Будущая архитектура (MCP)
```typescript
// mcp/ChromeDevtoolsInspector.ts
export class ChromeDevtoolsInspector implements DomInspector {
  constructor(private mcpClient: McpClient) {}
  
  async scan(screen: 'lock' | 'home'): Promise<DomInspectionResult[]> {
    // MCP chrome-devtools protocol
    const response = await this.mcpClient.call('DOM.querySelectorAll', {
      nodeId: rootNodeId,
      selector: `[data-element-id^="${screen}-"]`
    });
    
    return response.nodeIds.map(nodeId => ({
      id: await this.getElementId(nodeId),
      selector: `[data-element-id="..."]`
    }));
  }
  
  private async getElementId(nodeId: number): Promise<string> {
    const attrs = await this.mcpClient.call('DOM.getAttributes', { nodeId });
    return attrs.find((a, i) => a === 'data-element-id' && attrs[i + 1])?.[1];
  }
}
```

### Преимущества MCP
- ✅ Удалённое сканирование DOM без доступа к браузеру разработчика
- ✅ Автоматическая синхронизация при изменении кода
- ✅ Работа с production-версией приложения
- ✅ Интеграция с CI/CD

### Замена
```typescript
// Было:
const service = new DiscoverService(
  new LocalDomInspector(),
  // ...
);

// Станет:
const service = new DiscoverService(
  new ChromeDevtoolsInspector(mcpClient),
  // ...
);
```

Вся остальная логика (DiscoverService, ValidationService, UI) **не меняется**.

## 📊 Логирование

Все действия логируются с префиксами:

```
[DISCOVER] 🔍 Starting discovery for screen="lock" (dry-run: true)
[DISCOVER] 📋 Planned 9 elements
[DISCOVER] ✅ Applied: 0 inserted, 9 updated

[VALIDATE] 🔍 Validating mappings for screen="lock"
[VALIDATE] ✅ 8 OK, ❌ 1 missing

[LocalDomInspector] ✅ Found wallet container: [data-wallet-container]
[LocalDomInspector] 🔍 Found 9 elements for screen="lock"

[SupabaseDbAdapter] 🔄 Upserting 9 elements...
[SupabaseDbAdapter] ✅ Upserted 9 elements
```

## ✅ Acceptance Criteria

- [x] Кнопка "Discover elements" находит все `lock-*` / `home-*` элементы
- [x] Маппит на SCALAR `json_path` из `mappingSpec`
- [x] Поддерживает `dry-run` (показать план) и `apply` (UPSERT в БД)
- [x] Валидатор показывает, какие `json_path` существуют в Theme JSON
- [x] **Ноль изменений** в превью кошелька (WalletPreviewContainer, runtimeMappingEngine, etc.)
- [x] Защита от случайной перезаписи путей (требуется чекбокс "Override existing")
- [x] Dry-run по умолчанию включён и жирно подсвечен
- [x] Понятное логирование с префиксами `[DISCOVER]` / `[VALIDATE]`
- [x] Модульная архитектура: `LocalDomInspector` → `ChromeDevtoolsInspector` (будущее)

## 🎯 Почему так осторожно?

> Превью кошелька — это **эталон**. Мы **не правим рендеринг**, только **авто-наполняем** `wallet_elements` и **валидируем** `json_path`.

**Выигрыш**:
- ✅ Manual Editor = Git (всё из БД, никаких дублирований DOM)
- ✅ Безопасная синхронизация (dry-run + override protection)
- ✅ Готовность к MCP без переписывания логики
- ✅ Нулевые регрессии в существующем коде

## 📝 Commit Message

```
feat(discovery): add DOM discovery system with dry-run & path protection

- Create mapping spec for Lock/Home screens (SCALAR json_paths)
- Implement DomInspector interface + LocalDomInspector (fallback selectors)
- Implement DbAdapter interface + SupabaseDbAdapter (upsert/fetch)
- Create DiscoverService (scan → plan → detect changes → apply)
- Create ValidationService (check json_path in Theme JSON)
- Add DiscoveryPanel UI (dry-run ON by default, override protection)
- Add comprehensive documentation (src/agents/README.md)
- Zero changes to wallet preview rendering
```
