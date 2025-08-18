
# Export Theme API

## Overview

The `export_theme` Edge Function provides two ways to export wallet themes:

1. **GET**: Direct JSON response with `current_theme` data
2. **POST**: Creates downloadable file with metadata (existing behavior)

## Authentication

All requests require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## GET Request - Direct JSON Export

Returns the `current_theme` JSON directly from the database.

### Endpoint
```
GET /functions/v1/export_theme?themeId=<uuid>
```

### Parameters
- `themeId` (required): UUID of the theme to export

### Response

**Success (200)**
```json
{
  "colors": { "primary": "#9945FF", ... },
  "fonts": { "primary": "Inter", ... },
  "components": { ... },
  "meta": { "walletTarget": "phantom" }
}
```

**Error Responses**
- `400`: Invalid or missing themeId
- `401`: Missing authorization header
- `403`: User not owner of the theme
- `404`: Theme not found
- `500`: Internal server error

### Example Usage

```bash
# cURL example
curl -X GET "https://opxordptvpvzmhakvdde.supabase.co/functions/v1/export_theme?themeId=123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer eyJ..."

# JavaScript example
const response = await fetch(`${supabaseUrl}/functions/v1/export_theme?themeId=${themeId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
const themeData = await response.json();
```

## POST Request - File Export (Existing)

Creates a downloadable file with theme metadata and returns a signed URL.

### Endpoint
```
POST /functions/v1/export_theme
```

### Request Body
```json
{
  "themeId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### Response
```json
{
  "url": "https://supabase.co/storage/.../signed-url",
  "themeId": "123e4567-e89b-12d3-a456-426614174000",
  "walletTarget": "phantom"
}
```

### Example Usage

```bash
# cURL example
curl -X POST "https://opxordptvpvzmhakvdde.supabase.co/functions/v1/export_theme" \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{"themeId":"123e4567-e89b-12d3-a456-426614174000"}'
```

## Testing

Use the provided `test-export-theme.html` file for smoke testing:

1. Open `test-export-theme.html` in a browser
2. Enter your JWT token and theme ID
3. Run all tests to verify functionality

### Manual Testing Steps

1. **No Auth Test**: `GET` without Authorization header → 401
2. **Invalid UUID Test**: `GET` with malformed themeId → 400  
3. **Not Found Test**: `GET` with non-existent themeId → 404
4. **Valid GET Test**: `GET` with valid params → 200 + JSON
5. **Valid POST Test**: `POST` with valid body → 200 + URL
6. **CORS Test**: `OPTIONS` request → 200 + CORS headers

### Database Verification

To verify the exported JSON matches the database:

```sql
SELECT current_theme FROM themes WHERE id = '123e4567-e89b-12d3-a456-426614174000';
```

The response from GET request should exactly match the `current_theme` field.

## Security

- **RLS Enabled**: Users can only access themes from their own projects
- **UUID Validation**: ThemeId format is validated before processing
- **CORS Enabled**: Cross-origin requests are properly handled
- **JWT Required**: All requests require valid authentication

## Logging

All requests are logged with:
- `themeId`: The requested theme ID
- `duration_ms`: Request processing time  
- `status`: Final HTTP status code

Example log: `[export_theme] themeId=123e4567-e89b-12d3-a456-426614174000, duration_ms=45, status=200`
