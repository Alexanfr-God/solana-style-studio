
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

serve(async (req) => {
  console.log(`🌱 Schema Seed Request received: ${req.method}`);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Load the default theme schema
    const defaultSchema = {
      "$schema": "https://json-schema.org/draft/2020-12/schema",
      "$id": "https://walletcc.com/schemas/theme/v1.0.0",
      "title": "WCC Wallet Theme Schema",
      "description": "JSON Schema for WCC wallet themes with strict validation",
      "type": "object",
      "additionalProperties": false,
      "required": ["schemaVersion", "meta", "colors", "typography", "icons", "pages"],
      "properties": {
        "schemaVersion": {
          "type": "string",
          "const": "1.0.0"
        },
        "meta": {
          "type": "object",
          "additionalProperties": false,
          "required": ["name", "author", "createdAt"],
          "properties": {
            "name": {
              "type": "string",
              "minLength": 1
            },
            "author": {
              "type": "string",
              "minLength": 1
            },
            "createdAt": {
              "type": "string",
              "format": "date-time"
            },
            "walletTarget": {
              "type": "string",
              "enum": ["demo", "phantom", "metamask", "rabby", "walletconnect"]
            }
          }
        },
        "colors": {
          "type": "object",
          "additionalProperties": false,
          "required": ["primary", "secondary", "background", "surface", "success", "warning", "danger"],
          "properties": {
            "primary": {
              "type": "string",
              "pattern": "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$"
            },
            "secondary": {
              "type": "string",
              "pattern": "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$"
            },
            "background": {
              "type": "string",
              "pattern": "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$"
            },
            "surface": {
              "type": "string",
              "pattern": "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$"
            },
            "success": {
              "type": "string",
              "pattern": "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$"
            },
            "warning": {
              "type": "string",
              "pattern": "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$"
            },
            "danger": {
              "type": "string",
              "pattern": "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$"
            }
          }
        },
        "typography": {
          "type": "object",
          "additionalProperties": false,
          "required": ["fontFamily", "scale"],
          "properties": {
            "fontFamily": {
              "type": "string",
              "minLength": 1
            },
            "scale": {
              "type": "object",
              "additionalProperties": false,
              "required": ["xs", "sm", "base", "lg", "xl"],
              "properties": {
                "xs": {
                  "type": "number",
                  "minimum": 8,
                  "maximum": 72
                },
                "sm": {
                  "type": "number",
                  "minimum": 8,
                  "maximum": 72
                },
                "base": {
                  "type": "number",
                  "minimum": 8,
                  "maximum": 72
                },
                "lg": {
                  "type": "number",
                  "minimum": 8,
                  "maximum": 72
                },
                "xl": {
                  "type": "number",
                  "minimum": 8,
                  "maximum": 72
                }
              }
            }
          }
        },
        "icons": {
          "type": "object",
          "additionalProperties": false,
          "required": ["set", "mapping"],
          "properties": {
            "set": {
              "type": "string",
              "enum": ["lucide", "phosphor", "heroicons", "custom"]
            },
            "mapping": {
              "type": "object",
              "additionalProperties": {
                "type": "string"
              }
            }
          }
        },
        "pages": {
          "type": "object",
          "additionalProperties": false,
          "patternProperties": {
            "^[A-Za-z0-9_-]+$": {
              "type": "object",
              "additionalProperties": false,
              "required": ["layout", "components"],
              "properties": {
                "layout": {
                  "type": "string",
                  "enum": ["login", "dashboard", "send", "receive", "swap", "nft", "settings"]
                },
                "components": {
                  "type": "object",
                  "additionalProperties": {
                    "type": "object",
                    "additionalProperties": false,
                    "required": ["visible", "bgImage", "bgFit", "radius", "shadow", "padding", "color"],
                    "properties": {
                      "visible": {
                        "type": "boolean"
                      },
                      "bgImage": {
                        "oneOf": [
                          {
                            "type": "string",
                            "format": "uri"
                          },
                          {
                            "type": "null"
                          }
                        ]
                      },
                      "bgFit": {
                        "type": "string",
                        "enum": ["cover", "contain", "pattern"]
                      },
                      "radius": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 32
                      },
                      "shadow": {
                        "type": "string",
                        "enum": ["none", "sm", "md", "lg"]
                      },
                      "padding": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 48
                      },
                      "color": {
                        "type": "string",
                        "pattern": "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$"
                      },
                      "backgroundColor": {
                        "type": "string",
                        "pattern": "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$"
                      },
                      "textColor": {
                        "type": "string",
                        "pattern": "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$"
                      },
                      "borderColor": {
                        "type": "string",
                        "pattern": "^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$"
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    // Check if schema version already exists
    const { data: existingSchema } = await supabase
      .from('schema_versions')
      .select('version')
      .eq('version', '1.0.0')
      .single();

    if (existingSchema) {
      console.log('📋 Schema version 1.0.0 already exists');
      return jsonResponse({ 
        message: 'Schema version 1.0.0 already exists',
        version: '1.0.0'
      });
    }

    // Insert the schema
    const { error: insertError } = await supabase
      .from('schema_versions')
      .insert({
        version: '1.0.0',
        schema: defaultSchema,
        is_active: true
      });

    if (insertError) {
      console.error('❌ Failed to insert schema:', insertError);
      return jsonResponse({ error: 'Failed to insert schema' }, 500);
    }

    console.log('✅ Schema version 1.0.0 seeded successfully');
    return jsonResponse({
      message: 'Schema version 1.0.0 seeded successfully',
      version: '1.0.0'
    });

  } catch (error: any) {
    console.error('💥 Schema Seed Error:', error);
    return jsonResponse({
      error: 'Internal server error',
      details: error.message
    }, 500);
  }
});
