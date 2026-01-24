/**
 * Manus AI Service - Powered by OpenAI
 * 
 * This service uses OpenAI (GPT-4o) to generate investment research analysis
 * matching the dashboard's expected format.
 */

import OpenAI from 'openai';

export interface ResearchRequest {
  id: string;
  ticker: string;
  userId: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestType: string;
  parameters?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export interface ResearchResult {
  requestId: string;
  ticker: string;
  summary: string;
  keyFindings: string[];
  priceScenarios?: {
    bull: { price: number; description: string; upsidePercent: number };
    bear: { price: number; description: string; downsidePercent: number };
    base: { price: number; description: string };
  };
  catalysts?: Array<{ name: string; impact: 'high' | 'medium' | 'low'; type: 'positive' | 'negative' | 'neutral' }>;
  risks?: Array<{ name: string; impact: 'high' | 'medium' | 'low'; type: 'negative' }>;
  financialData?: Record<string, any>;
  sentiment?: {
    overall: 'positive' | 'negative' | 'neutral';
    score: number;
  };
  sources: Array<{
    title: string;
    url: string;
    publishedAt?: Date;
  }>;
  generatedFiles?: Array<{
    filename: string;
    fileType: string;
    url: string;
  }>;
  completedAt: Date;
  userNotes?: string;
}

export interface PortfolioAnalysisResult {
  summary: string;
  diversificationScore: number; // 0-10
  diversificationAnalysis: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{
    type: 'buy' | 'sell' | 'hold';
    ticker?: string; // Ticker to buy/sell if specific
    sector?: string; // Sector to look into
    reasoning: string;
  }>;
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  analyzedAt: Date;
}

export interface NewsAnalysisResult {
  summary: string;
  affectedStocks: Array<{
    ticker: string;
    impact: 'positive' | 'negative' | 'neutral';
    reasoning: string;
  }>;
  generalMarketSentiment?: 'bullish' | 'bearish' | 'neutral';
  confidenceScore: number; // 1-10
}

export class ManusService {
  private openai: OpenAI | null = null;
  private isEnabled: boolean = false;

