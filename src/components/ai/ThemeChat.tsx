
// DEPRECATED: This file re-exports the new chat for backward compatibility.
// Use @/components/chat/ThemeChat directly in new code.
import React from 'react';
import NewThemeChat from '@/components/chat/ThemeChat';

// Wrapper for compatibility with old API (no required props)
const ThemeChatLegacyWrapper: React.FC = () => {
  return (
    <NewThemeChat 
      themeId="default" 
      // initialTheme not passed - will use store default
    />
  );
};

export default ThemeChatLegacyWrapper;
