import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: '/api', // Proxy in package.json handles redirect to backend
});

// Track retry attempts to prevent infinite loops
let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
}> = [];

// Separate axios instance for refresh to avoid interceptors
const refreshApi = axios.create({
    baseURL: '/api',
});

// Process queued requests after token refresh
const processQueue = (error: any, token: string | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add request interceptor to attach token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling and token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is not 401, request was already retried, or this is a refresh request, reject immediately
        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            originalRequest.url === '/auth/refresh'
        ) {
            console.error('API Error:', error.response?.data?.message || error.message);
            return Promise.reject(error);
        }

        // If we're already refreshing, queue this request
        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
        }

        // Mark that we're attempting to refresh
        originalRequest._retry = true;
        isRefreshing = true;

        // Get refresh token and userId from localStorage
        const refreshToken = localStorage.getItem('refreshToken');
        const userId = localStorage.getItem('userId');

        // If no refresh token or userId, clear tokens and redirect to login
        if (!refreshToken || !userId) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            isRefreshing = false;
            processQueue(new Error('No refresh token available'), null);
            window.location.href = '/login';
            return Promise.reject(error);
        }

        try {
            // Attempt to refresh the token
            const response = await refreshApi.post('/auth/refresh', {
                userId,
                refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;

            // Update tokens in localStorage
            localStorage.setItem('accessToken', accessToken);
            if (newRefreshToken) {
                localStorage.setItem('refreshToken', newRefreshToken);
            }

            // Update axios defaults
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

            // Update the original request with new token
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            // Process queued requests
            isRefreshing = false;
            processQueue(null, accessToken);

            // Retry the original request
            return api(originalRequest);
        } catch (refreshError: any) {
            // Refresh failed - clear tokens and redirect to login
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userId');
            isRefreshing = false;
            processQueue(refreshError, null);

            // Redirect to login
            window.location.href = '/login';
            return Promise.reject(refreshError);
        }
    }
);

// Types matching backend interfaces
export interface StockQuote {
    ticker: string;
    companyName: string;
    sector?: string;
    currentPrice: number;
    high30d?: number;
    high3mo?: number;
    high6mo?: number;
    high1yr?: number;
    percentFromHigh30d?: number;
    change7d?: number;
    change30d?: number;
    change1y?: number;
    marketCap?: number;
    lastUpdated: string;
    // Extended Metrics
    pe?: number;
    peg?: number;
    eps?: number;
    dividendYield?: number;
    roe?: number;
    netMargin?: number;
    operatingMargin?: number;
    cash?: number;
    totalDebt?: number;
    earningsDate?: string;
    exDividendDate?: string;
    targetPrice?: number;
    recommendation?: string;
    description?: string;
    website?: string;
    employees?: number;
    news?: Array<{
        title: string;
        link: string;
        publisher: string;
        providerPublishTime?: number | string;
        type?: string;
        thumbnail?: {
            resolutions: Array<{ url: string; width: number; height: number }>;
        };
    }>;
}

export interface SectorPerformance {
    sector: string;
    stockCount: number;
    avgChange7d: number;
    avgChange30d: number;
    avgChange90d: number;
    topStocks: Array<{
        ticker: string;
        companyName: string;
        change30d: number;
    }>;
}

export interface DeepPullback {
    ticker: string;
    companyName: string;
    currentPrice: number;
    high: number;
    percentFromHigh: number;
    marketCap: number;
    timeframe: '3mo' | '6mo' | '1yr';
}

export interface IPOPerformance {
    ticker: string;
    companyName: string;
    currentPrice: number;
    percentChange: number;
    marketCap?: number;
}

export interface MarketPulseData {
    index: string;
    value: string;
    changePercent: number;
    sparklineData: number[];
}

// API methods
export const stockApi = {
    // Get market pulse (indices)
    getMarketPulse: async () => {
        const response = await api.get<{ success: boolean; data: MarketPulseData[] }>('/stocks/market-pulse');
        return response.data.data;
    },

    // Get all stocks
    getStocks: async (refresh = false) => {
        const response = await api.get<{ success: boolean, data: StockQuote[] }>('/stocks', {
            params: { refresh }
        });
        return response.data.data;
    },

    // Get single stock
    getStock: async (ticker: string) => {
        const response = await api.get<{ success: boolean, data: StockQuote }>(`/stocks/${ticker}`);
        return response.data.data;
    },

    // Get sector performance
    getSectors: async () => {
        const response = await api.get<{ success: boolean, data: SectorPerformance[] }>('/stocks/sectors');
        return response.data.data;
    },

    // Get deep pullbacks
    getDeepPullbacks: async (timeframe: '3mo' | '6mo' | '1yr' = '6mo') => {
        const response = await api.get<{ success: boolean, data: DeepPullback[] }>('/stocks/deep-pullbacks', {
            params: { timeframe }
        });
        return response.data.data;
    },

    // Get IPO performance
    getIPOs: async () => {
        const response = await api.get<{ success: boolean, data: IPOPerformance[] }>('/stocks/ipos');
        return response.data.data;
    },

    // Trigger refresh
    refreshStocks: async () => {
        const response = await api.post<{ success: boolean, message: string }>('/stocks/refresh');
        return response.data;
    },

    // Get top market news
    getMarketNews: async () => {
        const response = await api.get<{ success: boolean; data: any[] }>('/stocks/news/top');
        return response.data.data;
    }
};

