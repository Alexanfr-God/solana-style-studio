
import { supabase } from '@/integrations/supabase/client';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'success';
  module: string;
  action: string;
  data: Record<string, any>;
  userId?: string;
  sessionId: string;
  performance: {
    startTime: number;
    endTime?: number;
    duration?: number;
  };
}

export interface ImageAnalysisLog extends LogEntry {
  module: 'ImageAnalysis';
  data: {
    imageUrl: string;
    imageSize?: { width: number; height: number };
    fileFormat?: string;
    confidenceScore?: number;
    styleBlueprint?: any;
    prompt?: string;
    aiModel: string;
    tokenUsage?: number;
    error?: string;
  };
}

export interface StyleGenerationLog extends LogEntry {
  module: 'StyleGeneration';
  data: {
    agentName: 'StyleAgent' | 'FontAgent' | 'ButtonAgent' | 'CharacterAgent' | 'LayoutAgent';
    inputBlueprint: any;
    outputStyles: any;
    processingTime: number;
    success: boolean;
    errors?: string[];
  };
}

export interface UserInteractionLog extends LogEntry {
  module: 'UserInteraction';
  data: {
    action: 'upload' | 'generate' | 'like' | 'dislike' | 'mint' | 'share' | 'apply_style' | 'save_style';
    elementId?: string;
    previousState?: any;
    newState?: any;
    userFeedback?: string;
  };
}

export class WalletDesignerLogger {
  private logs: LogEntry[] = [];
  private sessionId: string;
  private supabaseClient: any;

