import React from 'react';
import { useThemeStore } from '@/state/themeStore';
import { WalletStyle } from '@/stores/customizationStore';

// Bounding boxes relative to 384×650 container (wacocu wallet card)
export const PHANTOM_ELEMENT_MAP = {
  header:            { x: 0,   y: 0,   width: 384, height: 60  },
  'network-badge':   { x: 140, y: 16,  width: 104, height: 28  },
  'account-address': { x: 16,  y: 68,  width: 352, height: 40  },
  'balance-sol':     { x: 0,   y: 118, width: 384, height: 48  },
  'balance-usd':     { x: 0,   y: 162, width: 384, height: 32  },
  'btn-send':        { x: 16,  y: 210, width: 78,  height: 64  },
  'btn-receive':     { x: 110, y: 210, width: 78,  height: 64  },
  'btn-swap':        { x: 204, y: 210, width: 78,  height: 64  },
  'btn-buy':         { x: 298, y: 210, width: 78,  height: 64  },
  'token-list-item': [
    { x: 16, y: 330, width: 352, height: 52 },
    { x: 16, y: 386, width: 352, height: 52 },
    { x: 16, y: 442, width: 352, height: 52 },
    { x: 16, y: 498, width: 352, height: 52 },
  ],
} as const;

interface PhantomTheme {
  backgroundColor?: string;
  headerBackground?: string;
  textColor?: string;
  mutedColor?: string;
  accentColor?: string;
  buttonBackground?: string;
  buttonBorder?: string;
  badgeBackground?: string;
  badgeBorder?: string;
  rowBackground?: string;
}

interface Props {
  walletStyle?: Partial<WalletStyle>;
  theme?: PhantomTheme;
}

function resolveTheme(
  storePhantom: any,
  walletStyle?: Partial<WalletStyle>,
  theme?: PhantomTheme,
): Required<PhantomTheme> {
  const p = storePhantom ?? {};
  return {
    backgroundColor:  theme?.backgroundColor  ?? p.root?.backgroundColor        ?? walletStyle?.backgroundColor ?? '#131217',
    headerBackground: theme?.headerBackground  ?? p.header?.backgroundColor      ?? '#1e1c23',
    textColor:        theme?.textColor         ?? p.balance?.color               ?? walletStyle?.textColor        ?? '#ffffff',
    mutedColor:       theme?.mutedColor        ?? p.tokenList?.mutedColor        ?? '#888888',
    accentColor:      theme?.accentColor       ?? p.networkBadge?.color          ?? walletStyle?.accentColor      ?? '#ab9ff2',
    buttonBackground: theme?.buttonBackground  ?? p.buttons?.backgroundColor     ?? walletStyle?.buttonColor      ?? '#2a2832',
    buttonBorder:     theme?.buttonBorder      ?? p.buttons?.border              ?? '#3d3850',
    badgeBackground:  theme?.badgeBackground   ?? p.networkBadge?.backgroundColor ?? '#2a2832',
    badgeBorder:      theme?.badgeBorder       ?? p.networkBadge?.border         ?? '#3d3850',
    rowBackground:    theme?.rowBackground     ?? p.tokenList?.rowBackground     ?? 'transparent',
  };
}

