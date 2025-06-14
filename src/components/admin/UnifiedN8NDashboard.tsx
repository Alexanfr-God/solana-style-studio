import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Database,
  Zap,
  BarChart3
} from 'lucide-react';
import { unifiedN8NService } from '@/services/unifiedN8NService';
import { toast } from 'sonner';

interface Analytics {
  totalCustomizations: number;
  successRate: number;
  averageQuality: number;
  averageProcessingTime: number;
  recentTrends: any[];
}

const UnifiedN8NDashboard = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [recentCustomizations, setRecentCustomizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      console.log('📊 Loading unified N8N dashboard data...');
      
      // Load analytics
      const analyticsData = await unifiedN8NService.getAnalytics();
      if (analyticsData) {
        setAnalytics(analyticsData);
        console.log('✅ Analytics loaded:', analyticsData);
      }

      // Load recent customizations (mock data since we don't have user context)
      const mockUserId = 'demo_user';
      const history = await unifiedN8NService.getCustomizationHistory(mockUserId, 20);
      setRecentCustomizations(history);
      console.log('✅ Recent customizations loaded:', history.length);

      toast.success('Dashboard data refreshed');
    } catch (error) {
      console.error('❌ Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Clock className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Unified N8N Dashboard</h2>
          <p className="text-white/70">Monitor wallet customization performance and analytics</p>
        </div>
        <Button 
          onClick={loadDashboardData}
          disabled={isLoading}
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-black/30 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70 flex items-center">
                <Database className="h-4 w-4 mr-2" />
                Total Customizations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{analytics.totalCustomizations}</div>
              <p className="text-xs text-white/50">All time</p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {(analytics.successRate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-white/50">Completed successfully</p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70 flex items-center">
                <BarChart3 className="h-4 w-4 mr-2" />
                Avg. Quality
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {(analytics.averageQuality * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-white/50">Quality score</p>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-white/70 flex items-center">
                <Zap className="h-4 w-4 mr-2" />
                Avg. Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {formatProcessingTime(analytics.averageProcessingTime)}
              </div>
              <p className="text-xs text-white/50">Processing time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Customizations */}
      <Card className="bg-black/30 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Recent Customizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentCustomizations.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 mx-auto text-white/30 mb-4" />
              <p className="text-white/50">No customizations found</p>
              <p className="text-white/30 text-sm">Start customizing wallets to see data here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentCustomizations.slice(0, 10).map((customization, index) => (
                <div key={customization.id || index} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(customization.status)}`} />
                    <div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(customization.status)}
                        <span className="font-medium text-white">
                          Session {customization.session_id?.slice(-8) || 'Unknown'}
                        </span>
                        {customization.wallet_structure_analysis?.wallet_type && (
                          <Badge variant="outline" className="text-xs border-white/20 text-white/70">
                            {customization.wallet_structure_analysis.wallet_type}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-white/50">
                        {customization.created_at ? new Date(customization.created_at).toLocaleString() : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      {customization.processing_time_ms ? formatProcessingTime(customization.processing_time_ms) : 'N/A'}
                    </div>
                    {customization.quality_score && (
                      <div className="text-xs text-white/50">
                        Quality: {(customization.quality_score * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Status */}
      <Card className="bg-black/30 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-white">Database Integration</h4>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-white/70">Connected</span>
              </div>
              <p className="text-xs text-white/50">
                Tracking wallet structures, image analysis, and results
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-white">N8N Workflow</h4>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-sm text-white/70">Using Mock Data</span>
              </div>
              <p className="text-xs text-white/50">
                Configure N8N webhook for live processing
              </p>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-white">Analytics Engine</h4>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-sm text-white/70">Active</span>
              </div>
              <p className="text-xs text-white/50">
                Real-time performance monitoring enabled
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="bg-white/10" />

      <div className="text-center">
        <p className="text-white/50 text-sm">
          Unified N8N Service v3.0 - Next generation wallet customization system
        </p>
      </div>
    </div>
  );
};

export default UnifiedN8NDashboard;