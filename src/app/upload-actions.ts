'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function addNewsItem(tickerId: string, title: string, summary: string, url?: string) {
    try {
        await db.newsItem.create({
            data: {
                tickerId,
                title,
                summary,
                url,
                publishedAt: new Date(),
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Error adding news:', error);
        return { success: false, error: 'Failed to add news' };
    }
}

export async function addEarningsReport(tickerId: string, quarter: string, revenue?: number, eps?: number, notes?: string) {
    try {
        await db.earningsReport.create({
            data: {
                tickerId,
                quarter,
                reportDate: new Date(),
                revenue,
                eps,
                notes
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Error adding earnings:', error);
        return { success: false, error: 'Failed to add earnings' };
    }
}

export async function bulkAddTickers(input: string) {
    // Split by commas, newlines, or spaces
    const symbols = input.split(/[\s,]+/).map(s => s.trim().toUpperCase()).filter(Boolean);
    const uniqueSymbols = Array.from(new Set(symbols));

    if (uniqueSymbols.length === 0) return { count: 0 };

    // We'll use the existing addTicker function logic but optimized slightly or just loop
    // For simplicity and to reuse the Yahoo fetching logic:
    // (In a real app, we might want to batch this check too)

    let count = 0;
    for (const symbol of uniqueSymbols) {
        try {
            // We call the server action from here (or duplicate logic)
            // Importing addTicker from ./actions might cause circular deps if not careful, 
            // effectively we just need to ensure the ticker exists.
            // Let's just create them as "pending" or let the background job fill them?
            // User wants them "added". Best to use the existing logic to fetch basic info immediately if possible
            // or just insert them and let the dashboard fetch loop pick them up.

            // Strategy: Insert blindly, let the fetcher handle details.
            // Check if exists
            const exists = await db.ticker.findUnique({ where: { symbol } });
            if (!exists) {
                await db.ticker.create({
                    data: { symbol }
                });
                count++;
            }
        } catch (e) {
            console.error(`Failed to add ${symbol}`, e);
        }
    }

    return { count, message: `Added ${count} new tickers. They will update shortly.` };
}

export async function getTickerDetails(symbol: string) {
    return await db.ticker.findUnique({
        where: { symbol },
        include: {
            news: { orderBy: { publishedAt: 'desc' }, take: 5 },
            earnings: { orderBy: { reportDate: 'desc' }, take: 5 },
            prices: { orderBy: { timestamp: 'desc' }, take: 1 } // Just latest price
        }
    });
}
