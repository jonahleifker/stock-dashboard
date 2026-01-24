import { Request, Response } from 'express';
import { EarningsReport } from '../models';

/**
 * GET /api/earnings/:ticker
 * Get earnings reports for a specific stock
 */
export async function getEarnings(req: Request, res: Response) {
    try {
        const { ticker } = req.params;

        if (typeof ticker !== 'string') {
            return res.status(400).json({ success: false, error: 'Invalid ticker' });
        }

        const reports = await EarningsReport.findAll({
            where: { ticker: ticker.toUpperCase() },
            order: [['reportDate', 'DESC']],
        });

        res.json({
            success: true,
            count: reports.length,
            data: reports,
        });
    } catch (error) {
        console.error('Error in getEarnings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch earnings reports',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

/**
 * POST /api/earnings
 * Add a new earnings report
 */
export async function addEarnings(req: Request, res: Response) {
    try {
        const { ticker, quarter, reportDate, revenue, eps, notes } = req.body;

        if (!ticker || !quarter || !reportDate) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: ticker, quarter, reportDate',
            });
        }

        const report = await EarningsReport.create({
            ticker: ticker.toUpperCase(),
            quarter,
            reportDate: new Date(reportDate),
            revenue: revenue ? parseFloat(revenue) : null,
            eps: eps ? parseFloat(eps) : null,
            notes,
        });

        res.status(201).json({
            success: true,
            data: report,
        });
    } catch (error) {
        console.error('Error in addEarnings:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add earnings report',
            message: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}

export default {
    getEarnings,
    addEarnings,
};
