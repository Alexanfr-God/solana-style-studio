# JSON Path Validation Report
**Generated:** 2025-10-12  
**Context:** Phase 1-4 Refactoring (Manual = Git Full Apply)

## Summary
- **Total Elements Analyzed:** ~80+ in wallet_elements table
- **Critical Issue:** Many json_path values point to **objects** instead of **scalar values**
- **Required Action:** Update all paths to point to scalar properties

---

## 🔴 CRITICAL PROBLEMS

### **Problem Type 1: Object Paths (NOT_SCALAR)**

These paths point to objects instead of scalar values (strings, numbers, booleans):

#### **Apps Layer**
| ID | Current Path | Issue | Suggested Fix |
|----|--------------|-------|---------------|
| `apps-content` | `/appsLayer/collectibleCard` | Object with `backgroundColor`, `backgroundImage`, `borderRadius` | `/appsLayer/collectibleCard/backgroundColor` |
| `apps-grid` | `/appsLayer/collectibleCard` | Same as above | `/appsLayer/collectibleCard/backgroundColor` |
| `apps-item` | `/appsLayer/collectibleCard` | Same as above | `/appsLayer/collectibleCard/backgroundColor` |
| `apps-name` | `/appsLayer/collectibleName` | Object with `textColor`, `fontFamily`, `fontSize` | `/appsLayer/collectibleName/textColor` |
| `apps-icon` | `/appsLayer/icons/icon` | PATH_NOT_FOUND (icons not in theme) | Remove or create custom mapping |

#### **Buy Layer**
| ID | Current Path | Issue | Suggested Fix |
|----|--------------|-------|---------------|
| `buy-back-button` | `/buyLayer/header/backButton` | Object with `backgroundColor`, `borderRadius`, `text`, `icon` | `/buyLayer/header/backButton/backgroundColor` |
| `buy-bitcoin-description` | `/assetCard/description` | Object with `textColor`, `fontFamily`, `fontSize` | `/assetCard/description/textColor` |
| `buy-bitcoin-name` | `/assetCard/title` | Object with `textColor`, `fontFamily`, `fontWeight`, `fontSize` | `/assetCard/title/textColor` |
| `buy-ethereum-description` | `/assetCard/description` | Same as above | `/assetCard/description/textColor` |
| `buy-ethereum-name` | `/assetCard/title` | Same as above | `/assetCard/title/textColor` |
| `buy-get-started-title` | `/buyLayer/sectionLabel/getStarted` | Object with `textColor`, `fontFamily`, `fontWeight`, `fontSize` | `/buyLayer/sectionLabel/getStarted/textColor` |
| `buy-content` | `/buyLayer/centerContainer` | Object with `backgroundColor`, `backgroundImage`, etc. | `/buyLayer/centerContainer/backgroundColor` |
| `buy-bitcoin-button` | `/buyLayer/buyButton` | Object with `backgroundColor`, `textColor`, etc. | `/buyLayer/buyButton/backgroundColor` |
| `buy-ethereum-button` | `/buyLayer/buyButton` | Same as above | `/buyLayer/buyButton/backgroundColor` |
| `buy-solana-button` | `/buyLayer/buyButton` | Same as above | `/buyLayer/buyButton/backgroundColor` |
| `buy-usdc-button` | `/buyLayer/buyButton` | Same as above | `/buyLayer/buyButton/backgroundColor` |
| `buy-title` | `/buyLayer/header/title` | Object with `textColor`, `fontFamily`, `fontWeight`, `fontSize` | `/buyLayer/header/title/textColor` |

#### **Navigation Tabs**
| ID | Current Path | Issue | Suggested Fix |
|----|--------------|-------|---------------|
| `nav-apps-tab` | `/homeLayer/footer/navigationIcons/appsIcon` | Object with `color`, `activeColor`, `type` | `/homeLayer/footer/navigationIcons/appsIcon/color` |
| `nav-history-tab` | `/homeLayer/footer/navigationIcons/historyIcon` | Same as above | `/homeLayer/footer/navigationIcons/historyIcon/color` |
| `nav-home-tab` | `/homeLayer/footer/navigationIcons/homeIcon` | Same as above | `/homeLayer/footer/navigationIcons/homeIcon/color` |
| `nav-swap-tab` | `/homeLayer/footer/navigationIcons/swapIcon` | Same as above | `/homeLayer/footer/navigationIcons/swapIcon/color` |

