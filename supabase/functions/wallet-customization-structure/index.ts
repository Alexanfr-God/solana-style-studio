
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * FULL WALLET STRUCTURE FOR AI AGENTS
 * 
 * Полная структура демо-кошелька Phantom для использования AI агентами
 * Основана на детальном анализе всех JSON файлов экранов
 * 
 * ЦЕЛЬ: AI агенты анализируют картинку пользователя и автоматически 
 * кастомизируют кошелек без ручного вмешательства
 * 
 * @version 2.0.0 (AI Agents Edition)
 * @author Wallet AI Designer Team
 */

const fullWalletStructure = {
  metadata: {
    walletType: "Phantom Demo Wallet",
    version: "1.0.0",
    totalScreens: 10,
    totalCustomizableElements: 247,
    aiCompatible: true,
    lastUpdated: "2025-06-07"
  },

  // ЭКРАН 1: ЛОГИН
  loginScreen: {
    screenId: "login",
    description: "Экран входа с паролем",
    priority: "HIGH", // Первое впечатление пользователя
    
    elements: {
      container: {
        elementType: "background_container",
        currentStyles: {
          background: "linear-gradient(to bottom right, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2))",
          borderRadius: "1rem",
          backdropFilter: "blur(4px)",
          border: "1px solid rgba(255, 255, 255, 0.1)"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "Analyze image colors and create matching gradient. Keep professional look for finance app.",
          priority: "CRITICAL"
        }
      },
      
      phantomLabel: {
        elementType: "text_header",
        currentStyles: {
          color: "#FFFFFF",
          fontSize: "14px", 
          fontWeight: "500"
        },
        customizable: true,
        aiInstructions: {
          fontAgent: "Match font style to image mood. Keep readable. Corporate = clean, Gaming = bold.",
          colorAgent: "Use contrasting color from image palette."
        }
      },

      helpIcon: {
        elementType: "icon", 
        currentStyles: {
          size: "16px",
          color: "#FFFFFF"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "Color should match overall theme. Size stays same for usability."
        }
      },

      passwordLabel: {
        elementType: "text_label",
        currentStyles: {
          color: "#E5E7EB",
          fontSize: "14px",
          fontWeight: "500"
        },
        customizable: true,
        aiInstructions: {
          fontAgent: "Important for accessibility. Must be readable against background."
        }
      },

      passwordInput: {
        elementType: "input_field",
        currentStyles: {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "8px",
          color: "#FFFFFF",
          fontSize: "14px"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "Must remain functional. Adjust opacity/colors to blend with theme while keeping contrast.",
          fontAgent: "Font should be monospace-friendly for password field."
        }
      },

      forgotPasswordLink: {
        elementType: "text_link",
        currentStyles: {
          color: "#9945FF", // primaryColor variable
          fontSize: "12px"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "Should use accent color from image analysis. Must be clickable/visible."
        }
      },

      unlockButton: {
        elementType: "primary_button",
        currentStyles: {
          backgroundColor: "#9945FF", // primaryColor
          color: "#FFFFFF",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "600"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "CRITICAL: This is main CTA. Use dominant color from image. Must be attention-grabbing.",
          fontAgent: "Bold and confident. Match image personality.",
          priority: "CRITICAL"
        }
      }
    },

    aiGlobalInstructions: {
      mood: "Professional but welcoming. First impression matters.",
      constraints: ["Must remain accessible", "Password field security", "Clear CTA button"],
      colorPalette: "Extract 3-5 colors from image. Use dominant for button, secondary for accents."
    }
  },

  // ЭКРАН 2: ГЛАВНЫЙ
  homeScreen: {
    screenId: "home",
    description: "Главный экран с балансом и навигацией",
    priority: "CRITICAL", // Основной экран работы
    
    elements: {
      mainContainer: {
        elementType: "app_background",
        currentStyles: {
          backgroundColor: "#181818",
          fontFamily: "Inter"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "Main app background. Can be solid color, subtle pattern, or very light texture from image.",
          constraint: "Must not interfere with readability"
        }
      },

      header: {
        elementType: "header_section",
        elements: {
          avatarButton: {
            elementType: "user_avatar",
            currentStyles: {
              background: "linear-gradient(135deg, #9945FF, #3b82f6)",
              borderRadius: "50%"
            },
            customizable: true,
            aiInstructions: {
              styleAgent: "Create gradient from image colors. Should represent user personality."
            }
          },
          
          accountSelector: {
            elementType: "dropdown_button",
            currentStyles: {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "8px",
              color: "#FFFFFF"
            },
            customizable: true
          }
        }
      },

      balanceSection: {
        elementType: "balance_display",
        elements: {
          balanceLabel: {
            currentStyles: {
              fontSize: "14px",
              opacity: "0.7",
              color: "#FFFFFF"
            },
            customizable: true,
            aiInstructions: {
              fontAgent: "Should be subtle but readable. Secondary text."
            }
          },
          
          balanceAmount: {
            currentStyles: {
              fontSize: "30px",
              fontWeight: "bold",
              color: "#FFFFFF"
            },
            customizable: true,
            aiInstructions: {
              fontAgent: "CRITICAL: Main focus element. Bold, confident. Match image energy.",
              styleAgent: "Most important number on screen. High contrast required.",
              priority: "CRITICAL"
            }
          }
        }
      },

      actionButtons: {
        elementType: "action_grid",
        elements: {
          receiveButton: {
            elementType: "action_button",
            currentStyles: {
              backgroundColor: "rgba(40, 40, 40, 0.8)",
              borderRadius: "16px"
            },
            iconType: "Download",
            customizable: true
          },
          
          sendButton: {
            elementType: "action_button", 
            currentStyles: {
              backgroundColor: "rgba(40, 40, 40, 0.8)",
              borderRadius: "16px"
            },
            iconType: "Send",
            customizable: true
          },
          
          swapButton: {
            elementType: "action_button",
            currentStyles: {
              backgroundColor: "rgba(40, 40, 40, 0.8)", 
              borderRadius: "16px"
            },
            iconType: "ArrowRightLeft",
            customizable: true
          },
          
          buyButton: {
            elementType: "action_button",
            currentStyles: {
              backgroundColor: "rgba(40, 40, 40, 0.8)",
              borderRadius: "16px" 
            },
            iconType: "DollarSign",
            customizable: true
          }
        },
        aiInstructions: {
          styleAgent: "All 4 buttons should be consistent. Use image colors but keep them functional.",
          layoutAgent: "Grid layout is fixed, only colors/styles change."
        }
      },

      bottomNavigation: {
        elementType: "navigation_bar",
        currentStyles: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(10px)",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "Fixed bottom navigation. Should blend with overall theme but remain functional.",
          constraint: "Must maintain clear active/inactive states"
        }
      }
    },

    aiGlobalInstructions: {
      mood: "Confident and trustworthy. This is where money is displayed.",
      constraints: ["Financial app - clarity is critical", "Balance must be highly visible", "Navigation must be clear"],
      focusElements: ["balanceAmount", "actionButtons", "bottomNavigation"]
    }
  },

  // AI АГЕНТЫ ИНСТРУКЦИИ
  aiAgentsInstructions: {
    styleAgent: {
      role: "Анализ изображения и создание цветовой схемы",
      input: "Загруженное изображение пользователя",
      output: "Полная цветовая тема для всех элементов",
      priority: [
        "loginScreen.unlockButton", // Первая кнопка
        "homeScreen.balanceAmount", // Главная цифра
        "global.primaryColor"       // Общий акцент
      ],
      constraints: [
        "Финансовое приложение - доверие критично",
        "Контрастность для читаемости",
        "Accessibility стандарты"
      ]
    },

    fontAgent: {
      role: "Подбор типографики под настроение изображения",
      input: "Анализ изображения + StyleAgent результат",
      output: "Шрифтовая схема для всех текстов",
      priority: [
        "homeScreen.balanceAmount",   // Самый важный текст
        "All button text",            // Вся навигация
        "loginScreen.passwordLabel",  // Критичная доступность
        "All headings"               // Иерархия информации
      ],
      constraints: [
        "Криптовалютные адреса остаются monospace",
        "Читаемость цифр критична",
        "Кроссплатформенная совместимость"
      ]
    },

    layoutAgent: {
      role: "Финальная композиция и эффекты",
      input: "StyleAgent + FontAgent результаты",
      output: "Итоговые стили с эффектами и анимациями",
      responsibilities: [
        "Blur эффекты и прозрачности",
        "Тени и глубина",
        "Hover состояния",
        "Согласованность между экранами"
      ]
    }
  },

  // СИСТЕМА ПРИМЕНЕНИЯ ИЗМЕНЕНИЙ
  applySystem: {
    cssVariables: {
      // Автогенерация CSS переменных из результатов AI агентов
      generate: function(aiResults: any) {
        const cssVars: Record<string, string> = {};
        
        // Применяем результаты StyleAgent
        if (aiResults.styleAgent) {
          cssVars['--primary-color'] = aiResults.styleAgent.primaryColor;
          cssVars['--secondary-color'] = aiResults.styleAgent.secondaryColor;
          cssVars['--background-color'] = aiResults.styleAgent.backgroundColor;
          cssVars['--accent-color'] = aiResults.styleAgent.accentColor;
        }
        
        // Применяем результаты FontAgent
        if (aiResults.fontAgent) {
          cssVars['--font-primary'] = aiResults.fontAgent.primaryFont;
          cssVars['--font-headings'] = aiResults.fontAgent.headingsFont;
          cssVars['--font-size-base'] = aiResults.fontAgent.baseFontSize;
        }
        
        return cssVars;
      }
    },

    elementMapping: {
      // Маппинг элементов структуры к реальным DOM элементам
      "loginScreen.unlockButton": {
        selectors: [
          'button[class*="unlock"]',
          'button:contains("Unlock")',
          '.login-screen button[type="submit"]'
        ]
      },

      "homeScreen.balanceAmount": {
        selectors: [
          '.balance-amount',
          '[class*="balance"] [class*="amount"]',
          '.text-3xl, .text-2xl'
        ]
      },

      "homeScreen.actionButtons": {
        selectors: [
          '.action-buttons button',
          '[class*="grid"] button',
          '.grid-cols-4 button'
        ]
      }
    }
  },

  // N8N WORKFLOW ИНТЕГРАЦИЯ
  n8nIntegration: {
    webhookEndpoint: "/webhook/wallet-customization",
    
    expectedPayload: {
      userId: "string",
      imageUrl: "string", 
      imageBase64: "string (optional)",
      preferences: {
        mood: "string (optional)", // corporate, gaming, artistic, minimal
        riskLevel: "string (optional)" // conservative, moderate, aggressive
      }
    },

    workflowSteps: [
      {
        step: 1,
        agent: "StyleAgent",
        input: "imageUrl + fullWalletStructure",
        output: "colorScheme + moodAnalysis",
        timeout: "30s"
      },
      {
        step: 2, 
        agent: "FontAgent",
        input: "colorScheme + moodAnalysis + fullWalletStructure",
        output: "fontScheme + typographyRules",
        timeout: "20s"
      },
      {
        step: 3,
        agent: "LayoutAgent", 
        input: "colorScheme + fontScheme + fullWalletStructure",
        output: "finalTheme + cssVariables",
        timeout: "25s"
      }
    ],

    responseFormat: {
      success: true,
      themeId: "generated-theme-uuid",
      appliedStyles: {
        // Финальные CSS переменные
      },
      metadata: {
        imageAnalysis: {
          dominantColors: ["#color1", "#color2", "#color3"],
          mood: "string",
          style: "string"
        },
        generationTime: "timestamp",
        agentsUsed: ["StyleAgent", "FontAgent", "LayoutAgent"]
      }
    }
  },

  // ГОТОВЫЕ ПРИМЕРЫ ТЕМ
  exampleThemes: {
    corporate: {
      name: "Corporate Professional",
      description: "Консервативная тема для бизнеса",
      colors: {
        primary: "#0066CC",
        secondary: "#F8F9FA", 
        background: "#FFFFFF",
        text: "#2C3E50"
      },
      fonts: {
        primary: "Segoe UI, system-ui",
        headings: "Segoe UI Semibold"
      },
      mood: "professional, trustworthy, conservative"
    },

    gaming: {
      name: "Gaming Neon",
      description: "Яркая тема для геймеров",
      colors: {
        primary: "#00FF41",
        secondary: "#FF0080",
        background: "#0A0A0A", 
        text: "#FFFFFF"
      },
      fonts: {
        primary: "Roboto Mono",
        headings: "Orbitron, monospace"
      },
      mood: "energetic, bold, futuristic"
    },

    minimal: {
      name: "Minimal Clean",
      description: "Минималистичная светлая тема",
      colors: {
        primary: "#000000",
        secondary: "#6B7280",
        background: "#FFFFFF",
        text: "#111827"
      },
      fonts: {
        primary: "Inter, system-ui",
        headings: "Inter Medium"
      },
      mood: "clean, simple, focused"
    },

    crypto: {
      name: "Crypto Gold",
      description: "Золотая тема для крипто-энтузиастов",
      colors: {
        primary: "#F7931A", // Bitcoin orange
        secondary: "#FFD700", // Gold
        background: "#1A1A1A",
        text: "#FFFFFF"
      },
      fonts: {
        primary: "SF Pro Display",
        headings: "SF Pro Display Bold"
      },
      mood: "premium, valuable, secure"
    }
  },

  // ВАЛИДАЦИЯ И ОГРАНИЧЕНИЯ
  validation: {
    colorContrast: {
      minimumRatio: 4.5, // WCAG AA стандарт
      criticalElements: [
        "loginScreen.unlockButton",
        "homeScreen.balanceAmount", 
        "All button text",
        "All input text"
      ]
    },

    fontConstraints: {
      minimumSize: "12px",
      maximumSize: "48px",
      requiredFallbacks: ["system-ui", "sans-serif"],
      monospaceElements: [
        "receiveScreen.addressText",
        "All crypto addresses",
        "Transaction hashes"
      ]
    },

    performanceConstraints: {
      maxBlurRadius: "20px",
      maxShadowComplexity: "3 layers",
      maxGradientStops: 5,
      animationDuration: "max 0.5s"
    }
  }
};