export interface SharedUser {
    id: number;
    username: string;
    displayName: string;
    email?: string;
}

export interface Note {
    id: number;
    ticker: string;
    bullCase: string;
    bearCase: string;
    buyInPrice: number;
    currentStance: 'bullish' | 'bearish' | 'neutral';
    visibility?: 'private' | 'shared' | 'public';
    createdAt: string;
    updatedAt: string;
    user: {
        id: number;
        username: string;
        displayName: string;
    } | null;
    sharedBy?: {
        id: number;
        username: string;
        displayName: string;
    };
}

export const notesApi = {
    getByTicker: async (ticker: string) => {
        const response = await api.get<{ count: number, notes: Note[] }>(`/notes/${ticker}`);
        return response.data.notes;
    },

    create: async (ticker: string, data: { bullCase: string; bearCase: string; buyInPrice: number; currentStance: string }) => {
        const response = await api.post<{ message: string, note: Note }>(`/notes/${ticker}`, data);
        return response.data.note;
    },

    update: async (id: number, data: { bullCase: string; bearCase: string; buyInPrice: number; currentStance: string }) => {
        const response = await api.put<{ message: string, note: Note }>(`/notes/${id}`, data);
        return response.data.note;
    },

    delete: async (id: number) => {
        const response = await api.delete<{ message: string }>(`/notes/${id}`);
        return response.data;
    },

    // Sharing methods
    share: async (id: number, userIds: number[]) => {
        const response = await api.post<{ message: string }>(`/notes/${id}/share`, { userIds });
        return response.data;
    },

    unshare: async (id: number, userId: number) => {
        const response = await api.delete<{ message: string }>(`/notes/${id}/share/${userId}`);
        return response.data;
    },

    getSharedWith: async (id: number) => {
        const response = await api.get<{ sharedWith: SharedUser[] }>(`/notes/${id}/shared-with`);
        return response.data.sharedWith;
    },

    getSharedNotes: async () => {
        const response = await api.get<{ count: number, notes: Note[] }>('/notes/shared');
        return response.data.notes;
    }
};

export interface Article {
    id: number;
    ticker: string;
    title: string;
    url: string;
    sourceName: string;
    publishedAt?: string;
    addedAt: string;
    user: {
        id: number;
        username: string;
        displayName: string;
    };
}

export const articlesApi = {
    getByTicker: async (ticker: string) => {
        const response = await api.get<{ count: number, articles: Article[] }>(`/articles/${ticker}`);
        return response.data.articles;
    },

    create: async (ticker: string, data: { title: string; url: string; sourceName: string; publishedAt?: string }) => {
        const response = await api.post<{ message: string, article: Article }>(`/articles/${ticker}`, data);
        return response.data.article;
    },

    delete: async (id: number) => {
        const response = await api.delete<{ message: string }>(`/articles/${id}`);
        return response.data;
    }
};

export interface ResearchFile {
    id: number;
    filename: string;
    fileType: string;
    fileSize: number;
    source: string;
    visibility?: 'private' | 'shared' | 'public';
    uploadedAt: string;
    user: {
        id: number;
        username: string;
        displayName: string;
    };
    sharedBy?: {
        id: number;
        username: string;
        displayName: string;
    };
}

