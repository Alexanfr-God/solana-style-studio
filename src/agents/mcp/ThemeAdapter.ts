/**
 * ThemeAdapter - Interface for runtime theme manipulation
 * Allows ThemeProbe to temporarily mutate theme values and trigger re-renders
 */

export interface ThemeAdapter {
  /**
   * Get the current theme object
   */
  getTheme(): any;

  /**
   * Set a scalar value at a specific json_path
   * @param path - JSON path (e.g. "/homeLayer/actionButtons/sendButton/iconColor")
   * @param nextValue - New value to set
   */
  setScalar(path: string, nextValue: any): void;

  /**
   * Restore a scalar value at a specific json_path
   * @param path - JSON path
   * @param prevValue - Previous value to restore
   */
  restoreScalar(path: string, prevValue: any): void;

  /**
   * Force UI re-render after theme change
   */
  forceRerender(): void;
}
