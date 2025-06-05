
import { supabase } from '@/integrations/supabase/client';
import { PromptBuilder, N8NAgentOrchestrator, type WalletBlueprint, type StyleBlueprint } from '@/prompts/agentPrompts';
import { frontendLogger } from './frontendLogger';

export interface AgentExecutionResult {
  success: boolean;
  agentName: string;
  output: any;
  nextAgent?: string;
  errors?: string[];
}

export interface AgentPipelineResult {
  success: boolean;
  finalOutput: any;
  agentResults: Record<string, any>;
  errors: string[];
  executionTime: number;
}

export class N8NAgentService {
  private static instance: N8NAgentService;
  
  static getInstance(): N8NAgentService {
    if (!N8NAgentService.instance) {
      N8NAgentService.instance = new N8NAgentService();
    }
    return N8NAgentService.instance;
  }

  async executeAgent(
    agentName: string,
    styleBlueprint: StyleBlueprint,
    walletBlueprint: WalletBlueprint,
    userPrompt: string,
    agentOutputs: Record<string, any> = {}
  ): Promise<AgentExecutionResult> {
    const startTime = Date.now();
    
    try {
      await frontendLogger.logUserInteraction(
        'generate',
        `ai_agent_${agentName.toLowerCase()}`,
        `Executing ${agentName} for: ${userPrompt.substring(0, 50)}...`
      );

      console.log(`🤖 Executing ${agentName}...`);

      const { data, error } = await supabase.functions.invoke('ai-agent-orchestrator', {
        body: {
          agentName,
          styleBlueprint,
          walletBlueprint,
          userPrompt,
          agentOutputs
        }
      });

      if (error) {
        console.error(`❌ ${agentName} execution failed:`, error);
        throw new Error(`${agentName} execution failed: ${error.message}`);
      }

      const executionTime = Date.now() - startTime;
      
      await frontendLogger.logUserInteraction(
        'generate',
        `ai_agent_${agentName.toLowerCase()}`,
        `${agentName} completed in ${executionTime}ms`
      );

      console.log(`✅ ${agentName} completed successfully:`, data);
      
      return {
        success: true,
        agentName,
        output: data.output,
        nextAgent: data.nextAgent
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await frontendLogger.logUserError(
        'AGENT_EXECUTION_ERROR',
        `${agentName}: ${error.message}`,
        `ai_agent_${agentName.toLowerCase()}`
      );

      console.error(`💥 ${agentName} failed after ${executionTime}ms:`, error);
      
      return {
        success: false,
        agentName,
        output: null,
        errors: [error.message]
      };
    }
  }

  async executeAgentPipeline(
    styleBlueprint: StyleBlueprint,
    walletBlueprint: WalletBlueprint,
    userPrompt: string,
    webhookUrl?: string
  ): Promise<AgentPipelineResult> {
    const startTime = Date.now();
    const agentResults: Record<string, any> = {};
    const errors: string[] = [];
    
    try {
      await frontendLogger.logUserInteraction(
        'generate',
        'ai_agent_pipeline',
        `Starting multi-agent pipeline for: ${userPrompt.substring(0, 50)}...`
      );

      console.log('🚀 Starting AI Agent Pipeline...');

      // Determine agent sequence
      const agentSequence = ['StyleAgent', 'FontAgent', 'ButtonAgent'];
      if (walletBlueprint.elements.aiPet) {
        agentSequence.push('CharacterAgent');
      }
      agentSequence.push('LayoutAgent');

      console.log('📋 Agent sequence:', agentSequence);

      // Execute agents in sequence
      for (const agentName of agentSequence) {
        const result = await this.executeAgent(
          agentName,
          styleBlueprint,
          walletBlueprint,
          userPrompt,
          agentResults
        );

        if (result.success) {
          agentResults[agentName] = result.output;
          console.log(`✅ ${agentName} completed`);
        } else {
          console.error(`❌ ${agentName} failed:`, result.errors);
          errors.push(`${agentName}: ${result.errors?.join(', ')}`);
          
          // Continue with next agent even if one fails
          agentResults[agentName] = this.getDefaultOutput(agentName);
        }
      }

      // Send webhook if provided (for n8n integration)
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'agent_pipeline_complete',
              agentResults,
              styleBlueprint,
              walletBlueprint,
              userPrompt,
              executionTime: Date.now() - startTime
            })
          });
          console.log('📡 Webhook sent successfully');
        } catch (webhookError) {
          console.warn('⚠️ Webhook failed:', webhookError);
        }
      }

      const executionTime = Date.now() - startTime;
      
      await frontendLogger.logUserInteraction(
        'generate',
        'ai_agent_pipeline',
        `Pipeline completed in ${executionTime}ms with ${errors.length} errors`
      );

      console.log(`🏁 Pipeline completed in ${executionTime}ms`);

      return {
        success: errors.length === 0,
        finalOutput: this.combineAgentOutputs(agentResults),
        agentResults,
        errors,
        executionTime
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      await frontendLogger.logUserError(
        'AGENT_PIPELINE_ERROR',
        error.message,
        'ai_agent_pipeline'
      );

      console.error(`💥 Pipeline failed after ${executionTime}ms:`, error);
      
      return {
        success: false,
        finalOutput: null,
        agentResults,
        errors: [error.message],
        executionTime
      };
    }
  }

  private getDefaultOutput(agentName: string): any {
    const defaults = {
      StyleAgent: {
        background: { type: 'solid', primaryColor: '#131313' },
        colorPalette: { primary: '#9945FF', secondary: '#14F195', accent: '#F037A5', neutral: '#FFFFFF' }
      },
      FontAgent: {
        typography: {
          fontStack: { primary: 'Inter, sans-serif' },
          scales: { body: { size: '16px', weight: '400' } }
        }
      },
      ButtonAgent: {
        buttons: {
          primary: { background: '#9945FF', text: '#FFFFFF', borderRadius: '8px' }
        }
      },
      CharacterAgent: {
        character: { type: 'pet', personality: ['friendly', 'helpful'] },
        integration: { safeZoneCompliance: true }
      },
      LayoutAgent: {
        layoutValidation: { safeZoneCompliance: { status: 'valid' } },
        finalApproval: { approved: true, confidence: 0.8 }
      }
    };

    return defaults[agentName] || {};
  }

  private combineAgentOutputs(agentResults: Record<string, any>): any {
    const combined = {
      background: agentResults.StyleAgent?.background,
      colorPalette: agentResults.StyleAgent?.colorPalette,
      typography: agentResults.FontAgent?.typography,
      buttons: agentResults.ButtonAgent?.buttons,
      character: agentResults.CharacterAgent?.character,
      validation: agentResults.LayoutAgent?.layoutValidation,
      approval: agentResults.LayoutAgent?.finalApproval
    };

    // Convert to wallet style format for compatibility
    return {
      backgroundColor: combined.background?.primaryColor || '#131313',
      backgroundImage: combined.background?.gradient ? 
        `linear-gradient(${combined.background.gradient.direction}, ${combined.background.gradient.stops?.map(s => s.color).join(', ')})` : 
        undefined,
      accentColor: combined.colorPalette?.accent || '#9945FF',
      textColor: combined.colorPalette?.neutral || '#FFFFFF',
      buttonColor: combined.buttons?.primary?.background || '#9945FF',
      buttonTextColor: combined.buttons?.primary?.text || '#FFFFFF',
      borderRadius: combined.buttons?.primary?.borderRadius || '8px',
      fontFamily: combined.typography?.fontStack?.primary || 'Inter, sans-serif',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
      styleNotes: `AI Multi-Agent Design (${combined.approval?.confidence || 0.8} confidence)`
    };
  }
}

// Export singleton instance
export const n8nAgentService = N8NAgentService.getInstance();