export const PhantomMockUI: React.FC<Props> = ({ walletStyle, theme }) => {
  const storePhantom = useThemeStore((s) => s.getDisplayTheme()?.phantom);
  const t = resolveTheme(storePhantom, walletStyle, theme);

  return (
    <div
      data-phantom-id="root"
      className="w-full h-full flex flex-col overflow-hidden select-none"
      style={{ backgroundColor: t.backgroundColor, color: t.textColor, fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Header ── */}
      <div
        data-phantom-id="header"
        className="flex items-center justify-between px-4 shrink-0"
        style={{ height: 60, backgroundColor: t.headerBackground, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <GhostSvg color={t.accentColor} />
          <span className="font-bold text-base tracking-tight" style={{ color: t.textColor }}>Phantom</span>
        </div>

        <div
          data-phantom-id="network-badge"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer"
          style={{ backgroundColor: t.badgeBackground, border: `1px solid ${t.badgeBorder}`, color: t.accentColor }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
          Mainnet
          <ChevronDownSvg />
        </div>

        <button className="p-1 opacity-50 hover:opacity-80">
          <DotsSvg />
        </button>
      </div>

      {/* ── Account row ── */}
      <div
        data-phantom-id="account-address"
        className="flex items-center justify-center gap-2 shrink-0"
        style={{ height: 48, backgroundColor: t.headerBackground, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="w-5 h-5 rounded-full shrink-0"
          style={{ background: 'linear-gradient(135deg, #ab9ff2 0%, #7c6fff 100%)' }} />
        <span className="text-sm font-semibold" style={{ color: t.textColor }}>Account 1</span>
        <span className="text-xs font-mono" style={{ color: t.mutedColor }}>8xKf…3mPq</span>
        <button className="opacity-40 hover:opacity-70"><CopySvg /></button>
      </div>

      {/* ── Balance ── */}
      <div className="flex flex-col items-center pt-5 pb-3 shrink-0">
        <div
          data-phantom-id="balance-sol"
          className="font-bold tracking-tight leading-none"
          style={{ fontSize: 34, color: t.textColor }}
        >
          12.48 SOL
        </div>
        <div
          data-phantom-id="balance-usd"
          className="flex items-center gap-2 mt-1 text-sm"
          style={{ color: t.mutedColor }}
        >
          $1,842.56
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded" style={{ color: '#4ade80', backgroundColor: 'rgba(74,222,128,0.12)' }}>
            +2.3%
          </span>
        </div>
      </div>

      {/* ── Action buttons ── */}
      <div className="flex justify-between px-4 mb-3 shrink-0">
        {ACTION_BUTTONS.map(({ id, icon, label }) => (
          <button
            key={id}
            data-phantom-id={id}
            className="flex flex-col items-center gap-1.5 rounded-xl py-3 cursor-pointer transition-opacity hover:opacity-80"
            style={{
              width: 78,
              backgroundColor: t.buttonBackground,
              border: `1px solid ${t.buttonBorder}`,
              color: t.accentColor,
            }}
          >
            <span className="w-6 h-6 flex items-center justify-center">{icon}</span>
            <span className="text-xs font-medium" style={{ color: t.textColor }}>{label}</span>
          </button>
        ))}
      </div>

      {/* ── Tabs ── */}
      <div className="flex px-4 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {['Tokens', 'NFTs', 'Activity'].map((tab, i) => (
          <div
            key={tab}
            className="py-2 px-3 text-xs font-semibold cursor-pointer"
            style={{
              color: i === 0 ? t.accentColor : t.mutedColor,
              borderBottom: i === 0 ? `2px solid ${t.accentColor}` : '2px solid transparent',
            }}
          >
            {tab}
          </div>
        ))}
      </div>

      {/* ── Token list ── */}
      <div className="flex-1 overflow-y-auto py-1">
        {TOKENS.map((token, idx) => (
          <div
            key={token.symbol}
            data-phantom-id="token-list-item"
            data-token-index={idx}
            className="flex items-center px-4 py-2.5 gap-3 cursor-pointer hover:opacity-80"
            style={{ backgroundColor: t.rowBackground }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm shrink-0"
              style={{ background: token.gradient }}
            >
              {token.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate" style={{ color: t.textColor }}>{token.name}</div>
              <div className="text-xs truncate" style={{ color: t.mutedColor }}>{token.amount} {token.symbol}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-medium" style={{ color: t.textColor }}>{token.usd}</div>
              <div className="text-xs" style={{ color: token.up ? '#4ade80' : '#f87171' }}>{token.change}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Static data ─────────────────────────────────────────────────────────────

const TOKENS = [
  { symbol: 'SOL',  name: 'Solana',  icon: '◎', gradient: 'linear-gradient(135deg,#9945FF,#14F195)', amount: '12.48',  usd: '$1,842.56', change: '+2.3%', up: true  },
  { symbol: 'USDC', name: 'USD Coin', icon: '$', gradient: 'linear-gradient(135deg,#2775CA,#5BC3FF)', amount: '100.00', usd: '$100.00',   change: '0.0%',  up: true  },
  { symbol: 'BONK', name: 'Bonk',    icon: '🐕', gradient: 'linear-gradient(135deg,#f7931a,#ffcc00)', amount: '2.5M',   usd: '$18.40',    change: '-4.1%', up: false },
  { symbol: 'JUP',  name: 'Jupiter', icon: '♃', gradient: 'linear-gradient(135deg,#00c2ff,#8851ff)', amount: '45.00',  usd: '$32.10',    change: '+1.8%', up: true  },
];

const ACTION_BUTTONS = [
  { id: 'btn-send',    label: 'Send',    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 14V6M10 6L6 10M10 6L14 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'btn-receive', label: 'Receive', icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 6v8M10 14L6 10M10 14l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'btn-swap',    label: 'Swap',    icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 8l3-3 3 3M8 5v8M15 12l-3 3-3-3M12 15V7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { id: 'btn-buy',     label: 'Buy',     icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 6h1l2 7h8l2-6H7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><circle cx="8" cy="15.5" r="1" fill="currentColor"/><circle cx="14" cy="15.5" r="1" fill="currentColor"/></svg> },
];

// ── SVG icons ────────────────────────────────────────────────────────────────

function GhostSvg({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path d="M14 3C9.03 3 5 7.03 5 12v10l3-2.5 3 2.5 3-2.5 3 2.5 3-2.5V12C21 7.03 17 3 14 3z" fill={color} />
      <circle cx="10.5" cy="12" r="1.5" fill="white" />
      <circle cx="17.5" cy="12" r="1.5" fill="white" />
    </svg>
  );
}

function ChevronDownSvg() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
      <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DotsSvg() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <circle cx="4" cy="9" r="1.5" fill="#888" />
      <circle cx="9" cy="9" r="1.5" fill="#888" />
      <circle cx="14" cy="9" r="1.5" fill="#888" />
    </svg>
  );
}

function CopySvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="4" width="9" height="9" rx="1.5" stroke="#666" strokeWidth="1.2" />
      <path d="M4 4V3C4 1.9 4.9 1 6 1h5c1.1 0 2 .9 2 2v5c0 1.1-.9 2-2 2h-1" stroke="#666" strokeWidth="1.2" />
    </svg>
  );
}
