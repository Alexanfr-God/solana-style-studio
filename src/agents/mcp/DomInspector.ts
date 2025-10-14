/**
 * DomInspector Interface
 * 
 * Abstraction for scanning DOM elements.
 * Current implementation: LocalDomInspector (scans current preview)
 * Future: ChromeDevtoolsInspector (MCP chrome-devtools protocol)
 */

export interface DomInspectionResult {
  id: string;
  selector: string;
  element?: HTMLElement; // for debugging
}

export interface DomInspector {
  /**
   * Scan DOM for elements on a specific screen
   * @param screen - 'lock' or 'home'
   * @returns Array of discovered elements with their selectors
   */
  scan(screen: 'lock' | 'home'): DomInspectionResult[];
}
