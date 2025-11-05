import React from 'react';
import { useAiScannerStore } from '@/stores/aiScannerStore';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Activity, Users, Zap, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export const MonitoringPanel = () => {
  const { wsMetrics } = useAiScannerStore();

  if (!wsMetrics) {
    return null;
  }

  const metrics = [
    {
      icon: Users,
      label: 'Connected Clients',
      value: wsMetrics.connectedClients || 0,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: Clock,
      label: 'Avg Latency',
      value: wsMetrics.avgLatency ? `${wsMetrics.avgLatency}ms` : '—',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Zap,
      label: 'Messages/min',
      value: wsMetrics.throughput || 0,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Activity,
      label: 'Status',
      value: wsMetrics.isConnected ? 'Connected' : 'Disconnected',
      color: wsMetrics.isConnected ? 'text-green-500' : 'text-red-500',
      bgColor: wsMetrics.isConnected ? 'bg-green-500/10' : 'bg-red-500/10'
    }
  ];

  return (
    <Card className="p-4 border-t">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h4 className="text-sm font-semibold">WS Bridge Monitoring</h4>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-lg ${metric.bgColor} border border-border/50`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`h-3.5 w-3.5 ${metric.color}`} />
                <span className="text-xs text-muted-foreground">{metric.label}</span>
              </div>
              <div className={`text-lg font-semibold ${metric.color}`}>
                {metric.value}
              </div>
            </motion.div>
          );
        })}
      </div>

      {wsMetrics.lastMessageTime && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Last message: {new Date(wsMetrics.lastMessageTime).toLocaleTimeString()}
          </p>
        </div>
      )}
    </Card>
  );
};
