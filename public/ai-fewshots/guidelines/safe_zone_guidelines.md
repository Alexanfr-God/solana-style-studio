# Safe Zone Guidelines for Wallet Interface Design

## Overview
Safe zones are critical areas in wallet interfaces that must remain clear of decorative elements to ensure functionality, accessibility, and user experience. These zones are defined based on wallet type, screen type, and interaction requirements.

## Universal Safe Zone Rules

### Critical UI Areas (Always Protected)
- **Navigation bars**: Top 60px and bottom 80px of screen
- **Balance displays**: Central focus areas showing wallet balance
- **Action buttons**: Send, Receive, Buy, Swap button areas
- **Input fields**: Any area where users enter text or select options
- **Modal overlays**: Areas where popups or dialogs appear
- **Loading indicators**: Spaces reserved for loading states

### Minimum Clearance Requirements
- **Text elements**: 8px minimum clearance on all sides
- **Buttons**: 12px minimum clearance on all sides  
- **Input fields**: 16px minimum clearance on all sides
- **Icons**: 4px minimum clearance on all sides
- **Critical alerts**: 20px minimum clearance on all sides

## Screen-Specific Safe Zones

### Login/Onboarding Screens
```
Top Safe Zone: 0-80px (navigation/header)
Center Safe Zone: 35-65% height (login form area)
Bottom Safe Zone: 80-100% height (buttons/footer)
Side margins: 20px minimum on mobile, 40px on desktop
```

### Home/Dashboard Screens
```
Top Safe Zone: 0-100px (balance display area)
Navigation Safe Zone: Bottom 80px (tab navigation)
Action Button Zone: 60-70% height (main action buttons)
Side panels: 0-60px left, 0-60px right (account info)
```

### Transaction Screens (Send/Receive)
```
Form Area: 20-80% height (transaction inputs)
Confirmation Area: 70-90% height (review/confirm)
Keyboard Zone: Bottom 40% on mobile (virtual keyboard)
Error Message Zone: Top 10% (validation feedback)
```

### Settings/Profile Screens
```
Header Zone: 0-120px (profile info/avatar)
Menu Items: 120px-80% height (settings list)
Footer Actions: 80-100% height (save/cancel buttons)
```

## Wallet-Specific Considerations

### Phantom Wallet
- **Balance Display**: Keep 200x60px area clear in upper center
- **Action Buttons**: Protect 280x120px area for Send/Receive buttons
- **Portfolio Section**: Reserve middle 40% for asset list
- **Tab Navigation**: Bottom 60px must remain clear

### MetaMask
- **Account Selector**: Top center 300x40px area
- **Main Balance**: 250x80px center area for ETH balance
- **Action Grid**: 300x180px area for main action buttons
- **Activity Feed**: Reserve space for transaction history

### Solflare
- **Solana Balance**: Central 280x70px for SOL balance display
- **Staking Info**: Upper right area for staking status
- **Token List**: Middle section for token portfolio
- **DeFi Actions**: Bottom action area for DeFi integrations

## Responsive Safe Zone Adjustments

### Mobile Devices (< 768px)
- Increase all safe zone padding by 50%
- Account for virtual keyboard overlap (bottom 40% when active)
- Ensure touch targets are minimum 44x44px
- Consider thumb reach zones for critical actions

### Tablet Devices (768px - 1024px)
- Expand side margins to 60px minimum
- Adjust safe zones for landscape orientation
- Account for split-screen usage
- Maintain consistent relative proportions

### Desktop (> 1024px)
- Use maximum widths to prevent over-stretching
- Center content with expanded safe margins
- Account for multiple window usage
- Optimize for mouse interaction patterns

## Background Treatment in Safe Zones

### Allowed in Safe Zones
- **Solid colors** with appropriate contrast
- **Simple gradients** that don't interfere with text
- **Subtle textures** with opacity < 0.1
- **Uniform patterns** that maintain readability

### Prohibited in Safe Zones
- **High contrast patterns** that reduce readability
- **Animated elements** that distract from functionality
- **Complex graphics** that compete with UI elements
- **Bright colors** that cause eye strain or accessibility issues

## Accessibility Considerations

### Color Contrast in Safe Zones
- Minimum 4.5:1 contrast ratio for normal text
- Minimum 3:1 contrast ratio for large text (18pt+)
- Minimum 3:1 contrast ratio for UI elements and graphics
- Test with color blindness simulators

### Focus and Interaction States
- Ensure focus indicators are clearly visible
- Maintain consistent focus styling across all elements
- Provide clear hover states for interactive elements
- Support keyboard navigation throughout interface

## Validation and Testing

### Automated Checks
- Use contrast ratio tools to validate text readability
- Test with screen readers to ensure proper navigation
- Validate touch target sizes on mobile devices
- Check responsive behavior across breakpoints

### Manual Testing
- Test with actual wallet operations and real data
- Verify safe zones with different content lengths
- Check behavior with network loading states
- Validate across different user scenarios

## Safe Zone Documentation Format

For each wallet component, document safe zones as:
```json
{
  "componentName": "WalletBalance",
  "safeZones": {
    "desktop": {
      "x": 100,
      "y": 80,
      "width": 300,
      "height": 120,
      "padding": 20
    },
    "mobile": {
      "x": 20,
      "y": 60,
      "width": "calc(100% - 40px)",
      "height": 100,
      "padding": 16
    }
  },
  "criticalElements": ["balance-text", "currency-symbol", "action-buttons"],
  "backgroundRestrictions": ["no-animation", "low-contrast-only"]
}
```

## Implementation in AI Prompts

When generating designs, always include:
1. Specific safe zone coordinates
2. Elements that must remain visible
3. Contrast requirements for the area
4. Background treatment limitations
5. Responsive behavior expectations

Example prompt addition:
"Ensure the generated background respects safe zones: keep the area from 100px to 400px horizontally and 80px to 200px vertically completely clear for the wallet balance display. Use only subtle, low-contrast elements in this region."