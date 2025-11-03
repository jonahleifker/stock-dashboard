'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RefreshCw, Search, TrendingUp } from 'lucide-react'

interface Stock {
  ticker: string
  company: string
  currentPrice: number
  highLast30Days: number
  percentFromHigh: number
  sector: string
}

export default function Dashboard() {
  const [stocks, setStocks] = useState<Stock[]>([])
  const [filteredStocks, setFilteredStocks] = useState<Stock[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [opportunitiesOnly, setOpportunitiesOnly] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')

  const fetchStocks = async () => {
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/stocks')
      const data: Stock[] = await response.json()
      
      setStocks(data)
      setFilteredStocks(data)
      setLastUpdated(new Date().toLocaleString())
    } catch (error) {
      console.error('Error fetching stocks:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStocks()
  }, [])

  useEffect(() => {
    let filtered = stocks

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(stock => 
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.company.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by opportunities (stocks down more than 5% from 30d high)
    if (opportunitiesOnly) {
      filtered = filtered.filter(stock => stock.percentFromHigh <= -5)
    }

    setFilteredStocks(filtered)
  }, [searchQuery, opportunitiesOnly, stocks])

  const tradingOpportunities = stocks.filter(s => s.percentFromHigh <= -5).length
  const avgChange = stocks.length > 0 
    ? stocks.reduce((sum, s) => sum + s.percentFromHigh, 0) / stocks.length 
    : 0

  const getPercentBadgeColor = (percent: number) => {
    if (percent <= -15) return 'destructive'
    if (percent <= -10) return 'default'
    return 'secondary'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Swing Trading Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">Fortune 100 Public Companies - Pullback from 30-Day High</p>
          </div>
          <Button onClick={fetchStocks} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trading Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{tradingOpportunities}</div>
              <p className="text-xs text-gray-500 mt-1">Down ≥5% from 30d high</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Total Stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stocks.length}</div>
              <p className="text-xs text-gray-500 mt-1">Successfully loaded</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Avg. Change</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{avgChange.toFixed(2)}%</div>
              <p className="text-xs text-gray-500 mt-1">From 30-day high</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">Last Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{lastUpdated.split(',')[0]}</div>
              <p className="text-xs text-gray-500 mt-1">{lastUpdated.split(',')[1]}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by ticker or company name..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button 
            variant={opportunitiesOnly ? "default" : "outline"}
            onClick={() => setOpportunitiesOnly(!opportunitiesOnly)}
          >
            Opportunities Only
          </Button>
        </div>

        {/* Stock Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading stocks...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-24">TICKER</TableHead>
                    <TableHead>COMPANY</TableHead>
                    <TableHead>SECTOR</TableHead>
                    <TableHead className="text-right">CURRENT PRICE</TableHead>
                    <TableHead className="text-right">30D HIGH</TableHead>
                    <TableHead className="text-right">% FROM HIGH ↑</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStocks.map((stock) => (
                    <TableRow key={stock.ticker}>
                      <TableCell className="font-medium">{stock.ticker}</TableCell>
                      <TableCell>{stock.company}</TableCell>
                      <TableCell className="text-gray-600">{stock.sector}</TableCell>
                      <TableCell className="text-right font-medium">
                        ${stock.currentPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-gray-600">
                        ${stock.highLast30Days.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Badge variant={getPercentBadgeColor(stock.percentFromHigh)}>
                            {stock.percentFromHigh.toFixed(2)}%
                          </Badge>
                          {stock.percentFromHigh <= -10 && (
                            <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                              ↓{Math.abs(stock.percentFromHigh).toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!loading && filteredStocks.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No stocks found matching your criteria
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