#### **History Layer**
| ID | Current Path | Issue | Suggested Fix |
|----|--------------|-------|---------------|
| `history-transaction-amount` | `/historyLayer/dateLabel` | ❌ PATH_NOT_FOUND | Should be `/historyLayer/activityDate/textColor` or similar |
| `history-transaction-date` | `/historyLayer/dateLabel` | ❌ PATH_NOT_FOUND | `/historyLayer/activityDate/textColor` |
| `history-transaction-status` | `/historyLayer/statusColors` | ❌ PATH_NOT_FOUND | Should be `/historyLayer/activityStatus/successColor` |

#### **Home Layer**
| ID | Current Path | Issue | Suggested Fix |
|----|--------------|-------|---------------|
| `home-asset-name` | Need to check if exists | May be object | `/assetCard/title/textColor` |
| `home-asset-symbol` | Need to check | May be object | `/assetCard/description/textColor` |
| `home-asset-value` | Need to check | May be object | `/assetCard/value/textColor` |
| `home-balance-change` | Need to check | May be object | `/homeLayer/totalBalanceChange/positiveColor` |
| `home-balance-label` | Need to check | May be object | `/homeLayer/totalBalanceLabel/textColor` |
| `home-balance-value` | Need to check | May be object | `/homeLayer/totalBalanceValue/textColor` |
| `home-footer` | Need to check | May be object | `/homeLayer/footer/backgroundColor` |
| `home-header` | Need to check | May be object | `/homeLayer/header/backgroundColor` |

#### **Lock Layer**
| ID | Current Path | Issue | Suggested Fix |
|----|--------------|-------|---------------|
| `lock-background` | Check if exists | May need `/lockLayer/backgroundColor` | `/lockLayer/backgroundColor` |
| `lock-forgot-password` | Check | May be object | `/lockLayer/forgotPassword/textColor` |
| `lock-password-input` | Check | May be object | `/lockLayer/passwordInput/backgroundColor` |
| `lock-title` | Check | May be object | `/lockLayer/title/textColor` |
| `lock-unlock-button` | Check | May be object | `/lockLayer/unlockButton/backgroundColor` |

#### **Receive Layer**
| ID | Current Path | Issue | Suggested Fix |
|----|--------------|-------|---------------|
| `receive-back-button` | Check | May be object | `/receiveLayer/footer/closeButton/backgroundColor` |
| `receive-qr-code` | Check | Custom implementation | Custom mapping needed |

#### **Search Layer**
| ID | Current Path | Issue | Suggested Fix |
|----|--------------|-------|---------------|
| `search-input` | `/searchLayer/searchInput` | Object with multiple properties | `/searchLayer/searchInput/backgroundColor` |
| `search-recent-label` | Check | May be object | `/searchLayer/recentSearchesLabel/textColor` |
| `search-trending-label` | Check | May be object | `/searchLayer/trendingLabel/textColor` |

#### **Send Layer**
| ID | Current Path | Issue | Suggested Fix |
|----|--------------|-------|---------------|
| `send-back-button` | Check | May be object | `/sendLayer/header/backIcon/color` |
| `send-close-button` | Check | May be object | `/sendLayer/footer/closeButton/backgroundColor` |
| `send-qr-icon` | Check | May be object | `/sendLayer/header/qrIcon/color` |
| `send-title` | Check | May be object | `/sendLayer/header/title/textColor` |

#### **Sidebar Layer**
| ID | Current Path | Issue | Suggested Fix |
|----|--------------|-------|---------------|
| `sidebar-account-address` | Check | May be object | `/sidebarLayer/center/accountList/accountAddress/textColor` |
| `sidebar-account-name` | Check | May be object | `/sidebarLayer/center/accountList/accountName/textColor` |
| `sidebar-add-account` | Check | May be object | Custom mapping |
| `sidebar-avatar` | Check | May be object | `/sidebarLayer/center/accountList/avatar/backgroundColor` |
| `sidebar-close-icon` | Check | May be object | `/sidebarLayer/header/closeIcon/color` |
| `sidebar-edit-icon` | Check | May be object | `/sidebarLayer/footer/footerIcons/editIcon/color` |
| `sidebar-footer` | Check | May be object | `/sidebarLayer/footer/backgroundColor` |
| `sidebar-header` | Check | May be object | `/sidebarLayer/header/backgroundColor` |
| `sidebar-settings-icon` | Check | May be object | `/sidebarLayer/footer/footerIcons/settingsIcon/color` |
| `sidebar-title` | Check | May be object | `/sidebarLayer/header/accountTitle/textColor` |

