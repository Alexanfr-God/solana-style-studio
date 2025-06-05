
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, AlertTriangle, CheckCircle, Clock, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/services/walletDesignerLogger';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'success';
  module: string;
  action: string;
  data: Record<string, any>;
  user_id?: string;
  session_id: string;
  performance: {
    startTime?: number;
    endTime?: number;
    duration?: number;
  };
}

interface AnalyticsData {
  totalLogs: number;
  errorRate: number;
  averageResponseTime: number;
  activeUsers: number;
  topErrors: Array<{ error: string; count: number }>;
  performanceTrend: Array<{ time: string; avgDuration: number }>;
}

const LoggingDashboard: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string>('all');

  useEffect(() => {
    loadLogs();
    loadAnalytics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadLogs();
      loadAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading logs:', error);
        return;
      }

      // Transform Supabase data to match our LogEntry interface
      const transformedLogs: LogEntry[] = (data || []).map(log => ({
        id: log.id,
        timestamp: log.timestamp,
        level: log.level as 'debug' | 'info' | 'warn' | 'error' | 'success',
        module: log.module,
        action: log.action,
        data: typeof log.data === 'object' ? log.data as Record<string, any> : {},
        user_id: log.user_id || undefined,
        session_id: log.session_id,
        performance: typeof log.performance === 'object' ? 
          log.performance as { startTime?: number; endTime?: number; duration?: number } : 
          {}
      }));

      setLogs(transformedLogs);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Get logs from the last hour for analytics
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .gte('timestamp', oneHourAgo);

      if (error) {
        console.error('Error loading analytics:', error);
        return;
      }

      const logsData = data || [];
      
      // Calculate analytics
      const totalLogs = logsData.length;
      const errorLogs = logsData.filter(log => log.level === 'error');
      const errorRate = totalLogs > 0 ? (errorLogs.length / totalLogs) * 100 : 0;
      
      const responseTimes = logsData
        .filter(log => {
          const perf = typeof log.performance === 'object' ? log.performance as any : null;
          return perf && typeof perf.duration === 'number';
        })
        .map(log => {
          const perf = log.performance as any;
          return perf.duration;
        });
      
      const averageResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((sum: number, time: number) => sum + time, 0) / responseTimes.length
        : 0;

      const activeUsers = new Set(logsData.map(log => log.user_id).filter(Boolean)).size;

      // Top errors
      const errorCounts = errorLogs.reduce((acc, log) => {
        const data = typeof log.data === 'object' ? log.data as any : {};
        const error = data?.error || 'Unknown Error';
        acc[error] = (acc[error] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topErrors = Object.entries(errorCounts)
        .map(([error, count]) => ({ error, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setAnalytics({
        totalLogs,
        errorRate,
        averageResponseTime,
        activeUsers,
        topErrors,
        performanceTrend: [] // Would need more complex calculation
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const exportLogs = () => {
    const exportData = logger.exportLogs('csv');
    const blob = new Blob([exportData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-logs-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      case 'success': return 'default';
      case 'info': return 'outline';
      default: return 'outline';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'success': return <CheckCircle className="w-4 h-4" />;
      case 'info': return <Activity className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const filteredLogs = selectedModule === 'all' 
    ? logs 
    : logs.filter(log => log.module === selectedModule);

  const modules = ['all', ...new Set(logs.map(log => log.module))];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">System Monitoring Dashboard</h2>
        <div className="flex space-x-2">
          <Button onClick={loadLogs} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportLogs} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalLogs}</div>
              <p className="text-xs text-muted-foreground">Last hour</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.errorRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Errors/Total logs</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.averageResponseTime.toFixed(0)}ms</div>
              <p className="text-xs text-muted-foreground">Analysis duration</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.activeUsers}</div>
              <p className="text-xs text-muted-foreground">Last hour</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Recent Logs</TabsTrigger>
          <TabsTrigger value="errors">Error Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="logs" className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Filter by module:</span>
            {modules.map(module => (
              <Button
                key={module}
                variant={selectedModule === module ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedModule(module)}
              >
                {module}
              </Button>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getLevelIcon(log.level)}
                        <Badge variant={getLevelColor(log.level) as any}>
                          {log.level}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{log.module}</span>
                          <span className="text-sm text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">{log.action}</span>
                          {log.performance?.duration && (
                            <>
                              <span className="text-sm text-muted-foreground">·</span>
                              <span className="text-sm text-muted-foreground">
                                {log.performance.duration.toFixed(0)}ms
                              </span>
                            </>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        
                        {log.data?.error && (
                          <div className="text-sm text-red-500 mt-1">
                            {log.data.error}
                          </div>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Session: {log.session_id.split('_')[1]}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          {analytics?.topErrors && analytics.topErrors.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top Errors (Last Hour)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.topErrors.map((error, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{error.error}</span>
                      <Badge variant="destructive">{error.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LoggingDashboard;