  // In-memory storage (replace with DB in production)
  private requestsCache: Map<string, ResearchRequest> = new Map();
  private resultsCache: Map<string, ResearchResult> = new Map();

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.isEnabled = true;
      console.log('✅ OpenAI integration enabled for Research Analysis.');
    } else {
      console.log('⚠️  OpenAI API key missing. Research service will use mock data.');
    }
  }

  isManusEnabled(): boolean {
    return this.isEnabled;
  }

  async requestResearch(
    ticker: string,
    userId: number,
    requestType: string = 'comprehensive',
    parameters?: Record<string, any>,
    currentPrice?: number
  ): Promise<ResearchRequest> {
    const requestId = this.generateRequestId();

    const request: ResearchRequest = {
      id: requestId,
      ticker: ticker.toUpperCase(),
      userId,
      status: 'pending',
      requestType,
      parameters,
      // Store currentPrice in parameters if needed, or just pass it through to processing
      ...(currentPrice ? { currentPrice } : {}),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.requestsCache.set(requestId, request);

    if (this.isEnabled && this.openai) {
      // Process asynchronously
      this.processOpenAIRequest(requestId, ticker, currentPrice);
    } else {
      // Mock mode
      this.simulateResearchProcessing(requestId);
    }

    return request;
  }

  async getRequestStatus(requestId: string): Promise<ResearchRequest | null> {
    return this.requestsCache.get(requestId) || null;
  }

  async getResearchResult(requestId: string): Promise<ResearchResult | null> {
    return this.resultsCache.get(requestId) || null;
  }

  async getResearchByTicker(ticker: string): Promise<ResearchResult[]> {
    const results: ResearchResult[] = [];
    for (const result of this.resultsCache.values()) {
      if (result.ticker.toUpperCase() === ticker.toUpperCase()) {
        results.push(result);
      }
    }
    return results.sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());
  }

  async getResearchByUser(userId: number): Promise<ResearchRequest[]> {
    const requests: ResearchRequest[] = [];
    for (const request of this.requestsCache.values()) {
      if (request.userId === userId) {
        requests.push(request);
      }
    }
    return requests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async cancelRequest(requestId: string, userId: number): Promise<boolean> {
    const request = this.requestsCache.get(requestId);
    if (!request) throw new Error('Request not found');
    if (request.userId !== userId) throw new Error('Permission denied');

    // Simplistic cancellation (just marks failed if not done)
    if (request.status !== 'completed' && request.status !== 'failed') {
      request.status = 'failed';
      request.errorMessage = 'Cancelled by user';
      request.updatedAt = new Date();
      this.requestsCache.set(requestId, request);
    }
    return true;
  }

  async updateResearchResult(requestId: string, updates: Partial<ResearchResult>): Promise<ResearchResult> {
    const result = this.resultsCache.get(requestId);
    if (!result) throw new Error('Result not found');

    const updated = { ...result, ...updates };
    this.resultsCache.set(requestId, updated);
    return updated;
  }

  async analyzePortfolio(holdings: Array<{ ticker: string; shares: number; avgPrice: number; currentPrice: number }>): Promise<PortfolioAnalysisResult> {
    if (!this.isEnabled || !this.openai) {
      // Mock result
      return {
        summary: "Mock Portfolio Analysis: OpenAI key missing. Enable integration for real insights.",
        diversificationScore: 5,
        diversificationAnalysis: "This is a mock analysis. Your portfolio concentration cannot be calculated without the AI service.",
        strengths: ["Mock Strength 1", "Mock Strength 2"],
        weaknesses: ["Mock Weakness 1", "Mock Weakness 2"],
        recommendations: [
          { type: 'buy', sector: 'Technology', reasoning: 'Mock recommendation to buy tech.' },
          { type: 'sell', ticker: 'MOCK', reasoning: 'Mock recommendation to sell.' }
        ],
        overallSentiment: 'neutral',
        analyzedAt: new Date()
      };
    }

    try {
      const holdingsSummary = holdings.map(h =>
        `${h.ticker}: ${h.shares} shares @ $${h.avgPrice} (Current: $${h.currentPrice})`
      ).join('\n');

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert portfolio manager. Analyze the following portfolio holdings.
            Return a valid JSON object matching this schema exactly:
            {
              "summary": "Executive summary of the portfolio health and strategy (max 500 chars)",
              "diversificationScore": number (0-10, 10 being perfectly diversified),
              "diversificationAnalysis": "Brief analysis of sector/asset exposure",
              "strengths": ["Strength 1", "Strength 2", ...],
              "weaknesses": ["Weakness 1", "Weakness 2", ...],
              "recommendations": [
                { "type": "buy"|"sell"|"hold", "ticker": "Optional Ticker", "sector": "Optional Sector", "reasoning": "Why?" }
              ],
              "overallSentiment": "bullish"|"bearish"|"neutral"
            }`
          },
          {
            role: 'user',
            content: `Analyze this portfolio:\n${holdingsSummary}`
          }
        ],
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error('No content received from OpenAI');

      const data = JSON.parse(content);

      return {
        summary: data.summary,
        diversificationScore: data.diversificationScore,
        diversificationAnalysis: data.diversificationAnalysis,
        strengths: data.strengths,
        weaknesses: data.weaknesses,
        recommendations: data.recommendations,
        overallSentiment: data.overallSentiment,
        analyzedAt: new Date()
      };

    } catch (error: any) {
      console.error('Portfolio analysis error:', error);
      throw new Error(`Failed to analyze portfolio: ${error.message}`);
    }

  }

  async analyzeNews(title: string, content: string | null, publisher: string): Promise<NewsAnalysisResult> {
    if (!this.isEnabled || !this.openai) {
      // Mock result
      // Try to guess based on title keywords if possible, or just return random mock
      let mockTickers = [{ ticker: "SPY", impact: 'neutral', reasoning: "Market wide news" }];

      // Simple keyword matching for mock mode
      if (title.includes("Apple")) mockTickers = [{ ticker: "AAPL", impact: 'positive', reasoning: "Mentioned in title" }];
      if (title.includes("Tesla")) mockTickers = [{ ticker: "TSLA", impact: 'negative', reasoning: "Mentioned in title" }];

      return {
        summary: `Mock Analysis: ${title}. Only the title was analyzed as AI service is invalid.`,
        affectedStocks: mockTickers as any,
        generalMarketSentiment: 'neutral',
        confidenceScore: 5
      };
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert financial news analyst. Analyze the following news article.
            Your goal is to:
            1. Provide a concise 1-2 sentence summary of the core news.
            2. Identify what Publicly Traded Companies (Tickers) are most affected by this news.
            3. Determine the impact (Positive/Negative/Neutral) and provide a brief reasoning.

            Return a valid JSON object matching this schema exactly:
            {
              "summary": "1-2 sentence summary",
              "affectedStocks": [
                { "ticker": "TICKER", "impact": "positive"|"negative"|"neutral", "reasoning": "Why?" }
              ],
              "generalMarketSentiment": "bullish"|"bearish"|"neutral",
              "confidenceScore": number (1-10)
            }
            Do not include Markdown formatting in the response.`
          },
          {
            role: 'user',
            content: `Analyze this news:
            Title: ${title}
            Publisher: ${publisher}
            Content: ${content ? content.substring(0, 5000) : "Content not available, analyze based on title only."}`
          }
        ],
        response_format: { type: 'json_object' }
      });

      const responseContent = completion.choices[0].message.content;
      if (!responseContent) throw new Error('No content received from OpenAI');

      const data = JSON.parse(responseContent);

      return {
        summary: data.summary,
        affectedStocks: data.affectedStocks,
        generalMarketSentiment: data.generalMarketSentiment,
        confidenceScore: data.confidenceScore
      };

    } catch (error: any) {
      console.error('News analysis error:', error);
      throw new Error(`Failed to analyze news: ${error.message}`);
    }
  }

  // ========== PRIVATE METHODS ==========

  private generateRequestId(): string {
    return `res_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async processOpenAIRequest(requestId: string, ticker: string, currentPrice?: number) {
    const request = this.requestsCache.get(requestId);
    if (!request) return;

    try {
      request.status = 'processing';
      request.updatedAt = new Date();
      this.requestsCache.set(requestId, request);

      const completion = await this.openai!.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert financial analyst. Analyze the provided stock ticker.
            Return a valid JSON object matching this schema exactly:
            {
              "summary": "Executive summary of the analysis (max 300 chars)",
              "keyFindings": ["Finding 1", "Finding 2", "Finding 3", "Finding 4"],
              "priceScenarios": {
                "bull": { "price": number, "description": "rationale", "upsidePercent": number },
                "bear": { "price": number, "description": "rationale", "downsidePercent": number },
                "base": { "price": number, "description": "rationale" }
              },
              "catalysts": [{ "name": "Event Name", "impact": "high"|"medium"|"low", "type": "positive"|"negative"|"neutral" }],
              "risks": [{ "name": "Risk Name", "impact": "high"|"medium"|"low", "type": "negative" }],
              "sentiment": { "overall": "positive"|"negative"|"neutral", "score": number (0-1) },
              "financialData": {
                 "revenue": "string with units", "revenueGrowth": "string %", "netIncome": "string units", 
                 "netMargin": "string %", "eps": "string $", "peRatio": number, "debtToEquity": number
              }
            }
            Ensure all numbers are realistic based on current market data if possible, or reasonable estimates.`
          },
          {
            role: 'user',
            content: `Analyze stock ticker: ${ticker}. ${currentPrice ? `The current price is $${currentPrice}. Ensure price targets (bull/bear/base) are consistent with this current price.` : ''}`
          }
        ],
        response_format: { type: 'json_object' }
      });

      const content = completion.choices[0].message.content;
      if (!content) throw new Error('No content received from OpenAI');

      const data = JSON.parse(content);

      const result: ResearchResult = {
        requestId,
        ticker,
        summary: data.summary,
        keyFindings: data.keyFindings,
        priceScenarios: data.priceScenarios,
        catalysts: data.catalysts,
        risks: data.risks,
        financialData: data.financialData,
        sentiment: data.sentiment,
        sources: [
          { title: "OpenAI Market Analysis", url: "#", publishedAt: new Date() }
        ],
        generatedFiles: [],
        completedAt: new Date()
      };

      this.resultsCache.set(requestId, result);

      request.status = 'completed';
      request.completedAt = new Date();
      request.updatedAt = new Date();
      this.requestsCache.set(requestId, request);

    } catch (error: any) {
      console.error('OpenAI processing error:', error);
      request.status = 'failed';
      request.errorMessage = error.message;
      request.updatedAt = new Date();
      this.requestsCache.set(requestId, request);
    }
  }

  private simulateResearchProcessing(requestId: string) {
    // Keep existing mock logic if needed, or simplify
    const request = this.requestsCache.get(requestId);
    if (!request) return;

    setTimeout(() => {
      // (Mock generation logic - reuse from previous version if fallback is needed)
      // For brevity, assuming OpenAI key is present for this task. 
      // If mock needed, can copy-paste the mock generator here.

      // Minimal Mock Fallback
      const mockResult: ResearchResult = {
        requestId,
        ticker: request.ticker,
        summary: "Mock analysis - OpenAI key missing.",
        keyFindings: ["Mock Finding 1", "Mock Finding 2"],
        priceScenarios: {
          bull: { price: 150, description: "Bull", upsidePercent: 20 },
          base: { price: 120, description: "Base" },
          bear: { price: 90, description: "Bear", downsidePercent: 25 }
        },
        completedAt: new Date(),
        sources: [],
        generatedFiles: []
      };
      this.resultsCache.set(requestId, mockResult);
      request.status = 'completed';
      request.completedAt = new Date();
      this.requestsCache.set(requestId, request);
    }, 2000);
  }
}

export default new ManusService();
