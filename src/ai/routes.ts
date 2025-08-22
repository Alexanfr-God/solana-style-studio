
// Маршрутизация AI-команд к JSON структуре темы
// Основано на реальной структуре defaultTheme.json

export type UILayer =
  | 'lockLayer'|'homeLayer'|'sidebarLayer'|'receiveLayer'|'sendLayer'
  | 'appsLayer'|'buyLayer'|'swapLayer'|'historyLayer'|'searchLayer'
  | 'globalSearchInput'|'avatarHeader'|'dropdownMenu'|'wallet'|'global';

type Slot = 'backgroundColor'|'backgroundImage'|'primaryButtonBg'|'primaryButtonText'|'textColor';

type RouteTable = Record<UILayer, Partial<Record<Slot, string[]>>>;

// В приоритете — первый подходящий путь
export const ROUTES: RouteTable = {
  lockLayer: {
    backgroundColor: ['lockLayer.backgroundColor'],
    backgroundImage: ['lockLayer.backgroundImage'],
    primaryButtonBg:  ['lockLayer.unlockButton.backgroundColor'],
    primaryButtonText:['lockLayer.unlockButton.textColor'],
    textColor:        ['lockLayer.title.textColor']
  },
  homeLayer: {
    backgroundColor: ['homeLayer.backgroundColor'],
    backgroundImage: ['homeLayer.backgroundImage'],
    primaryButtonBg: [
      'homeLayer.actionButtons.swapButton.containerColor',
      'homeLayer.actionButtons.sendButton.containerColor',
      'homeLayer.actionButtons.receiveButton.containerColor',
      'homeLayer.actionButtons.buyButton.containerColor'
    ],
    primaryButtonText:['homeLayer.actionButtons.swapButton.labelColor'],
    textColor: [
      'homeLayer.totalBalanceValue.textColor',
      'homeLayer.header.textColor'
    ]
  },
  sidebarLayer: {
    backgroundColor: ['sidebarLayer.center.backgroundColor'],
    textColor: [
      'sidebarLayer.header.accountTitle.textColor',
      'sidebarLayer.center.accountList.accountName.textColor'
    ]
  },
  receiveLayer: {
    backgroundColor: ['receiveLayer.centerContainer.backgroundColor'],
    primaryButtonBg: ['receiveLayer.footer.closeButton.backgroundColor'],
    primaryButtonText:['receiveLayer.footer.closeButton.textColor']
  },
  sendLayer: {
    backgroundColor: ['sendLayer.centerContainer.backgroundColor'],
    primaryButtonBg: ['sendLayer.footer.closeButton.backgroundColor'],
    primaryButtonText:['sendLayer.footer.closeButton.textColor'],
    textColor: ['sendLayer.header.title.textColor']
  },
  appsLayer: {
    backgroundColor: ['appsLayer.collectibleCard.backgroundColor'],
    textColor: ['appsLayer.title.textColor']
  },
  buyLayer: {
    backgroundColor: ['buyLayer.centerContainer.backgroundColor'],
    primaryButtonBg: ['buyLayer.buyButton.backgroundColor','buyLayer.footer.closeButton.backgroundColor'],
    primaryButtonText:['buyLayer.buyButton.textColor']
  },
  swapLayer: {
    backgroundColor: ['swapLayer.mainContainer.backgroundColor'],
    primaryButtonBg: ['swapLayer.swapActionButton.backgroundColor'],
    primaryButtonText:['swapLayer.swapActionButton.color'],
    textColor: ['swapLayer.swapTitle.textColor']
  },
  historyLayer: {
    textColor: ['historyLayer.recentActivityTitle.textColor']
  },
  searchLayer: {
    backgroundColor: ['searchLayer.searchInput.backgroundColor'],
    textColor: ['searchLayer.searchInput.textColor','searchLayer.searchInputFont.textColor']
  },
  globalSearchInput: {
    backgroundColor: ['globalSearchInput.backgroundColor'],
    textColor: ['globalSearchInput.textColor']
  },
  avatarHeader: {
    backgroundColor: ['avatarHeader.backgroundColor'],
    textColor: ['avatarHeader.textColor']
  },
  dropdownMenu: {
    backgroundColor: ['homeLayer.accountDropdown.containerBackgroundColor'],
    textColor: [
      'homeLayer.accountDropdown.headerText.selectAccountColor',
      'homeLayer.accountDropdown.accountItems.mainAccountColor'
    ]
  },
  wallet: {
    backgroundColor: ['homeLayer.backgroundColor', 'lockLayer.backgroundColor'],
    primaryButtonBg: ['swapLayer.swapActionButton.backgroundColor','homeLayer.actionButtons.swapButton.containerColor'],
    textColor: ['homeLayer.totalBalanceValue.textColor']
  },
  global: {}
} as const;

// Алиасы для распознавания слоёв в командах
export const LAYER_ALIASES: Record<string, UILayer> = {
  lock:'lockLayer', unlock:'lockLayer',
  home:'homeLayer', main:'homeLayer',
  sidebar:'sidebarLayer', sidemenu:'sidebarLayer',
  receive:'receiveLayer', recieve:'receiveLayer', получить:'receiveLayer',
  send:'sendLayer', отправка:'sendLayer',
  apps:'appsLayer', dapps:'appsLayer',
  buy:'buyLayer',
  swap:'swapLayer',
  history:'historyLayer',
  search:'searchLayer',
  wallet:'wallet',
  'global search':'globalSearchInput',
  'avatar header':'avatarHeader',
  dropdown:'dropdownMenu', menu:'dropdownMenu',
  global:'global'
};
