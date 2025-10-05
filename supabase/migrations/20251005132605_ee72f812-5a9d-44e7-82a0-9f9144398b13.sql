-- Создаём базовую тему для manual edit с правильной структурой
INSERT INTO public.user_themes (user_id, theme_data, version)
VALUES (
  'user-theme-manual-edit',
  '{
    "button": {
      "primary": {
        "background": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "color": "#ffffff",
        "borderRadius": "12px",
        "fontSize": "16px",
        "fontWeight": "600"
      },
      "secondary": {
        "background": "rgba(255, 255, 255, 0.1)",
        "color": "#ffffff",
        "borderRadius": "12px"
      }
    },
    "input": {
      "field": {
        "background": "rgba(255, 255, 255, 0.05)",
        "borderColor": "rgba(255, 255, 255, 0.2)",
        "color": "#ffffff"
      }
    },
    "assetCard": {
      "title": {
        "color": "#ffffff",
        "fontSize": "18px",
        "fontWeight": "600"
      }
    }
  }'::jsonb,
  1
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  theme_data = EXCLUDED.theme_data,
  updated_at = now();