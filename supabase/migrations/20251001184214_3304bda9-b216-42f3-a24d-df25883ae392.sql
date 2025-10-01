-- Populate schema_versions with default schema
INSERT INTO schema_versions (version, schema)
VALUES (
  '1.0.0',
  '{
    "version": "1.0.0",
    "name": "Wallet Theme Schema",
    "description": "Default theme schema for wallet customization",
    "properties": {
      "name": { "type": "string" },
      "version": { "type": "string" },
      "globalSearchInput": { "type": "object" },
      "lockLayer": { "type": "object" },
      "avatarHeader": { "type": "object" },
      "sidebarLayer": { "type": "object" },
      "homeLayer": { "type": "object" },
      "receiveLayer": { "type": "object" },
      "sendLayer": { "type": "object" },
      "appsLayer": { "type": "object" },
      "buyLayer": { "type": "object" },
      "swapLayer": { "type": "object" },
      "historyLayer": { "type": "object" },
      "searchLayer": { "type": "object" },
      "assetCard": { "type": "object" },
      "tokenCost": { "type": "object" },
      "tokenCardTitle": { "type": "object" },
      "tokenCardDescription": { "type": "object" },
      "inputs": { "type": "object" },
      "global": { "type": "object" }
    }
  }'::jsonb
)
ON CONFLICT (version) DO NOTHING;