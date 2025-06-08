import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const N8N_WEBHOOK_URL = "https://wacocu.app.n8n.cloud/webhook/wallet-ai-designer";

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

      assetsSection: {
        elementType: "token_list",
        elements: {
          assetItem: {
            elementType: "token_card",
            currentStyles: {
              backgroundColor: "rgba(40, 40, 40, 0.8)",
              borderRadius: "16px",
              padding: "16px"
            },
            customizable: true,
            aiInstructions: {
              styleAgent: "Cards for crypto tokens. Should feel valuable and secure."
            }
          }
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

  // ЭКРАН 3: ОТПРАВКА
  sendScreen: {
    screenId: "send",
    description: "Экран выбора сети для отправки",
    priority: "HIGH",
    
    elements: {
      overlayBackground: {
        elementType: "modal_overlay",
        currentStyles: {
          backgroundColor: "rgba(24, 24, 24, 0.95)",
          backdropFilter: "blur(20px)"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "Modal overlay. Should create focus on content while keeping theme consistency."
        }
      },

      headerSection: {
        elements: {
          backButton: {
            elementType: "navigation_button",
            currentStyles: {
              color: "#FFFFFF",
              backgroundColor: "transparent"
            },
            customizable: true
          },
          
          title: {
            elementType: "modal_title",
            currentStyles: {
              fontSize: "18px",
              fontWeight: "600",
              color: "#FFFFFF"
            },
            customizable: true,
            aiInstructions: {
              fontAgent: "Clear, bold title. Should match heading style from main screen."
            }
          }
        }
      },

      searchInput: {
        elementType: "search_field",
        currentStyles: {
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "12px",
          color: "#FFFFFF"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "Search functionality. Should be discoverable but not overwhelming."
        }
      },

      networksList: {
        elementType: "selection_list",
        elements: {
          networkItem: {
            elementType: "selectable_item",
            currentStyles: {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "16px",
              padding: "16px"
            },
            customizable: true,
            aiInstructions: {
              styleAgent: "Individual network options. Should feel clickable and important (crypto networks)."
            }
          }
        }
      }
    },

    aiGlobalInstructions: {
      mood: "Focused and decisive. User is making transaction decisions.",
      constraints: ["Modal should focus attention", "Networks must be clearly selectable", "Search must be functional"],
      inheritsFrom: "homeScreen" // Должен чувствоваться как часть того же приложения
    }
  },

  // ЭКРАН 4: ПОЛУЧЕНИЕ  
  receiveScreen: {
    screenId: "receive",
    description: "Экран адресов для получения криптовалют",
    priority: "HIGH",
    
    elements: {
      overlayBackground: {
        elementType: "modal_overlay", 
        currentStyles: {
          backgroundColor: "rgba(24, 24, 24, 0.95)",
          backdropFilter: "blur(20px)"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "Same as sendScreen overlay for consistency."
        }
      },

      networksList: {
        elementType: "address_list",
        elements: {
          networkItem: {
            elements: {
              addressText: {
                elementType: "monospace_text",
                currentStyles: {
                  fontFamily: "monospace",
                  fontSize: "12px",
                  color: "#D1D5DB"
                },
                customizable: false,
                aiInstructions: {
                  constraint: "Crypto addresses must remain monospace for readability. Only color can change."
                }
              },
              
              copyButton: {
                elementType: "icon_button",
                currentStyles: {
                  padding: "6px",
                  borderRadius: "4px",
                  color: "#9CA3AF"
                },
                customizable: true,
                aiInstructions: {
                  styleAgent: "Copy action. Should be discoverable but not distracting."
                }
              },
              
              qrButton: {
                elementType: "icon_button", 
                currentStyles: {
                  padding: "6px",
                  borderRadius: "4px",
                  color: "#9CA3AF"
                },
                customizable: true
              }
            }
          }
        }
      }
    },

    aiGlobalInstructions: {
      mood: "Secure and precise. User is sharing their crypto address.",
      constraints: ["Addresses must be clearly readable", "Copy/QR functions must be obvious"],
      inheritsFrom: "sendScreen"
    }
  },

  // ЭКРАН 5: ПОКУПКА
  buyScreen: {
    screenId: "buy",
    description: "Экран покупки токенов с категориями",
    priority: "MEDIUM",
    
    elements: {
      overlayBackground: {
        elementType: "modal_overlay",
        currentStyles: {
          backgroundColor: "rgba(24, 24, 24, 0.95)",
          backdropFilter: "blur(20px)"
        },
        customizable: true
      },

      searchInput: {
        elementType: "search_field",
        currentStyles: {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px"
        },
        customizable: true
      },

      getStartedSection: {
        elementType: "featured_tokens",
        elements: {
          getStartedToken: {
            elementType: "featured_token_card",
            currentStyles: {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              padding: "16px"
            },
            elements: {
              buyButton: {
                elementType: "primary_action_button",
                currentStyles: {
                  backgroundColor: "#9945FF", // walletStyle.primaryColor
                  color: "#FFFFFF",
                  borderRadius: "8px"
                },
                customizable: true,
                aiInstructions: {
                  styleAgent: "Primary purchase button. Should be compelling and trustworthy.",
                  priority: "HIGH"
                }
              }
            }
          }
        }
      },

      popularSection: {
        elementType: "token_list",
        elements: {
          popularToken: {
            elementType: "token_card",
            elements: {
              buyButton: {
                elementType: "secondary_action_button",
                currentStyles: {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  color: "#FFFFFF",
                  borderRadius: "8px"
                },
                customizable: true,
                aiInstructions: {
                  styleAgent: "Secondary buy button. Less prominent than featured tokens."
                }
              }
            }
          }
        }
      }
    },

    aiGlobalInstructions: {
      mood: "Encouraging and trustworthy. User is spending money.",
      constraints: ["Buy buttons must be clearly actionable", "Token information must be clear"],
      inheritsFrom: "homeScreen"
    }
  },

  // ЭКРАН 6: ОБМЕН
  swapScreen: {
    screenId: "swap",
    description: "Экран обмена токенов",
    priority: "HIGH",
    
    elements: {
      swapContainer: {
        elementType: "main_widget",
        currentStyles: {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "24px"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "Central swap widget. Should feel secure and precise for financial transactions.",
          priority: "HIGH"
        }
      },

      fromTokenPanel: {
        elementType: "token_input_panel",
        currentStyles: {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          padding: "16px"
        },
        customizable: true
      },

      swapDirectionButton: {
        elementType: "swap_toggle_button",
        currentStyles: {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "50%",
          padding: "8px"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "Swap direction toggle. Should be discoverable and feel interactive."
        }
      },

      toTokenPanel: {
        elementType: "token_input_panel",
        currentStyles: {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          padding: "16px"
        },
        customizable: true
      },

      swapButton: {
        elementType: "primary_action_button",
        currentStyles: {
          backgroundColor: "#9945FF",
          color: "#FFFFFF",
          borderRadius: "12px",
          padding: "16px 0",
          fontSize: "16px",
          fontWeight: "500"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "CRITICAL: Main swap execution button. Must be trustworthy and prominent.",
          fontAgent: "Bold and confident. This executes financial transaction.",
          priority: "CRITICAL"
        }
      }
    },

    aiGlobalInstructions: {
      mood: "Precise and trustworthy. User is executing financial transactions.",
      constraints: ["Swap button must be highly visible", "Token inputs must be clear", "Exchange rate must be readable"],
      focusElements: ["swapButton", "fromTokenPanel", "toTokenPanel"]
    }
  },

  // ЭКРАН 7: ПРИЛОЖЕНИЯ/NFT
  appsScreen: {
    screenId: "apps",
    description: "Экран NFT коллекций и приложений",
    priority: "MEDIUM",
    
    elements: {
      overlayBackground: {
        elementType: "modal_overlay",
        currentStyles: {
          backgroundColor: "rgba(24, 24, 24, 0.95)",
          backdropFilter: "blur(13px)"
        },
        customizable: true
      },

      mainContainer: {
        elementType: "content_container",
        currentStyles: {
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          borderRadius: "12px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          padding: "24px"
        },
        customizable: true
      },

      collectiblesGrid: {
        elementType: "nft_grid",
        elements: {
          collectibleItem: {
            elementType: "nft_card",
            currentStyles: {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              padding: "16px"
            },
            customizable: true,
            aiInstructions: {
              styleAgent: "NFT/collectible items. Should feel valuable and artistic. Can be more creative with colors."
            }
          }
        }
      },

      placeholderGrid: {
        elementType: "placeholder_grid",
        elements: {
          placeholderItem: {
            elementType: "placeholder_card",
            currentStyles: {
              background: "linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2))",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            },
            customizable: true,
            aiInstructions: {
              styleAgent: "Placeholder for future NFTs. Can use image colors for gradient."
            }
          }
        }
      }
    },

    aiGlobalInstructions: {
      mood: "Creative and artistic. NFT/collectibles space allows more visual freedom.",
      constraints: ["Grid layout must remain functional", "Placeholders should be inviting"],
      allowsCreativity: true
    }
  },

  // ЭКРАН 8: ИСТОРИЯ
  historyScreen: {
    screenId: "history",
    description: "История транзакций по датам",
    priority: "MEDIUM",
    
    elements: {
      container: {
        elementType: "scrollable_content",
        currentStyles: {
          padding: "12px 16px"
        },
        customizable: true
      },

      transactionGroups: {
        elementType: "transaction_timeline",
        elements: {
          dateHeader: {
            elementType: "date_label",
            currentStyles: {
              fontSize: "12px",
              color: "#9CA3AF",
              fontWeight: "500"
            },
            customizable: true
          },

          transactionItem: {
            elementType: "transaction_card",
            currentStyles: {
              padding: "12px",
              borderRadius: "12px",
              backgroundColor: "transparent"
            },
            elements: {
              statusIndicator: {
                elementType: "status_badge",
                currentStyles: {
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px"
                },
                customizable: true,
                aiInstructions: {
                  styleAgent: "Status indicators for transactions. Use green=success, red=failed, blue=pending from image palette."
                }
              },

              amountText: {
                elementType: "transaction_amount",
                currentStyles: {
                  fontSize: "14px",
                  fontWeight: "500"
                },
                customizable: true,
                aiInstructions: {
                  fontAgent: "Transaction amounts. Should be clear and precise for financial data."
                }
              }
            }
          }
        }
      }
    },

    aiGlobalInstructions: {
      mood: "Clear and organized. Financial history requires precision.",
      constraints: ["Transaction data must be clearly readable", "Status indicators must be obvious"],
      inheritsFrom: "homeScreen"
    }
  },

  // ЭКРАН 9: ПОИСК
  searchScreen: {
    screenId: "search",
    description: "Поиск токенов и транзакций",
    priority: "LOW",
    
    elements: {
      searchInput: {
        elementType: "main_search_field",
        currentStyles: {
          backgroundColor: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "12px",
          color: "#FFFFFF",
          backdropFilter: "blur(10px)"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "Main search field. Should be prominent and inviting to use."
        }
      },

      recentSearches: {
        elementType: "search_tags",
        elements: {
          searchTag: {
            elementType: "search_tag",
            currentStyles: {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "8px",
              padding: "8px 12px"
            },
            customizable: true
          }
        }
      },

      trendingTokens: {
        elementType: "trending_list",
        elements: {
          trendingToken: {
            elementType: "trending_token_card",
            currentStyles: {
              backgroundColor: "rgba(255, 255, 255, 0.05)",
              borderRadius: "12px",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            },
            customizable: true
          }
        }
      }
    },

    aiGlobalInstructions: {
      mood: "Helpful and discoverable. Search should feel powerful.",
      constraints: ["Search field must be prominent", "Trending items should be clickable"],
      inheritsFrom: "homeScreen"
    }
  },

  // ЭКРАН 10: SIDEBAR АККАУНТОВ
  accountSidebar: {
    screenId: "account-sidebar",
    description: "Боковая панель управления аккаунтами",
    priority: "MEDIUM",
    
    elements: {
      overlay: {
        elementType: "sidebar_overlay",
        currentStyles: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(8px)"
        },
        customizable: true
      },

      sidebarContainer: {
        elementType: "sidebar_panel",
        currentStyles: {
          backgroundColor: "rgba(24, 24, 24, 0.95)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          width: "320px"
        },
        customizable: true,
        aiInstructions: {
          styleAgent: "Sidebar panel. Should feel like extension of main app but distinct."
        }
      },

      accountsList: {
        elementType: "account_list",
        elements: {
          accountItem: {
            elementType: "account_card",
            currentStyles: {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "12px",
              padding: "12px"
            },
            elements: {
              avatarFallback: {
                elementType: "avatar_gradient",
                currentStyles: {
                  background: "linear-gradient(135deg, #9945FF, #14F195)"
                },
                customizable: true,
                aiInstructions: {
                  styleAgent: "Account avatar gradient. Should reflect user personality from image."
                }
              }
            }
          }
        }
      },

      actionButtons: {
        elementType: "sidebar_actions",
        elements: {
          addButton: {
            elementType: "sidebar_action_button",
            currentStyles: {
              padding: "12px",
              borderRadius: "12px",
              color: "#9CA3AF"
            },
            customizable: true
          },
          
          editButton: {
            elementType: "sidebar_action_button", 
            currentStyles: {
              padding: "12px",
              borderRadius: "12px",
              color: "#9CA3AF"
            },
            customizable: true
          },
          
          settingsButton: {
            elementType: "sidebar_action_button",
            currentStyles: {
              padding: "12px", 
              borderRadius: "12px",
              color: "#9CA3AF"
            },
            customizable: true
          }
        }
      }
    },

    aiGlobalInstructions: {
      mood: "Personal and organized. User's account management space.",
      constraints: ["Must feel connected to main app", "Account switching must be clear"],
      inheritsFrom: "homeScreen"
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
        "swapScreen.swapButton",    // Критическая транзакция
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
    },

    characterAgent: {
      role: "Создание AI-компаньона (будущая фаза)",
      status: "PLANNED_FOR_LATER",
      input: "Анализ изображения + пользовательские предпочтения",
      output: "AI Pet персонаж основанный на изображении"
    }
  },

  // СИСТЕМА ПРИМЕНЕНИЯ ИЗМЕНЕНИЙ
  applySystem: {
    cssVariables: {
      // Автогенерация CSS переменных из результатов AI агентов
      generate: function(aiResults) {
        const cssVars = {};
        
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
        
        // Применяем результаты LayoutAgent
        if (aiResults.layoutAgent) {
          cssVars['--border-radius'] = aiResults.layoutAgent.borderRadius;
          cssVars['--blur-effect'] = aiResults.layoutAgent.blurEffect;
          cssVars['--shadow-effect'] = aiResults.layoutAgent.shadowEffect;
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
        ],
        applyStyles: function(styles) {
          return {
            backgroundColor: styles.primaryColor,
            color: styles.textColor,
            borderRadius: styles.borderRadius,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight
          };
        }
      },

      "homeScreen.balanceAmount": {
        selectors: [
          '.balance-amount',
          '[class*="balance"] [class*="amount"]',
          '.text-3xl, .text-2xl'
        ],
        applyStyles: function(styles) {
          return {
            color: styles.primaryTextColor,
            fontSize: styles.largeFontSize,
            fontWeight: styles.boldFontWeight,
            fontFamily: styles.headingsFont
          };
        }
      },

      "homeScreen.actionButtons": {
        selectors: [
          '.action-buttons button',
          '[class*="grid"] button',
          '.grid-cols-4 button'
        ],
        applyStyles: function(styles) {
          return {
            backgroundColor: styles.containerColor,
            borderRadius: styles.borderRadius,
            color: styles.iconColor
          };
        }
      },

      "swapScreen.swapButton": {
        selectors: [
          'button:contains("Swap")',
          '.swap-button',
          'button[class*="primary"]'
        ],
        applyStyles: function(styles) {
          return {
            backgroundColor: styles.primaryColor,
            color: styles.buttonTextColor,
            borderRadius: styles.borderRadius,
            boxShadow: styles.accentShadow
          };
        }
      }
    }
  },

  // N8N WORKFLOW ИНТЕГРАЦИЯ
  n8nIntegration: {
    webhookUrl: N8N_WEBHOOK_URL,
    webhookEndpoint: "/webhook/wallet-customization",
    
    expectedPayload: {
      userId: "string",
      imageUrl: "string", 
      imageBase64: "string (optional)",
      preferences: {
        mood: "string (optional)",
        riskLevel: "string (optional)"
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
      },
      {
        step: 4,
        agent: "ApplySystem",
        input: "finalTheme + fullWalletStructure",
        output: "appliedStyles + successStatus",
        timeout: "10s"
      }
    ],

    responseFormat: {
      success: true,
      themeId: "generated-theme-uuid",
      appliedStyles: {},
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

  // СИСТЕМА ОБУЧЕНИЯ
  learningSystem: {
    feedbackCollection: {
      userRating: "1-5 stars",
      specificFeedback: {
        "liked": ["colors", "fonts", "layout"],
        "disliked": ["colors", "fonts", "layout"],
        "suggestions": "free text"
      },
      usageMetrics: {
        "timeSpentCustomizing": "seconds",
        "elementsModified": "number",
        "finalApplied": "boolean"
      }
    },

    improvementData: {
      successfulPatterns: [
        {
          imageType: "corporate_photo",
          appliedTheme: {colors: [], fonts: []},
          userRating: 5,
          frequency: 15
        }
      ],
      
      failedPatterns: [
        {
          imageType: "abstract_art", 
          appliedTheme: {colors: [], fonts: []},
          userRating: 1,
          commonIssues: ["poor contrast", "wrong mood"]
        }
      ]
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
  },

  // УТИЛИТЫ ДЛЯ РАЗРАБОТКИ
  devTools: {
    // Функция для просмотра всех кастомизируемых элементов
    highlightCustomizableElements: function() {
      Object.keys(this.applySystem.elementMapping).forEach(elementKey => {
        const mapping = this.applySystem.elementMapping[elementKey];
        mapping.selectors.forEach(selector => {
          const elements = document.querySelectorAll(selector);
          elements.forEach(el => {
            el.style.outline = "2px solid #FF0080";
            el.style.outlineOffset = "2px";
            el.title = `Customizable: ${elementKey}`;
          });
        });
      });
    },

    // Функция для тестирования темы
    testTheme: function(theme) {
      const results = {
        contrastIssues: [],
        fontIssues: [],
        performanceWarnings: []
      };

      // Проверка контрастности
      if (theme.colors) {
        // Логика проверки контраста
      }

      // Проверка шрифтов
      if (theme.fonts) {
        // Логика проверки шрифтов
      }

      return results;
    },

    // Экспорт структуры для AI агентов
    exportForAI: function() {
      return {
        structure: this,
        timestamp: new Date().toISOString(),
        version: "2.0.0",
        totalElements: this.calculateTotalElements()
      };
    },

    calculateTotalElements: function() {
      let count = 0;
      const screenIds = [
        'loginScreen', 'homeScreen', 'sendScreen', 'receiveScreen',
        'buyScreen', 'swapScreen', 'appsScreen', 'historyScreen',
        'searchScreen', 'accountSidebar'
      ];
      
      screenIds.forEach(screenId => {
        const screen = fullWalletStructure[screenId];
        if (screen && screen.elements) {
          count += this.countElements(screen.elements);
        }
      });
      
      return count;
    },

    countElements: function(elements) {
      let count = 0;
      Object.values(elements).forEach(element => {
        count++;
        if (element.elements) {
          count += this.countElements(element.elements);
        }
      });
      return count;
    }
  }
};

// Helper function for N8N webhook calls
async function callN8NWebhook(payload) {
  try {
    console.log('🚀 Calling N8N webhook:', N8N_WEBHOOK_URL);
    
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        timestamp: new Date().toISOString(),
        source: 'wallet-customization-structure',
        walletStructure: fullWalletStructure
      }),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ N8N webhook response:', result);
    return result;

  } catch (error) {
    console.error('❌ N8N webhook error:', error);
    throw error;
  }
}

function calculateTotalElements(obj) {
  let count = 0;
  
  const screenIds = [
    'loginScreen', 'homeScreen', 'sendScreen', 'receiveScreen',
    'buyScreen', 'swapScreen', 'appsScreen', 'historyScreen',
    'searchScreen', 'accountSidebar'
  ];
  
  screenIds.forEach(screenId => {
    const screen = obj[screenId];
    if (screen && screen.elements) {
      count += countElementsRecursive(screen.elements);
    }
  });
  
  return count;
}

function countElementsRecursive(elements) {
  let count = 0;
  Object.values(elements).forEach(element => {
    count++;
    if (element.elements) {
      count += countElementsRecursive(element.elements);
    }
  });
  return count;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname;

    console.log(`🚀 Wallet Customization Structure API called: ${path}`);

    // GET - Получить полную структуру
    if (path.endsWith('/wallet-customization-structure') || path.endsWith('/wallet-structure')) {
      if (req.method === 'GET') {
        const totalElements = calculateTotalElements(fullWalletStructure);
        
        const response = {
          success: true,
          structure: fullWalletStructure,
          metadata: {
            totalElements,
            version: "2.0.0",
            timestamp: new Date().toISOString(),
            endpoint: path,
            n8nWebhookUrl: N8N_WEBHOOK_URL
          }
        };

        console.log(`📊 Returning structure with ${totalElements} total elements`);
        
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // POST - Применить тему
      if (req.method === 'POST') {
        const { theme, userId } = await req.json();
        
        console.log(`🎨 Theme application requested for user: ${userId}`);
        
        const response = {
          success: true,
          message: "Theme application endpoint ready for AI agents integration",
          theme,
          userId,
          status: "prepared_for_ai_agents",
          n8nWebhookUrl: N8N_WEBHOOK_URL
        };

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // NEW: POST - Trigger AI Customization via N8N
    if (path.endsWith('/trigger-ai-customization') && req.method === 'POST') {
      const payload = await req.json();
      
      console.log(`🎯 AI Customization trigger requested:`, payload);
      
      try {
        // Call N8N webhook with the payload
        const n8nResult = await callN8NWebhook(payload);
        
        const response = {
          success: true,
          message: "AI Customization triggered successfully",
          n8nResponse: n8nResult,
          payload,
          timestamp: new Date().toISOString(),
          webhookUrl: N8N_WEBHOOK_URL
        };

        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      } catch (error) {
        console.error('❌ Failed to trigger N8N workflow:', error);
        
        return new Response(JSON.stringify({
          success: false,
          error: error.message,
          message: "Failed to trigger AI Customization workflow",
          webhookUrl: N8N_WEBHOOK_URL
        }), {
          status: 500,
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
        timestamp: new Date().toISOString(),
        n8nWebhookUrl: N8N_WEBHOOK_URL
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
        "POST /trigger-ai-customization - Trigger N8N AI workflow",
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
      service: "wallet-customization-structure",
      n8nWebhookUrl: N8N_WEBHOOK_URL
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
