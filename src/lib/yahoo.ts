import yahooFinance from 'yahoo-finance2';

export const fetchStockQuotes = async (symbols: string[]) => {
    if (!symbols.length) return [];

    try {
        const results = await yahooFinance.quote(symbols);
        return results;
    } catch (error) {
        console.error('Error fetching stock quotes:', error);
        // Fallback: try one by one if batch fails? 
        // For now, just return empty array or handled error
        return [];
    }
};

export const fetchStockProfile = async (symbol: string) => {
    try {
        const profile = await yahooFinance.quoteSummary(symbol, { modules: ['summaryProfile', 'price'] });
        return profile;
    } catch (error) {
        console.error(`Error fetching profile for ${symbol}:`, error);
        return null;
    }
}
