# Phase 6 & 7: File Upload and Articles API

## Quick Start

### Environment Setup

1. Copy the example environment file (if it exists) or create `.env` with the following:

```env
# Required for all features
PORT=3001
NODE_ENV=development
SESSION_SECRET=your-session-secret-here
JWT_SECRET=your-jwt-secret-here
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Required for file upload (Phase 6)
SUPABASE_URL=your-supabase-project-url
SUPABASE_KEY=your-supabase-anon-key
```

### Supabase Setup (for File Upload)

1. Go to https://supabase.com and create an account
2. Create a new project
3. Navigate to **Storage** in the left sidebar
4. Click **New bucket**
5. Name it `research-files`
6. Configure permissions (recommended: authenticated users can upload, public can read)
7. Go to **Settings** > **API**
8. Copy the **Project URL** and **anon/public key**
9. Add them to your `.env` file

### Running the Server

```bash
npm run dev
```

The server will start on http://localhost:3001

---

## File Upload API (Phase 6)

### Upload a File

```bash
POST /api/files/:ticker/upload
```

**Authentication:** Required (JWT Bearer token)

**Body:** multipart/form-data
- `file` - The file to upload
- `source` - Optional: 'manual' or 'manus' (default: 'manual')

**Supported File Types:**
- PDF (.pdf)
- Word Documents (.doc, .docx)
- Excel/CSV (.xls, .xlsx, .csv)
- Text files (.txt, .md)
- Images (.png, .jpg, .jpeg)

**Max File Size:** 50MB

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@report.pdf" \
  -F "source=manual" \
  http://localhost:3001/api/files/AAPL/upload
```

**Response:**
```json
{
  "message": "File uploaded successfully",
  "file": {
    "id": 1,
    "ticker": "AAPL",
    "filename": "report.pdf",
    "fileType": "pdf",
    "fileSize": 1234567,
    "source": "manual",
    "uploadedAt": "2026-01-10T12:00:00.000Z"
  }
}
```

### List Files for a Ticker

```bash
GET /api/files/:ticker
```

**Authentication:** Not required

**Example:**
```bash
curl http://localhost:3001/api/files/AAPL
```

**Response:**
```json
{
  "ticker": "AAPL",
  "count": 2,
  "files": [
    {
      "id": 1,
      "filename": "report.pdf",
      "fileType": "pdf",
      "fileSize": 1234567,
      "source": "manual",
      "uploadedAt": "2026-01-10T12:00:00.000Z",
      "user": {
        "id": 1,
        "username": "john",
        "displayName": "John Doe"
      }
    }
  ]
}
```

### Get Download URL

```bash
GET /api/files/:id/download?redirect=true
```

**Authentication:** Not required

**Query Parameters:**
- `redirect` - Optional: 'true' to redirect to download URL, false to return JSON (default: false)

**Example:**
```bash
curl http://localhost:3001/api/files/1/download
```

**Response:**
```json
{
  "fileId": 1,
  "filename": "report.pdf",
  "downloadUrl": "https://your-project.supabase.co/storage/v1/object/sign/...",
  "expiresIn": 3600
}
```

### Delete a File

```bash
DELETE /api/files/:id
```

**Authentication:** Required (JWT Bearer token)
**Authorization:** Must be the file uploader

**Example:**
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/files/1
```

**Response:**
```json
{
  "message": "File deleted successfully",
  "fileId": 1
}
```

### Get My Files

```bash
GET /api/files/user/me
```

**Authentication:** Required (JWT Bearer token)

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/files/user/me
```

**Response:**
```json
{
  "userId": 1,
  "count": 5,
  "files": [...]
}
```

### Get Storage Usage

```bash
GET /api/files/user/storage
```

**Authentication:** Required (JWT Bearer token)

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/files/user/storage
```

**Response:**
```json
{
  "userId": 1,
  "totalBytes": 12345678,
  "totalMB": 11.77,
  "maxMB": 50
}
```

---

## Articles/Links API (Phase 7)

### Create an Article

```bash
POST /api/articles/:ticker
```

**Authentication:** Required (JWT Bearer token)

**Body:** application/json
```json
{
  "title": "Apple Reports Strong Q4 Earnings",
  "url": "https://example.com/article",
  "sourceName": "TechNews",
  "publishedAt": "2026-01-10T10:00:00.000Z"
}
```

**Required Fields:**
- `title` - Article title
- `url` - Article URL (must be valid URL)

