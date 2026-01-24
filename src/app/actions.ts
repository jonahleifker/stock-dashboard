'use server';

import { db } from '@/lib/db';
import { fetchStockQuotes, fetchStockProfile } from '@/lib/yahoo';

export async function getStockData(symbols: string[]) {
    if (!symbols.length) return [];

    // 1. Check DB for fresh data (e.g., less than 5 minutes old)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const storedPrices = await db.stockPrice.findMany({
        where: {
            tickerId: { in: symbols },
            timestamp: { gt: fiveMinutesAgo }
        },
        include: { ticker: true }
    });

    // Identify missing or stale symbols
    const freshSymbols = new Set(storedPrices.map(p => p.tickerId));
    const staleSymbols = symbols.filter(s => !freshSymbols.has(s));

    if (staleSymbols.length === 0) {
        return storedPrices;
    }

    // 2. Fetch stale data
    console.log(`Fetching stale data for: ${staleSymbols.join(', ')}`);
    const quotes = await fetchStockQuotes(staleSymbols);

    // 3. Update DB
    for (const quote of quotes) {
        const safeQuote = quote as any; // Type assertion if needed, yahoo types can be loose

        // Ensure ticker exists
        await db.ticker.upsert({
            where: { symbol: safeQuote.symbol },
            create: { symbol: safeQuote.symbol, name: safeQuote.shortName || safeQuote.longName },
            update: { name: safeQuote.shortName || safeQuote.longName }
        });

        // Create price record
        await db.stockPrice.create({
            data: {
                tickerId: safeQuote.symbol,
                price: safeQuote.regularMarketPrice || 0,
                change: safeQuote.regularMarketChange || 0,
                changePercent: safeQuote.regularMarketChangePercent || 0,
            }
        });

        // Also update fetching timestamp/metadata if we had a separate field for it
    }

    // 4. Return all data (re-query to get uniform structure or just merge)
    const updatedPrices = await db.stockPrice.findMany({
        where: {
            tickerId: { in: symbols },
            // Get the *latest* price for each ticker
            // This is a bit complex in standard prisma, often easier to just get all recent and filter in JS
            // or use distinct
        },
        orderBy: { timestamp: 'desc' },
        distinct: ['tickerId'],
        include: { ticker: true }
    });

    return updatedPrices;
}

export async function getTrackedTickers() {
    return await db.ticker.findMany({
        orderBy: { symbol: 'asc' }
    });
}

export async function addTicker(symbol: string) {
    const upperSymbol = symbol.toUpperCase();
    // Fetch profile to get sector/industry
    const profile = await fetchStockProfile(upperSymbol) as any;

    const name = profile?.price?.shortName || profile?.price?.longName || upperSymbol;
    const sector = profile?.summaryProfile?.sector;
    const industry = profile?.summaryProfile?.industry;

    return await db.ticker.upsert({
        where: { symbol: upperSymbol },
        create: {
            symbol: upperSymbol,
            name,
            sector,
            industry
        },
        update: {
            name,
            sector,
            industry
        }
    });
}
