export type BgTarget = {
  id: 'lock' | 'home' | 'receiveCenter' | 'sendCenter' | 'buyCenter' | 'ALL';
  label: string;
  imgPtr?: string; // json pointer
  colorPtr?: string; // json pointer
};

export const BG_TARGETS: BgTarget[] = [
  { 
    id: 'lock', 
    label: 'Lock', 
    imgPtr: '/lockLayer/backgroundImage', 
    colorPtr: '/lockLayer/backgroundColor' 
  },
  { 
    id: 'home', 
    label: 'Home', 
    imgPtr: '/homeLayer/backgroundImage', 
    colorPtr: '/homeLayer/backgroundColor' 
  },
  { 
    id: 'receiveCenter', 
    label: 'Receive', 
    imgPtr: '/receiveLayer/centerContainer/backgroundImage', 
    colorPtr: '/receiveLayer/centerContainer/backgroundColor' 
  },
  { 
    id: 'sendCenter', 
    label: 'Send', 
    imgPtr: '/sendLayer/centerContainer/backgroundImage', 
    colorPtr: '/sendLayer/centerContainer/backgroundColor' 
  },
  { 
    id: 'buyCenter', 
    label: 'Buy', 
    imgPtr: '/buyLayer/centerContainer/backgroundImage', 
    colorPtr: '/buyLayer/centerContainer/backgroundColor' 
  },
  { 
    id: 'ALL', 
    label: 'All', 
    /* fan-out: use the four above */ 
  },
];