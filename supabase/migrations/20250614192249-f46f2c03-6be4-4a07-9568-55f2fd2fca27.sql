-- ЭТАП 1: Создание структурированной БД для масштабируемой архитектуры

-- 1. Таблица для детального анализа структуры кошельков
CREATE TABLE public.wallet_structure_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_type TEXT NOT NULL, -- phantom, solana, metamask, etc.
  screen_type TEXT NOT NULL, -- login, wallet, swap, send, receive, etc.
  subtype TEXT, -- дополнительная категоризация экранов
  version TEXT NOT NULL DEFAULT '1.0', -- версионирование структуры
  ui_structure JSONB NOT NULL DEFAULT '{}', -- детальная UI структура (layout, components, zones)
  functional_context JSONB NOT NULL DEFAULT '{}', -- функциональный контекст и пользовательские сценарии
  generation_context JSONB NOT NULL DEFAULT '{}', -- контекст для AI генерации
  safe_zones JSONB NOT NULL DEFAULT '{}', -- критические зоны, которые нельзя перекрывать
  color_palette JSONB NOT NULL DEFAULT '{}', -- цветовая палитра экрана
  typography JSONB NOT NULL DEFAULT '{}', -- типографика и шрифты
  interactivity JSONB NOT NULL DEFAULT '{}', -- интерактивные элементы
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2. Таблица для кэширования AI анализа изображений
CREATE TABLE public.image_analysis_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  image_hash TEXT, -- хэш для дедупликации одинаковых изображений
  analysis_result JSONB NOT NULL DEFAULT '{}', -- результат AI анализа (цвета, стиль, настроение, композиция)
  analysis_version TEXT NOT NULL DEFAULT '1.0', -- версия анализа для совместимости
  analysis_duration_ms INTEGER, -- время анализа в миллисекундах
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 3. Таблица для результатов кастомизации (связывает всё вместе)
CREATE TABLE public.customization_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL, -- идентификатор сессии кастомизации
  user_id UUID, -- привязка к пользователю (если залогинен)
  wallet_structure_id UUID REFERENCES public.wallet_structure_analysis(id),
  image_analysis_id UUID REFERENCES public.image_analysis_cache(id),
  customization_data JSONB NOT NULL DEFAULT '{}', -- финальный результат кастомизации
  n8n_payload JSONB, -- payload отправленный в N8N
  n8n_result JSONB, -- результат полученный от N8N
  status TEXT NOT NULL DEFAULT 'processing', -- processing, completed, failed, timeout
  processing_time_ms INTEGER, -- общее время обработки
  error_details JSONB, -- детали ошибок для диагностики
  quality_score DECIMAL(3,2), -- оценка качества результата (0.00-1.00)
  user_feedback TEXT, -- обратная связь от пользователя
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Включаем Row Level Security для всех таблиц
ALTER TABLE public.wallet_structure_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_analysis_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customization_results ENABLE ROW LEVEL SECURITY;

-- RLS политики для публичного доступа к структурам кошельков (они общие для всех)
CREATE POLICY "Wallet structures are viewable by everyone" 
ON public.wallet_structure_analysis 
FOR SELECT 
USING (true);

-- RLS политики для кэша анализа изображений (публичный доступ для оптимизации)
CREATE POLICY "Image analysis cache is viewable by everyone" 
ON public.image_analysis_cache 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert image analysis" 
ON public.image_analysis_cache 
FOR INSERT 
WITH CHECK (true);

-- RLS политики для результатов кастомизации (привязаны к пользователю или сессии)
CREATE POLICY "Users can view their own customization results" 
ON public.customization_results 
FOR SELECT 
USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can create customization results" 
ON public.customization_results 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own customization results" 
ON public.customization_results 
FOR UPDATE 
USING (auth.uid() = user_id OR user_id IS NULL);

-- Индексы для быстрого поиска
CREATE INDEX idx_wallet_structure_type_screen ON public.wallet_structure_analysis(wallet_type, screen_type);
CREATE INDEX idx_wallet_structure_version ON public.wallet_structure_analysis(version);
CREATE INDEX idx_image_analysis_url ON public.image_analysis_cache(image_url);
CREATE INDEX idx_image_analysis_hash ON public.image_analysis_cache(image_hash);
CREATE INDEX idx_customization_session ON public.customization_results(session_id);
CREATE INDEX idx_customization_user ON public.customization_results(user_id);
CREATE INDEX idx_customization_status ON public.customization_results(status);
CREATE INDEX idx_customization_created ON public.customization_results(created_at);