#### **Swap Layer**
| ID | Current Path | Issue | Suggested Fix |
|----|--------------|-------|---------------|
| `swap-arrow-icon` | Check | May be object | `/swapLayer/arrowIcon/color` |
| `swap-button` | Check | May be object | `/swapLayer/swapActionButton/backgroundColor` |
| `swap-container` | Check | May be object | `/swapLayer/mainContainer/backgroundColor` |
| `swap-from-balance` | Check | May be object | `/swapLayer/fromBalance/textColor` |
| `swap-from-coin` | Check | May be object | `/swapLayer/fromCoinTag/backgroundColor` |
| `swap-from-container` | Check | May be object | `/swapLayer/fromContainer/backgroundColor` |
| `swap-from-label` | Check | May be object | `/swapLayer/fromLabel/textColor` |
| `swap-settings-icon` | Check | May be object | `/swapLayer/settingsIcon/color` |
| `swap-title` | Check | May be object | `/swapLayer/swapTitle/textColor` |
| `swap-to-balance` | Check | May be object | `/swapLayer/toBalance/textColor` |
| `swap-to-coin` | Check | May be object | `/swapLayer/toCoinTag/backgroundColor` |
| `swap-to-container` | Check | May be object | `/swapLayer/toContainer/backgroundColor` |
| `swap-to-label` | Check | May be object | `/swapLayer/toLabel/textColor` |

---

### **Problem Type 2: Non-Existent Paths (PATH_NOT_FOUND)**

These paths don't exist in defaultTheme.json at all:

- `/buy/container` → Should be `/buyLayer/centerContainer/backgroundColor`
- `/buy/popular/container` → Not in theme
- `/buy/popular/title` → Not in theme  
- `/buy/search/icon` → Should be `/buyLayer/...` or `/searchLayer/...`
- `/historyLayer/dateLabel` → Should be `/historyLayer/activityDate/textColor`
- `/historyLayer/statusColors` → Should be `/historyLayer/activityStatus/successColor`
- Various `/appsLayer/icons/*` → Icons are not in theme structure

---

## ✅ VALID PATHS (Already Fixed in Migration)

These paths are correct (pointing to scalars):

| ID | Path | Type |
|----|------|------|
| `home-asset-item` | `/assetCard/backgroundColor` | ✅ Scalar |
| `home-send-button` | `/homeLayer/actionButtons/sendButton/containerColor` | ✅ Scalar |
| `home-send-icon` | `/homeLayer/actionButtons/sendButton/iconColor` | ✅ Scalar |
| `home-send-label` | `/homeLayer/actionButtons/sendButton/labelColor` | ✅ Scalar |
| `home-receive-button` | `/homeLayer/actionButtons/receiveButton/containerColor` | ✅ Scalar |
| `home-receive-icon` | `/homeLayer/actionButtons/receiveButton/iconColor` | ✅ Scalar |
| `home-receive-label` | `/homeLayer/actionButtons/receiveButton/labelColor` | ✅ Scalar |
| `home-buy-button` | `/homeLayer/actionButtons/buyButton/containerColor` | ✅ Scalar |
| `home-buy-icon` | `/homeLayer/actionButtons/buyButton/iconColor` | ✅ Scalar |
| `home-buy-label` | `/homeLayer/actionButtons/buyButton/labelColor` | ✅ Scalar |
| `home-swap-button` | `/homeLayer/actionButtons/swapButton/containerColor` | ✅ Scalar |
| `home-swap-icon` | `/homeLayer/actionButtons/swapButton/iconColor` | ✅ Scalar |
| `home-swap-label` | `/homeLayer/actionButtons/swapButton/labelColor` | ✅ Scalar |
| `buy-header` | `/buyLayer/headerContainer/backgroundColor` | ✅ Scalar |

---

## 📝 Recommendations

1. **Immediate Action:** Run the SQL migration to fix all NOT_SCALAR paths
2. **Validation:** After migration, re-run validator to confirm 100% scalar paths
3. **Selectors:** Verify critical elements use `[data-element-id="..."]` attributes
4. **Theme Sync:** Ensure all fixed paths exist in defaultTheme.json
5. **Testing:** Run 5 acceptance tests (Lock title, Asset card, Send button parts)

---

## 🛠️ Next Steps

1. ✅ Apply comprehensive SQL migration (see `20251012_fix_all_json_paths.sql`)
2. ✅ Re-run validator: `bun run scripts/validate-json-paths.ts`
3. ✅ Test Manual Editor on 5 critical cases
4. ✅ Cleanup: Remove PathAnalyzer, update docs
5. ✅ Create `docs/THEME_APPLY_PIPELINE.md`

---

**Status:** 🟡 Awaiting SQL Migration Approval
