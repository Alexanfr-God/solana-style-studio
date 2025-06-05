
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';

interface AgentStatus {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

interface AgentProgressIndicatorProps {
  agents: AgentStatus[];
  currentAgent?: string;
  isVisible: boolean;
}

const AgentProgressIndicator: React.FC<AgentProgressIndicatorProps> = ({ 
  agents, 
  currentAgent,
  isVisible 
}) => {
  if (!isVisible) return null;

  const completedCount = agents.filter(a => a.status === 'completed').length;
  const progress = (completedCount / agents.length) * 100;

  const getAgentIcon = (status: string, isActive: boolean) => {
    if (isActive && status === 'running') {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getAgentBadgeVariant = (status: string, isActive: boolean): "default" | "secondary" | "destructive" | "outline" => {
    if (isActive) return 'default';
    
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white">AI Multi-Agent Pipeline</h3>
        <Badge variant="outline" className="text-xs">
          {completedCount}/{agents.length} Complete
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="space-y-2">
        {agents.map((agent, index) => {
          const isActive = currentAgent === agent.name;
          
          return (
            <div key={agent.name} className="flex items-center justify-between p-2 rounded border border-white/5">
              <div className="flex items-center space-x-3">
                {getAgentIcon(agent.status, isActive)}
                <span className={`text-sm ${isActive ? 'text-white font-medium' : 'text-white/70'}`}>
                  {agent.name}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {agent.error && (
                  <span className="text-xs text-red-400 max-w-32 truncate" title={agent.error}>
                    {agent.error}
                  </span>
                )}
                <Badge 
                  variant={getAgentBadgeVariant(agent.status, isActive)}
                  className="text-xs"
                >
                  {agent.status}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>

      {progress === 100 && (
        <div className="text-center">
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            ✨ Multi-Agent Design Complete
          </Badge>
        </div>
      )}
    </div>
  );
};

export default AgentProgressIndicator;