-- Уникальные ограничения
CREATE UNIQUE INDEX unique_wallet_structure ON public.wallet_structure_analysis(wallet_type, screen_type, subtype, version);
CREATE UNIQUE INDEX unique_image_hash ON public.image_analysis_cache(image_hash) WHERE image_hash IS NOT NULL;

-- Триггеры для автообновления updated_at
CREATE TRIGGER update_wallet_structure_analysis_updated_at
  BEFORE UPDATE ON public.wallet_structure_analysis
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_image_analysis_cache_updated_at
  BEFORE UPDATE ON public.image_analysis_cache
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customization_results_updated_at
  BEFORE UPDATE ON public.customization_results
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Добавляем начальные данные для Phantom кошелька (на основе существующего анализа)
INSERT INTO public.wallet_structure_analysis (
  wallet_type, 
  screen_type, 
  version,
  ui_structure,
  functional_context,
  generation_context,
  safe_zones,
  color_palette,
  typography,
  interactivity
) VALUES (
  'phantom',
  'login',
  '1.0',
  '{
    "dimensions": {"width": 320, "height": 569, "aspectRatio": "9:16"},
    "layout": {
      "type": "login",
      "primaryElements": [
        "Solana logo circle (top center)",
        "Welcome title text",
        "Description paragraph", 
        "Email input field",
        "Password input field",
        "Login button",
        "Create account link",
        "Version footer"
      ],
      "interactiveElements": [
        "Email input (center, transparent background)",
        "Password input (center, transparent background)", 
        "Login button (primary action)",
        "Create account link (secondary action)"
      ],
      "visualHierarchy": [
        "1. Solana logo (visual anchor)",
        "2. Welcome text (primary message)",
        "3. Input fields (user interaction)",
        "4. Login button (call to action)",
        "5. Secondary links (optional actions)"
      ]
    }
  }',
  '{
    "purpose": "Secure authentication gateway for Solana wallet access",
    "userFlow": [
      "User sees welcoming Solana branding",
      "User enters email credentials", 
      "User enters secure password",
      "User clicks login to authenticate",
      "User can access create account option"
    ],
    "criticalFeatures": [
      "Email validation input",
      "Secure password entry",
      "One-click authentication", 
      "Account creation pathway",
      "Visual feedback on interaction"
    ],
    "designPhilosophy": "Clean, secure, user-friendly crypto wallet entrance"
  }',
  '{
    "promptEnhancement": "Character interacting with a functional Solana wallet login screen featuring a centered #9945FF Solana logo, clean #131313 background, two transparent input fields for email and secure password entry, and a prominent #9945FF login button. The interface uses Inter, sans-serif typography with #FFFFFF text, creating a professional crypto authentication experience.",
    "characterInteractionGuidelines": [
      "Character should embrace/protect the login interface",
      "Maintain clear visibility of Solana logo and branding",
      "Ensure input fields remain completely accessible",
      "Preserve the security-focused design aesthetic",
      "Character positioning should enhance, not obscure, the login flow"
    ],
    "preservationRules": [
      "Login button must remain fully visible and clickable",
      "Input fields cannot be covered or blocked", 
      "Solana logo must stay centered and prominent",
      "Text readability is critical for user trust",
      "Color scheme integrity must be maintained"
    ],
    "styleAdaptation": "Adapt character style to complement the #131313 background and #9945FF accent colors, ensuring the character enhances the professional crypto wallet aesthetic"
  }',
  '{
    "x": 352,
    "y": 228, 
    "width": 320,
    "height": 569,
    "criticalElements": [
      "Solana logo (must remain visible)",
      "Input fields (must be accessible)",
      "Login button (must be clickable)",
      "All text content (must be readable)"
    ]
  }',
  '{
    "primary": "#131313",
    "secondary": "#9945FF", 
    "accent": "#9945FF",
    "text": "#FFFFFF",
    "background": "#131313",
    "gradients": []
  }',
  '{
    "fontFamily": "Inter, sans-serif",
    "primaryTextColor": "#FFFFFF",
    "secondaryTextColor": "#FFFFFF80",
    "textSizes": [
      "text-2xl (title)",
      "text-sm (description)",
      "text-xs (footer)"
    ]
  }',
  '{
    "buttons": [
      {
        "type": "primary",
        "position": "center-bottom",
        "color": "#9945FF",
        "textColor": "#000000", 
        "functionality": "authenticate user"
      }
    ],
    "inputs": [
      {
        "type": "email",
        "placeholder": "Email",
        "position": "center",
        "styling": "transparent background with rounded corners"
      },
      {
        "type": "password", 
        "placeholder": "Password",
        "position": "center-below-email",
        "styling": "transparent background with rounded corners"
      }
    ],
    "animations": [
      "button hover effects",
      "input focus states", 
      "subtle transitions"
    ]
  }'
);