export const filesApi = {
    getByTicker: async (ticker: string) => {
        const response = await api.get<{ count: number, files: ResearchFile[] }>(`/files/${ticker}`);
        return response.data.files;
    },

    upload: async (ticker: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<{ message: string, file: ResearchFile }>(`/files/${ticker}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data.file;
    },

    getDownloadUrl: async (id: number) => {
        const response = await api.get<{ downloadUrl: string }>(`/files/${id}/download`);
        return response.data.downloadUrl;
    },

    delete: async (id: number) => {
        const response = await api.delete<{ message: string }>(`/files/${id}`);
        return response.data;
    },

    // Sharing methods
    share: async (id: number, userIds: number[]) => {
        const response = await api.post<{ message: string }>(`/files/${id}/share`, { userIds });
        return response.data;
    },

    unshare: async (id: number, userId: number) => {
        const response = await api.delete<{ message: string }>(`/files/${id}/share/${userId}`);
        return response.data;
    },

    getSharedWith: async (id: number) => {
        const response = await api.get<{ sharedWith: SharedUser[] }>(`/files/${id}/shared-with`);
        return response.data.sharedWith;
    },

    getSharedFiles: async () => {
        const response = await api.get<{ count: number, files: ResearchFile[] }>('/files/shared');
        return response.data.files;
    }
};

// Users API for sharing functionality
export const usersApi = {
    getAll: async () => {
        const response = await api.get<{ count: number, users: SharedUser[] }>('/users');
        return response.data.users;
    }
};

// ... existing code ...

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
        publishedAt?: string;
    }>;
    completedAt: string;
    userNotes?: string;
}

export interface ResearchRequest {
    id: string;
    ticker: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    requestType: string;
    createdAt: string;
}

export const researchApi = {
    // Initiate research
    request: async (ticker: string, requestType = 'comprehensive') => {
        const response = await api.post<{ request: ResearchRequest }>(`/research/${ticker}/request`, { requestType });
        return response.data;
    },

    // Get status/result of specific request
    getStatus: async (ticker: string, requestId: string) => {
        const response = await api.get<{ request: ResearchRequest, result?: ResearchResult }>(`/research/${ticker}/status/${requestId}`);
        return response.data;
    },

    // Get all completed research for a ticker
    getByTicker: async (ticker: string) => {
        const response = await api.get<{ count: number, results: ResearchResult[] }>(`/research/${ticker}`);
        return response.data.results;
    },

    // Get latest completed research
    getLatest: async (ticker: string) => {
        const results = await researchApi.getByTicker(ticker);
        return results.length > 0 ? results[0] : null;
    },

    // Update research result (save notes)
    update: async (requestId: string, updates: Partial<ResearchResult>) => {
        const response = await api.patch<{ message: string, result: ResearchResult }>(`/research/result/${requestId}`, updates);
        return response.data.result;
    },

    // Analyze news article
    analyzeNews: async (data: { title: string; url: string; publisher: string; content?: string }) => {
        const response = await api.post<{
            analysis: {
                summary: string;
                affectedStocks: Array<{
                    ticker: string;
                    impact: 'positive' | 'negative' | 'neutral';
                    reasoning: string;
                }>;
                generalMarketSentiment?: 'bullish' | 'bearish' | 'neutral';
                confidenceScore: number;
            },
            manusEnabled: boolean
        }>('/research/news/analyze', data);
        return response.data;
    }
};

export const authApi = {
    updateProfile: async (data: { displayName?: string; profilePicture?: string }) => {
        const response = await api.put<{ user: any }>('/auth/me', data);
        return response.data.user;
    }
};

// ... existing code ...

export interface FavoriteItem {
    id: number;
    userId: number;
    ticker: string;
    averagePrice?: number;
    shares?: number;
    createdAt: string;
    updatedAt: string;
    Stock?: StockQuote;
}

export const favoritesApi = {
    getAll: async () => {
        const response = await api.get<{ favorites: FavoriteItem[] }>('/favorites');
        return response.data.favorites;
    },

    add: async (data: { ticker: string; averagePrice?: number; shares?: number }) => {
        const response = await api.post<{ favorite: FavoriteItem }>('/favorites', data);
        return response.data.favorite;
    },

    update: async (id: number, data: { averagePrice?: number; shares?: number }) => {
        const response = await api.put<{ favorite: FavoriteItem }>(`/favorites/${id}`, data);
        return response.data.favorite;
    },

    delete: async (id: number) => {
        const response = await api.delete<{ message: string }>(`/favorites/${id}`);
        return response.data;
    },

    analyzePortfolio: async () => {
        const response = await api.post<{ analysis: any }>('/research/portfolio');
        return response.data;
    },

    addBulk: async (tickers: string[]) => {
        const response = await api.post<{ message: string; favorites: FavoriteItem[] }>('/favorites/bulk', { tickers });
        return response.data;
    }
};

export interface WatchlistItem {
    id: number;
    userId: number;
    ticker: string;
    createdAt: string;
    updatedAt: string;
    Stock?: StockQuote;
}

export const watchlistApi = {
    getAll: async () => {
        const response = await api.get<{ watchlist: WatchlistItem[] }>('/watchlist');
        return response.data.watchlist;
    },

    add: async (data: { ticker: string }) => {
        const response = await api.post<{ item: WatchlistItem }>('/watchlist', data);
        return response.data.item;
    },

    delete: async (id: number) => {
        const response = await api.delete<{ message: string }>(`/watchlist/${id}`);
        return response.data;
    }
};

export default api;
