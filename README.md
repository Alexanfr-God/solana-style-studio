
# WCC Wallet Customization Studio

Studio for customizing web3 wallet themes through AI-powered chat interface.

## Features

- 🎨 AI-powered theme customization via chat
- 🔧 JSON Patch-based theme modifications
- 🛡️ Schema validation and RLS security
- 📊 Built-in telemetry and analytics
- 🚀 Edge Functions for serverless processing

## Telemetry

### AI Request Analytics

Basic telemetry is collected for `llm-patch` requests when `AI_LOGS_ENABLED=true`. This helps monitor system performance and usage patterns.

#### Collected Metrics

- `prompt_len`: Length of user prompt in characters (text content is never stored)
- `patch_len`: Number of operations in generated JSON Patch
- `duration_ms`: Total processing time in milliseconds  
- `status`: Request outcome ('ok' or 'error')
- `patch_preview`: First 2000 characters of generated patch (for debugging)

#### Sample Analytics Queries

**Average performance and success rate (last 24 hours):**
```sql
SELECT
  count(*) as total_requests,
  avg(duration_ms)::int as avg_duration_ms,
  sum((status='ok')::int)::int as successful_requests,
  round(100.0 * sum((status='ok')::int) / count(*), 2) as success_rate_pct
FROM ai_requests
WHERE request_type='llm-patch' 
  AND created_at > now() - interval '24 hours';
```

**Top pages by response time:**
```sql
SELECT 
  page_id,
  count(*) as request_count,
  avg(duration_ms)::int as avg_duration_ms,
  max(duration_ms) as max_duration_ms
FROM ai_requests
WHERE request_type='llm-patch' 
  AND status='ok'
  AND created_at > now() - interval '7 days'
GROUP BY page_id
ORDER BY avg_duration_ms DESC
LIMIT 10;
```

**Error analysis:**
```sql
SELECT 
  error_message,
  count(*) as error_count,
  avg(duration_ms)::int as avg_duration_ms
FROM ai_requests
WHERE request_type='llm-patch' 
  AND status='error'
  AND created_at > now() - interval '7 days'
GROUP BY error_message
ORDER BY error_count DESC;
```

**User activity patterns:**
```sql
SELECT 
  date_trunc('hour', created_at) as hour,
  count(*) as requests_per_hour,
  avg(duration_ms)::int as avg_duration_ms
FROM ai_requests
WHERE request_type='llm-patch'
  AND created_at > now() - interval '7 days'
GROUP BY date_trunc('hour', created_at)
ORDER BY hour DESC
LIMIT 24;
```

### Privacy & Security

- User prompts are **never** stored in full, only their character length
- Patch previews are truncated to 2000 characters maximum
- All telemetry respects RLS policies - users only see their own data
- Telemetry collection can be disabled by setting `AI_LOGS_ENABLED=false`

## Development

Set up environment variables:

```bash
# Required for AI functionality
OPENAI_API_KEY=your_openai_key

# Optional telemetry (default: false)
AI_LOGS_ENABLED=true
```

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Supabase Edge Functions + PostgreSQL
- **AI**: OpenAI GPT-4 for theme generation
- **Schema**: JSON Schema validation for theme consistency
