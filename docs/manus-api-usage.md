# Manus AI Research Integration - API Usage Guide

## Quick Start

### 1. Check Integration Status (No Auth Required)

```bash
curl http://localhost:6405/api/research/status
```

Response:
```json
{
  "manusEnabled": false,
  "message": "Manus AI integration is disabled. Add MANUS_API_KEY to .env to enable.",
  "apiUrl": "https://api.manus.ai"
}
```

### 2. Request Research for a Stock

**Endpoint:** `POST /api/research/:ticker/request`

**Authentication:** Required (JWT Bearer token)

```bash
curl -X POST http://localhost:6405/api/research/AAPL/request \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "requestType": "comprehensive",
    "parameters": {
      "depth": "detailed",
      "includeCompetitors": true
    }
  }'
```

Response:
```json
{
  "message": "Research request created (mock mode - add MANUS_API_KEY to enable real integration)",
  "request": {
    "id": "manus_1768097432183_oyouhllyf",
    "ticker": "AAPL",
    "status": "completed",
    "requestType": "comprehensive",
    "createdAt": "2026-01-11T02:10:32.183Z"
  },
  "manusEnabled": false
}
```

**Note:** In mock mode (no MANUS_API_KEY), research completes immediately. With real API key, it will go through: `pending` → `processing` → `completed`.

### 3. Check Request Status and Get Results

**Endpoint:** `GET /api/research/:ticker/status/:requestId`

```bash
curl http://localhost:6405/api/research/AAPL/status/manus_1768097432183_oyouhllyf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response includes both request status and result (if completed):
```json
{
  "request": {
    "id": "manus_1768097432183_oyouhllyf",
    "ticker": "AAPL",
    "status": "completed",
    "requestType": "comprehensive",
    "createdAt": "2026-01-11T02:10:32.183Z",
    "completedAt": "2026-01-11T02:10:32.184Z"
  },
  "result": {
    "ticker": "AAPL",
    "summary": "This is a comprehensive analysis of AAPL. The company shows strong fundamentals with solid revenue growth...",
    "keyFindings": [
      "AAPL has demonstrated consistent revenue growth of 15-20% annually over the past 3 years",
      "Operating margins have improved from 12% to 18%...",
      "..."
    ],
    "financialData": {
      "revenue": "$2.5B",
      "revenueGrowth": "18.5%",
      "netIncome": "$450M",
      "netMargin": "18%",
      "eps": "$3.25",
      "peRatio": 24.5,
      "debtToEquity": 0.35
    },
    "sentiment": {
      "overall": "positive",
      "score": 0.72
    },
    "sources": [
      {
        "title": "AAPL Q4 Earnings Report",
        "url": "https://example.com/aapl-earnings",
        "publishedAt": "2026-01-04T02:10:32.183Z"
      }
    ],
    "generatedFiles": [
      {
        "filename": "AAPL_research_report.pdf",
        "fileType": "pdf",
        "url": "/api/research/placeholder/download/report.pdf"
      },
      {
        "filename": "AAPL_financial_data.csv",
        "fileType": "csv",
        "url": "/api/research/placeholder/download/data.csv"
      }
    ],
    "completedAt": "2026-01-11T02:10:32.184Z"
  },
  "manusEnabled": false
}
```

### 4. Get All Research for a Ticker

**Endpoint:** `GET /api/research/:ticker`

```bash
curl http://localhost:6405/api/research/AAPL \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Returns all completed research results for the ticker, sorted by most recent first.

### 5. Get User's Research History

**Endpoint:** `GET /api/research/user/me`

```bash
curl http://localhost:6405/api/research/user/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Response:
```json
{
  "userId": 2,
  "count": 2,
  "requests": [
    {
      "id": "manus_1768097449567_ildi4qg2n",
      "ticker": "TSLA",
      "status": "completed",
      "requestType": "comprehensive",
      "createdAt": "2026-01-11T02:10:49.567Z",
      "completedAt": "2026-01-11T02:10:49.567Z"
    },
    {
      "id": "manus_1768097432183_oyouhllyf",
      "ticker": "AAPL",
      "status": "completed",
      "requestType": "comprehensive",
      "createdAt": "2026-01-11T02:10:32.183Z",
      "completedAt": "2026-01-11T02:10:32.184Z"
    }
  ],
  "manusEnabled": false
}
```

### 6. Get Specific Research Result

**Endpoint:** `GET /api/research/result/:requestId`

```bash
curl http://localhost:6405/api/research/result/manus_1768097432183_oyouhllyf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Returns only the result data (without request metadata).

### 7. Cancel a Research Request

**Endpoint:** `POST /api/research/:ticker/cancel/:requestId`

