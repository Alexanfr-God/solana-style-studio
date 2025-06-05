
export interface AgentStatus {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result?: any;
  error?: string;
}

export type AgentName = 'StyleAgent' | 'FontAgent' | 'ButtonAgent' | 'CharacterAgent' | 'LayoutAgent';