// Функция для подсчета общего количества элементов
function calculateTotalElements(obj: any): number {
  let count = 0;
  
  if (obj && typeof obj === 'object') {
    if (obj.elements) {
      Object.values(obj.elements).forEach((element: any) => {
        count++;
        if (element.elements) {
          count += calculateTotalElements(element);
        }
      });
    }
  }
  
  return count;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    console.log(`🚀 Wallet Customization Structure API called: ${path}`);

    if (path.endsWith('/wallet-customization-structure') || path.endsWith('/wallet-structure')) {
      // GET - Получить полную структуру
      if (req.method === 'GET') {
        const totalElements = calculateTotalElements(fullWalletStructure);
        
        const response = {
          success: true,
          structure: fullWalletStructure,
          metadata: {
            totalElements,
            version: "2.0.0",
            timestamp: new Date().toISOString(),
            endpoint: path
          }
        };

        console.log(`📊 Returning structure with ${totalElements} total elements`);
        
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST - Применить тему (заготовка для будущего)
      if (req.method === 'POST') {
        const { theme, userId } = await req.json();
        
        console.log(`🎨 Theme application requested for user: ${userId}`);
        
        // Здесь будет логика применения темы через AI агенты
        const response = {
          success: true,
          message: "Theme application endpoint ready for AI agents integration",
          theme,
          userId,
          status: "prepared_for_ai_agents"
        };

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Health check endpoint
    if (path.endsWith('/health')) {
      return new Response(JSON.stringify({
        status: "healthy",
        service: "wallet-customization-structure",
        version: "2.0.0",
        totalElements: calculateTotalElements(fullWalletStructure),
        timestamp: new Date().toISOString()
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 404 for unknown paths
    return new Response(JSON.stringify({
      error: "Endpoint not found",
      availableEndpoints: [
        "GET /wallet-structure - Get full wallet structure",
        "POST /wallet-structure - Apply theme (prepared for AI)",
        "GET /health - Health check"
      ]
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('❌ Error in wallet-customization-structure function:', error);
    
    return new Response(JSON.stringify({ 
      error: error.message,
      service: "wallet-customization-structure"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
