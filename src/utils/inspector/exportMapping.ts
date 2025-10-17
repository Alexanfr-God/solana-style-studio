import { ProbeResult, ProbeStatus } from '@/stores/themeProbeStore';

/**
 * Export mapping results as JSON file
 */
export function exportMappingJSON(result: ProbeResult, screen: string): void {
  const data = {
    screen,
    timestamp: new Date().toISOString(),
    coverage: result.coverage,
    totalElements: result.totalElements,
    items: result.items,
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { 
    type: 'application/json' 
  });
  downloadBlob(blob, `mapping.${screen}.json`);
}

/**
 * Export mapping summary as Markdown file
 */
export function exportMappingSummary(result: ProbeResult, screen: string): void {
  const statusCounts: Record<ProbeStatus, number> = {
    OK: 0,
    AMBIGUOUS: 0,
    UNMAPPED: 0,
    NON_SCALAR: 0,
  };
  
  result.items.forEach(item => {
    statusCounts[item.status]++;
  });
  
  const lines: string[] = [
    `# ThemeProbe Mapping Summary: ${screen}`,
    '',
    `**Generated:** ${new Date().toLocaleString()}`,
    `**Total Elements:** ${result.totalElements}`,
    `**Coverage:** ${result.coverage}%`,
    '',
    '## Status Breakdown',
    '',
    `- ✅ **OK:** ${statusCounts.OK} elements`,
    `- ⚠️ **AMBIGUOUS:** ${statusCounts.AMBIGUOUS} elements`,
    `- ❌ **UNMAPPED:** ${statusCounts.UNMAPPED} elements`,
    `- 🚫 **NON_SCALAR:** ${statusCounts.NON_SCALAR} elements`,
    '',
    '## Detailed Mapping',
    '',
    '| Element ID | JSON Path | Status | Confidence | Changed Props |',
    '|------------|-----------|--------|------------|---------------|',
  ];
  
  // Sort by status (OK first, then by confidence)
  const sorted = [...result.items].sort((a, b) => {
    const statusOrder: Record<ProbeStatus, number> = {
      OK: 0,
      AMBIGUOUS: 1,
      UNMAPPED: 2,
      NON_SCALAR: 3,
    };
    if (statusOrder[a.status] !== statusOrder[b.status]) {
      return statusOrder[a.status] - statusOrder[b.status];
    }
    return (b.confidence || 0) - (a.confidence || 0);
  });
  
  sorted.forEach(item => {
    const confidence = item.confidence ? `${Math.round(item.confidence * 100)}%` : '-';
    const props = item.changedProps?.join(', ') || '-';
    const path = item.bestPath || '-';
    lines.push(`| ${item.id} | ${path} | ${item.status} | ${confidence} | ${props} |`);
  });
  
  // Add problematic elements section
  const problematic = sorted.filter(i => i.status !== 'OK').slice(0, 10);
  if (problematic.length > 0) {
    lines.push('', '## Top Problematic Elements', '');
    problematic.forEach(item => {
      lines.push(`### ${item.id}`);
      lines.push(`- **Status:** ${item.status}`);
      if (item.bestPath) {
        lines.push(`- **Best Path:** ${item.bestPath}`);
      }
      if (item.confidence) {
        lines.push(`- **Confidence:** ${Math.round(item.confidence * 100)}%`);
      }
      if (item.changedProps) {
        lines.push(`- **Changed Props:** ${item.changedProps.join(', ')}`);
      }
      lines.push('');
    });
  }
  
  const markdown = lines.join('\n');
  const blob = new Blob([markdown], { type: 'text/markdown' });
  downloadBlob(blob, `mapping.${screen}.summary.md`);
}

/**
 * Helper to download blob as file
 */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
