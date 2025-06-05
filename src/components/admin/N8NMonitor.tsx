
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

interface N8NMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageProcessingTime: number;
  lastRequestTime: string;
}

const N8NMonitor = () => {
  const [metrics, setMetrics] = useState<N8NMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageProcessingTime: 0,
    lastRequestTime: 'Never'
  });

  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // In a real implementation, this would fetch from your monitoring service
    // For now, we'll simulate metrics
    const fetchMetrics = () => {
      setMetrics({
        totalRequests: 42,
        successfulRequests: 38,
        failedRequests: 4,
        averageProcessingTime: 8.5,
        lastRequestTime: new Date().toLocaleTimeString()
      });
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const successRate = metrics.totalRequests > 0 
    ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)
    : '0';

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>N8N Workflow Monitor</span>
          <Badge variant={isOnline ? "default" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-500">{metrics.totalRequests}</div>
            <div className="text-sm text-gray-500">Total Requests</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-green-500">{metrics.successfulRequests}</span>
            </div>
            <div className="text-sm text-gray-500">Successful</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-2xl font-bold text-red-500">{metrics.failedRequests}</span>
            </div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">{successRate}%</div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Avg Processing: {metrics.averageProcessingTime}s</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-gray-500" />
            <span className="text-sm">Last Request: {metrics.lastRequestTime}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-4">
          <strong>N8N Webhook:</strong> https://wacocu.app.n8n.cloud/webhook-test/ai-wallet-designer
        </div>
      </CardContent>
    </Card>
  );
};

export default N8NMonitor;