**Optional Fields:**
- `sourceName` - Publication name
- `publishedAt` - Original publication date

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Apple Q4 Earnings","url":"https://example.com/article"}' \
  http://localhost:3001/api/articles/AAPL
```

**Response:**
```json
{
  "message": "Article created successfully",
  "article": {
    "id": 1,
    "ticker": "AAPL",
    "title": "Apple Q4 Earnings",
    "url": "https://example.com/article",
    "sourceName": null,
    "publishedAt": null,
    "addedAt": "2026-01-10T12:00:00.000Z"
  }
}
```

### List Articles for a Ticker

```bash
GET /api/articles/:ticker
```

**Authentication:** Not required

**Example:**
```bash
curl http://localhost:3001/api/articles/AAPL
```

**Response:**
```json
{
  "ticker": "AAPL",
  "count": 3,
  "articles": [
    {
      "id": 1,
      "title": "Apple Q4 Earnings",
      "url": "https://example.com/article",
      "sourceName": "TechNews",
      "publishedAt": "2026-01-10T10:00:00.000Z",
      "addedAt": "2026-01-10T12:00:00.000Z",
      "user": {
        "id": 1,
        "username": "john",
        "displayName": "John Doe"
      }
    }
  ]
}
```

### Get Article by ID

```bash
GET /api/articles/id/:id
```

**Authentication:** Not required

**Example:**
```bash
curl http://localhost:3001/api/articles/id/1
```

**Response:**
```json
{
  "article": {
    "id": 1,
    "ticker": "AAPL",
    "title": "Apple Q4 Earnings",
    "url": "https://example.com/article",
    "sourceName": "TechNews",
    "publishedAt": "2026-01-10T10:00:00.000Z",
    "addedAt": "2026-01-10T12:00:00.000Z",
    "user": {
      "id": 1,
      "username": "john",
      "displayName": "John Doe"
    }
  }
}
```

### Update an Article

```bash
PUT /api/articles/:id
```

**Authentication:** Required (JWT Bearer token)
**Authorization:** Must be the article creator

**Body:** application/json (all fields optional)
```json
{
  "title": "Updated Title",
  "url": "https://example.com/new-url",
  "sourceName": "New Source",
  "publishedAt": "2026-01-10T10:00:00.000Z"
}
```

**Example:**
```bash
curl -X PUT \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Apple Article"}' \
  http://localhost:3001/api/articles/1
```

**Response:**
```json
{
  "message": "Article updated successfully",
  "article": {...}
}
```

### Delete an Article

```bash
DELETE /api/articles/:id
```

**Authentication:** Required (JWT Bearer token)
**Authorization:** Must be the article creator

**Example:**
```bash
curl -X DELETE \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/articles/1
```

**Response:**
```json
{
  "message": "Article deleted successfully",
  "articleId": 1
}
```

### Get My Articles

```bash
GET /api/articles/user/me
```

**Authentication:** Required (JWT Bearer token)

**Example:**
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:3001/api/articles/user/me
```

**Response:**
```json
{
  "userId": 1,
  "count": 10,
  "articles": [...]
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**HTTP Status Codes:**
- `400` - Bad Request (invalid input)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error
- `503` - Service Unavailable (Supabase not configured)

---

## Security Features

### File Upload
- File type whitelist enforcement
- File size limits (50MB max)
- Ownership verification for delete operations
- Time-limited download URLs (1 hour expiry)
- Unique file paths to prevent collisions

### Articles
- URL format validation
- Ownership verification for edit/delete
- SQL injection protection (Sequelize ORM)
- Input sanitization (trim whitespace)

---

## Testing Without Supabase

If Supabase is not configured, file upload endpoints will return:

```json
{
  "error": "File upload service is not configured. Please contact administrator."
}
```

All other endpoints (articles) will work normally without Supabase.

---

## Frontend Integration Notes

### File Upload Component
```typescript
// Example using fetch API
const uploadFile = async (ticker: string, file: File, token: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('source', 'manual');

  const response = await fetch(`/api/files/${ticker}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  return await response.json();
};
```

### Article Component
```typescript
// Example using fetch API
const createArticle = async (ticker: string, article: Article, token: string) => {
  const response = await fetch(`/api/articles/${ticker}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(article)
  });

  return await response.json();
};
```

---

## Next Steps

1. Set up Supabase and add credentials to `.env`
2. Test file upload/download functionality
3. Implement frontend components (Phase 9-11)
4. Add Manus AI integration (Phase 8)
