
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Activity, AlertTriangle, CheckCircle, Clock, Download, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LogEntry {
  id: string;
  created_at: string;
  prompt?: string;
  status?: string;
  image_url?: string;
  layer_type?: string;
  user_id?: string;
  style_result?: Record<string, any>;
}

interface AnalyticsData {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  activeUsers: number;
  topPrompts: Array<{ prompt: string; count: number }>;
  recentActivity: Array<{ time: string; count: number }>;
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
      // Use ai_requests table instead of non-existent system_logs
      const { data, error } = await supabase
        .from('ai_requests')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error loading logs:', error);
        return;
      }

      setLogs(data || []);
    } catch (error) {
      console.error('Failed to load logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      // Get requests from the last hour for analytics
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabase
        .from('ai_requests')
        .select('*')
        .gte('created_at', oneHourAgo);

      if (error) {
        console.error('Error loading analytics:', error);
        return;
      }

      const requestsData = data || [];
      
      // Calculate analytics
      const totalRequests = requestsData.length;
      const successfulRequests = requestsData.filter(req => req.status === 'completed');
      const successRate = totalRequests > 0 ? (successfulRequests.length / totalRequests) * 100 : 0;
      
      const averageResponseTime = 0; // We don't have performance data
      const activeUsers = new Set(requestsData.map(req => req.user_id).filter(Boolean)).size;

      // Top prompts
      const promptCounts = requestsData.reduce((acc, req) => {
        const prompt = req.prompt || 'Unknown Prompt';
        acc[prompt] = (acc[prompt] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const topPrompts = Object.entries(promptCounts)
        .map(([prompt, count]) => ({ prompt: prompt.substring(0, 50) + '...', count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setAnalytics({
        totalRequests,
        successRate,
        averageResponseTime,
        activeUsers,
        topPrompts,
        recentActivity: [] // Would need more complex calculation
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const exportLogs = () => {
    const csvContent = [
      'ID,Created At,Prompt,Status,Layer Type,User ID',
      ...logs.map(log => 
        `${log.id},${log.created_at},${(log.prompt || '').replace(/,/g, ';')},${log.status || ''},${log.layer_type || ''},${log.user_id || ''}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-requests-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'failed': return <AlertTriangle className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const filteredLogs = selectedModule === 'all' 
    ? logs 
    : logs.filter(log => log.layer_type === selectedModule);

  const modules = ['all', ...new Set(logs.map(log => log.layer_type).filter(Boolean))];

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
        <h2 className="text-2xl font-bold">AI Requests Monitoring Dashboard</h2>
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
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalRequests}</div>
              <p className="text-xs text-muted-foreground">Last hour</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Completed/Total</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">N/A</div>
              <p className="text-xs text-muted-foreground">Not tracked</p>
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

      <Tabs defaultValue="requests" className="space-y-4">
        <TabsList>
          <TabsTrigger value="requests">Recent Requests</TabsTrigger>
          <TabsTrigger value="prompts">Top Prompts</TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Filter by layer:</span>
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
              <CardTitle>AI Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {filteredLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(log.status || 'unknown')}
                        <Badge variant={getStatusColor(log.status || 'unknown') as any}>
                          {log.status || 'unknown'}
                        </Badge>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{log.layer_type || 'Unknown'}</span>
                          <span className="text-sm text-muted-foreground">·</span>
                          <span className="text-sm text-muted-foreground">
                            {log.prompt ? log.prompt.substring(0, 50) + '...' : 'No prompt'}
                          </span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        ID: {log.id.split('-')[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts" className="space-y-4">
          {analytics?.topPrompts && analytics.topPrompts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Most Popular Prompts (Last Hour)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {analytics.topPrompts.map((prompt, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{prompt.prompt}</span>
                      <Badge variant="outline">{prompt.count}</Badge>
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