```bash
curl -X POST http://localhost:6405/api/research/AAPL/cancel/manus_1768097432183_oyouhllyf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Note:** Can only cancel requests that are `pending` or `processing` (not `completed` or `failed`).

## Request Types

The `requestType` parameter in research requests can be:

- `comprehensive` (default) - Full analysis with all data
- `fundamental` - Focus on financial fundamentals
- `technical` - Technical analysis focus
- `sentiment` - Market sentiment analysis
- `competitive` - Competitive positioning

(Mock mode returns same data for all types; real API would differentiate)

## Response Data Structure

### Research Result Fields

| Field | Type | Description |
|-------|------|-------------|
| `requestId` | string | Unique request identifier |
| `ticker` | string | Stock ticker symbol |
| `summary` | string | Executive summary of research |
| `keyFindings` | string[] | Array of key findings/insights |
| `financialData` | object | Financial metrics and ratios |
| `sentiment` | object | Market sentiment analysis |
| `sources` | array | News articles and references |
| `generatedFiles` | array | PDF reports, CSV data files |
| `completedAt` | ISO date | When research was completed |

### Financial Data Fields

- `revenue` - Total revenue
- `revenueGrowth` - Year-over-year revenue growth %
- `netIncome` - Net income
- `netMargin` - Net profit margin %
- `eps` - Earnings per share
- `peRatio` - Price-to-earnings ratio
- `debtToEquity` - Debt-to-equity ratio

### Sentiment Structure

- `overall` - "positive", "negative", or "neutral"
- `score` - Numeric sentiment score (0-1, higher = more positive)

## Frontend Integration Example

```typescript
// research-api.ts
import { apiClient } from './api-client';

export interface ResearchRequest {
  id: string;
  ticker: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestType: string;
  createdAt: string;
  completedAt?: string;
}

export interface ResearchResult {
  requestId: string;
  ticker: string;
  summary: string;
  keyFindings: string[];
  financialData: {
    revenue: string;
    revenueGrowth: string;
    netIncome: string;
    netMargin: string;
    eps: string;
    peRatio: number;
    debtToEquity: number;
  };
  sentiment: {
    overall: 'positive' | 'negative' | 'neutral';
    score: number;
  };
  sources: Array<{
    title: string;
    url: string;
    publishedAt: string;
  }>;
  generatedFiles: Array<{
    filename: string;
    fileType: string;
    url: string;
  }>;
  completedAt: string;
}

// Request research
export async function requestResearch(
  ticker: string,
  requestType = 'comprehensive'
): Promise<ResearchRequest> {
  const response = await apiClient.post(`/research/${ticker}/request`, {
    requestType,
  });
  return response.data.request;
}

// Check status
export async function getResearchStatus(
  ticker: string,
  requestId: string
): Promise<{ request: ResearchRequest; result: ResearchResult | null }> {
  const response = await apiClient.get(`/research/${ticker}/status/${requestId}`);
  return response.data;
}

// Get all research for ticker
export async function getResearchByTicker(
  ticker: string
): Promise<ResearchResult[]> {
  const response = await apiClient.get(`/research/${ticker}`);
  return response.data.results;
}

// Get user's research history
export async function getMyResearch(): Promise<ResearchRequest[]> {
  const response = await apiClient.get('/research/user/me');
  return response.data.requests;
}

// Check if Manus is enabled
export async function checkManusStatus(): Promise<{
  manusEnabled: boolean;
  message: string;
}> {
  const response = await apiClient.get('/research/status');
  return response.data;
}
```

## React Component Example

```tsx
// ResearchPanel.tsx
import { useState } from 'react';
import { requestResearch, getResearchStatus } from './research-api';

export function ResearchPanel({ ticker }: { ticker: string }) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');

  const handleRequestResearch = async () => {
    setIsRequesting(true);
    try {
      const request = await requestResearch(ticker, 'comprehensive');
      setRequestId(request.id);
      setStatus(request.status);
      
      // Poll for completion if not already completed
      if (request.status !== 'completed') {
        pollStatus(ticker, request.id);
      }
    } catch (error) {
      console.error('Failed to request research:', error);
    } finally {
      setIsRequesting(false);
    }
  };

  const pollStatus = async (ticker: string, requestId: string) => {
    const interval = setInterval(async () => {
      try {
        const { request, result } = await getResearchStatus(ticker, requestId);
        setStatus(request.status);
        
        if (request.status === 'completed' || request.status === 'failed') {
          clearInterval(interval);
          if (result) {
            // Handle completed research
            console.log('Research completed:', result);
          }
        }
      } catch (error) {
        clearInterval(interval);
        console.error('Failed to poll status:', error);
      }
    }, 2000); // Poll every 2 seconds
  };

  return (
    <div>
      <button 
        onClick={handleRequestResearch}
        disabled={isRequesting || status === 'processing'}
      >
        {isRequesting ? 'Requesting...' : 'Request Research'}
      </button>
      
      {status !== 'idle' && (
        <div>Status: {status}</div>
      )}
    </div>
  );
}
```

## Testing with cURL

See test commands in the examples above. Make sure to:

1. Register/login first to get JWT token
2. Replace `YOUR_JWT_TOKEN` with actual token
3. Use correct port (default 6405)

## Enabling Real Manus Integration

1. Add to `.env`:
   ```
   MANUS_API_KEY=your-actual-api-key
   MANUS_API_URL=https://api.manus.ai  # optional
   ```

2. Restart server

3. Verify status endpoint shows `manusEnabled: true`

4. All endpoints will now use real Manus API instead of mock data

## Notes

- All endpoints except `/status` require authentication
- Request IDs are unique and persistent
- Mock mode generates consistent, realistic data
- Results are stored in memory (consider database for production)
- Generated files in mock mode are placeholders