  constructor(supabaseClient?: any) {
    this.sessionId = this.generateSessionId();
    this.supabaseClient = supabaseClient || supabase;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createBaseLog(level: LogEntry['level'], module: string, action: string): Partial<LogEntry> {
    return {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      level,
      module,
      action,
      sessionId: this.sessionId,
      performance: {
        startTime: performance.now()
      }
    };
  }

  // Image Analysis Logging
  async logImageAnalysisStart(imageUrl: string, prompt: string, userId?: string): Promise<string> {
    const logEntry: ImageAnalysisLog = {
      ...this.createBaseLog('info', 'ImageAnalysis', 'analysis_start'),
      data: {
        imageUrl: imageUrl.substring(0, 100) + '...', // Truncate for storage
        prompt,
        aiModel: 'gpt-4o'
      },
      userId
    } as ImageAnalysisLog;

    this.logs.push(logEntry);
    await this.persistLog(logEntry);
    console.log(`🔍 [ImageAnalysis] Starting analysis for session: ${this.sessionId}`);
    return logEntry.id;
  }

  async logImageAnalysisSuccess(
    logId: string, 
    styleBlueprint: any, 
    confidenceScore: number,
    tokenUsage?: number
  ): Promise<void> {
    const existingLog = this.logs.find(log => log.id === logId) as ImageAnalysisLog;
    if (existingLog) {
      existingLog.level = 'success';
      existingLog.action = 'analysis_complete';
      existingLog.performance.endTime = performance.now();
      existingLog.performance.duration = existingLog.performance.endTime - existingLog.performance.startTime;
      existingLog.data.styleBlueprint = styleBlueprint;
      existingLog.data.confidenceScore = confidenceScore;
      existingLog.data.tokenUsage = tokenUsage;

      await this.persistLog(existingLog);
      console.log(`✅ [ImageAnalysis] Completed successfully in ${existingLog.performance.duration?.toFixed(2)}ms`);
    }
  }

  async logImageAnalysisError(logId: string, error: string): Promise<void> {
    const existingLog = this.logs.find(log => log.id === logId);
    if (existingLog) {
      existingLog.level = 'error';
      existingLog.action = 'analysis_failed';
      existingLog.performance.endTime = performance.now();
      existingLog.performance.duration = existingLog.performance.endTime - existingLog.performance.startTime;
      existingLog.data.error = error;

      await this.persistLog(existingLog);
      console.error(`❌ [ImageAnalysis] Failed after ${existingLog.performance.duration?.toFixed(2)}ms: ${error}`);
    }
  }

  // Style Agent Logging
  async logStyleAgentExecution(
    agentName: StyleGenerationLog['data']['agentName'],
    inputBlueprint: any,
    userId?: string
  ): Promise<string> {
    const logEntry: StyleGenerationLog = {
      ...this.createBaseLog('info', 'StyleGeneration', `${agentName}_start`),
      data: {
        agentName,
        inputBlueprint,
        outputStyles: null,
        processingTime: 0,
        success: false
      },
      userId
    } as StyleGenerationLog;

    this.logs.push(logEntry);
    await this.persistLog(logEntry);
    console.log(`🎨 [${agentName}] Starting style generation`);
    return logEntry.id;
  }

  async logStyleAgentSuccess(
    logId: string, 
    outputStyles: any, 
    processingTime: number
  ): Promise<void> {
    const existingLog = this.logs.find(log => log.id === logId) as StyleGenerationLog;
    if (existingLog) {
      existingLog.level = 'success';
      existingLog.action = existingLog.data.agentName + '_complete';
      existingLog.performance.endTime = performance.now();
      existingLog.performance.duration = existingLog.performance.endTime - existingLog.performance.startTime;
      existingLog.data.outputStyles = outputStyles;
      existingLog.data.processingTime = processingTime;
      existingLog.data.success = true;

      await this.persistLog(existingLog);
      console.log(`✅ [${existingLog.data.agentName}] Completed in ${existingLog.performance.duration?.toFixed(2)}ms`);
    }
  }

  // User Interaction Logging
  async logUserInteraction(
    action: UserInteractionLog['data']['action'],
    elementId?: string,
    userFeedback?: string,
    userId?: string
  ): Promise<void> {
    const logEntry: UserInteractionLog = {
      ...this.createBaseLog('info', 'UserInteraction', action),
      data: {
        action,
        elementId,
        userFeedback
      },
      userId
    } as UserInteractionLog;

    this.logs.push(logEntry);
    await this.persistLog(logEntry);
    console.log(`👤 [UserInteraction] ${action} ${elementId ? `on ${elementId}` : ''}`);
  }

  // Performance Analytics
  getPerformanceMetrics(): {
    averageAnalysisTime: number;
    successRate: number;
    mostUsedAgents: string[];
    userSatisfactionScore: number;
  } {
    const analysisLogs = this.logs.filter(log => log.module === 'ImageAnalysis') as ImageAnalysisLog[];
    const successfulAnalyses = analysisLogs.filter(log => log.level === 'success');
    
    const averageAnalysisTime = successfulAnalyses.length > 0 
      ? successfulAnalyses.reduce((sum, log) => sum + (log.performance.duration || 0), 0) / successfulAnalyses.length
      : 0;

    const successRate = analysisLogs.length > 0 ? (successfulAnalyses.length / analysisLogs.length) * 100 : 0;

    const agentLogs = this.logs.filter(log => log.module === 'StyleGeneration') as StyleGenerationLog[];
    const agentUsage = agentLogs.reduce((acc, log) => {
      acc[log.data.agentName] = (acc[log.data.agentName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostUsedAgents = Object.entries(agentUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([agent]) => agent);

    const interactionLogs = this.logs.filter(log => log.module === 'UserInteraction') as UserInteractionLog[];
    const likes = interactionLogs.filter(log => log.data.action === 'like').length;
    const dislikes = interactionLogs.filter(log => log.data.action === 'dislike').length;
    const userSatisfactionScore = (likes + dislikes) > 0 ? (likes / (likes + dislikes)) * 100 : 0;

    return {
      averageAnalysisTime,
      successRate,
      mostUsedAgents,
      userSatisfactionScore
    };
  }

  // Database persistence
  private async persistLog(logEntry: LogEntry): Promise<void> {
    try {
      if (this.supabaseClient) {
        const { error } = await this.supabaseClient
          .from('system_logs')
          .insert({
            id: logEntry.id,
            timestamp: logEntry.timestamp,
            level: logEntry.level,
            module: logEntry.module,
            action: logEntry.action,
            data: logEntry.data,
            user_id: logEntry.userId,
            session_id: logEntry.sessionId,
            performance: logEntry.performance
          });

        if (error) {
          console.error('Failed to persist log to database:', error);
        }
      }
    } catch (error) {
      console.error('Failed to persist log:', error);
      // Store in memory as fallback
    }
  }

  // Real-time monitoring
  getRealtimeStats(): {
    activeSession: string;
    totalLogs: number;
    errorCount: number;
    lastActivity: string;
    currentPerformance: 'good' | 'warning' | 'critical';
  } {
    const recentLogs = this.logs.filter(log => 
      new Date(log.timestamp) > new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
    );
    
    const errorCount = recentLogs.filter(log => log.level === 'error').length;
    const avgResponseTime = recentLogs
      .filter(log => log.performance.duration)
      .reduce((sum, log) => sum + (log.performance.duration || 0), 0) / (recentLogs.length || 1);

    let currentPerformance: 'good' | 'warning' | 'critical' = 'good';
    if (errorCount > 5 || avgResponseTime > 10000) currentPerformance = 'critical';
    else if (errorCount > 2 || avgResponseTime > 5000) currentPerformance = 'warning';

    return {
      activeSession: this.sessionId,
      totalLogs: this.logs.length,
      errorCount,
      lastActivity: this.logs[this.logs.length - 1]?.timestamp || '',
      currentPerformance
    };
  }

  // Export logs for analysis
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.logs, null, 2);
    } else {
      const headers = ['timestamp', 'level', 'module', 'action', 'duration', 'session_id'];
      const rows = this.logs.map(log => [
        log.timestamp,
        log.level,
        log.module,
        log.action,
        log.performance.duration?.toString() || '',
        log.sessionId
      ]);
      
      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }
  }
}

// Global logger instance for frontend use
export const logger = new WalletDesignerLogger();
