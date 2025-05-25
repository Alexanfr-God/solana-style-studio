
// Detailed debug logging for V4 pipeline

interface LogEntry {
  timestamp: string;
  level: 'info' | 'error' | 'warn' | 'debug';
  message: string;
  data?: any;
}

const logs: LogEntry[] = [];

export function logDebug(message: string, data?: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'debug',
    message,
    data
  };
  
  logs.push(entry);
  console.log(`[V4-DEBUG] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

export function logError(message: string, error?: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'error',
    message,
    data: error
  };
  
  logs.push(entry);
  console.error(`[V4-ERROR] ${message}`, error);
}

export function logInfo(message: string, data?: any) {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level: 'info',
    message,
    data
  };
  
  logs.push(entry);
  console.log(`[V4-INFO] ${message}`, data ? JSON.stringify(data, null, 2) : '');
}

export function getDebugLogs(): LogEntry[] {
  return [...logs];
}

export function clearLogs() {
  logs.length = 0;
}
