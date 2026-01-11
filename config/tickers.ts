/**
 * Stock Ticker Lists
 * 
 * Contains lists of stock tickers for different categories:
 * - TICKERS: Fortune 100 and major stocks
 * - EXPANDED_TICKERS: Broader market coverage (200+ stocks)
 * - RECENT_IPOS: Recent IPO stocks
 */

// Fortune 100 and major stocks (100 tickers)
export const TICKERS = [
  // Technology
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA', 'AVGO', 'ORCL', 'ADBE',
  'CRM', 'CSCO', 'ACN', 'AMD', 'INTC', 'IBM', 'NOW', 'QCOM', 'TXN', 'INTU',
  
  // Financial Services
  'BRK.B', 'JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'SCHW', 'BLK',
  'C', 'AXP', 'SPGI', 'PGR', 'CB', 'MMC', 'AON', 'USB', 'TFC', 'PNC',
  
  // Healthcare
  'UNH', 'JNJ', 'LLY', 'ABBV', 'MRK', 'TMO', 'ABT', 'PFE', 'DHR', 'BMY',
  'AMGN', 'CVS', 'ELV', 'CI', 'MDT', 'GILD', 'REGN', 'ISRG', 'VRTX', 'HUM',
  
  // Consumer Discretionary
  'HD', 'MCD', 'NKE', 'SBUX', 'TGT', 'LOW', 'TJX', 'BKNG', 'CMG', 'MAR',
  
  // Consumer Staples
  'WMT', 'PG', 'KO', 'PEP', 'COST', 'PM', 'MO', 'CL', 'MDLZ', 'KHC',
  
  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO', 'OXY', 'HAL',
  
  // Industrials
  'BA', 'UPS', 'HON', 'UNP', 'RTX', 'CAT', 'DE', 'LMT', 'GE', 'MMM',
  
  // Telecommunications
  'T', 'VZ', 'TMUS', 'CMCSA', 'DIS', 'NFLX',
  
  // Utilities & Real Estate
  'NEE', 'DUK', 'SO', 'AEP', 'PLD', 'AMT', 'CCI', 'EQIX'
];

// Expanded ticker list for sector analysis (200+ stocks)
export const EXPANDED_TICKERS = [
  ...TICKERS,
  
  // Additional Technology
  'SNOW', 'PLTR', 'NET', 'DDOG', 'ZS', 'CRWD', 'PANW', 'FTNT', 'OKTA', 'MDB',
  'TEAM', 'WDAY', 'SNPS', 'CDNS', 'ANSS', 'ADSK', 'DELL', 'HPE', 'ANET', 'MRVL',
  
  // Additional Healthcare
  'ZTS', 'MCK', 'CAH', 'HCA', 'IDXX', 'BDX', 'SYK', 'BSX', 'EW', 'RMD',
  'DXCM', 'ALGN', 'HOLX', 'ILMN', 'MRNA', 'BNTX', 'BIIB', 'ALNY', 'TECH', 'EXAS',
  
  // Additional Financial
  'ICE', 'CME', 'COIN', 'HOOD', 'SOFI', 'AFRM', 'PYPL', 'SQ', 'FIS', 'FISV',
  'ADP', 'PAYX', 'BR', 'WRB', 'ALL', 'TRV', 'MET', 'PRU', 'AFL', 'AIG',
  
  // Additional Consumer
  'AMZN', 'EBAY', 'ETSY', 'W', 'CHWY', 'SHOP', 'MELI', 'SE', 'PDD', 'BABA',
  'UBER', 'LYFT', 'ABNB', 'DASH', 'DKNG', 'PENN', 'MGM', 'WYNN', 'LVS', 'CZR',
  
  // Additional Industrials
  'FDX', 'NSC', 'CSX', 'ODFL', 'JBHT', 'CHRW', 'XPO', 'DAL', 'UAL', 'AAL',
  'LUV', 'ALK', 'JBLU', 'EMR', 'ITW', 'PH', 'ROK', 'ETN', 'AME', 'FTV',
  
  // Semiconductors
  'ASML', 'TSM', 'MU', 'LRCX', 'AMAT', 'KLAC', 'NXPI', 'ADI', 'MCHP', 'MPWR',
  
  // Energy & Materials
  'PXD', 'FANG', 'DVN', 'BKR', 'FCX', 'NEM', 'GOLD', 'NUE', 'STLD', 'CLF',
  'AA', 'APD', 'LIN', 'ECL', 'DD', 'DOW', 'LYB', 'PPG', 'SHW', 'NTR',
  
  // EVs & Clean Energy
  'RIVN', 'LCID', 'NIO', 'XPEV', 'LI', 'FSR', 'ENPH', 'SEDG', 'RUN', 'FSLR',
  
  // Biotech
  'SGEN', 'BMRN', 'INCY', 'SRPT', 'NBIX', 'JAZZ', 'UTHR', 'RARE', 'FOLD', 'BLUE'
];

// Recent IPOs (2020-2024)
export const RECENT_IPOS = [
  // 2024
  'RDDT', 'ARM', 
  
  // 2023
  'KVUE', 'CART', 'FBIN', 'VRT',
  
  // 2022
  'TPG', 'HLBZ', 'FRSH',
  
  // 2021
  'RIVN', 'COIN', 'RBLX', 'ABNB', 'DASH', 'SNOW', 'PLTR', 'AI', 'BROS',
  'DNUT', 'ASAN', 'DOCN', 'ZI', 'DOMA', 'OPEN', 'ROOT', 'WISH',
  
  // 2020
  'BIGC', 'FROG', 'JFR', 'NCNO', 'SNOW', 'U', 'UNITY', 'SUMO', 'CRWD',
  'PING', 'WORK', 'PINS', 'CHWY', 'UBER', 'LYFT', 'BYND', 'SPCE'
];

/**
 * Get all unique tickers (removes duplicates from combined lists)
 */
export function getAllTickers(): string[] {
  const allTickers = new Set([...TICKERS, ...EXPANDED_TICKERS, ...RECENT_IPOS]);
  return Array.from(allTickers).sort();
}

/**
 * Sector mapping for stocks
 */
export const SECTOR_MAPPING: Record<string, string> = {
  // Technology
  'AAPL': 'Technology', 'MSFT': 'Technology', 'GOOGL': 'Technology', 'AMZN': 'Technology',
  'META': 'Technology', 'NVDA': 'Technology', 'TSLA': 'Technology', 'AVGO': 'Technology',
  'ORCL': 'Technology', 'ADBE': 'Technology', 'CRM': 'Technology', 'CSCO': 'Technology',
  'ACN': 'Technology', 'AMD': 'Technology', 'INTC': 'Technology', 'IBM': 'Technology',
  'NOW': 'Technology', 'QCOM': 'Technology', 'TXN': 'Technology', 'INTU': 'Technology',
  
  // Financial Services
  'BRK.B': 'Financial Services', 'JPM': 'Financial Services', 'V': 'Financial Services',
  'MA': 'Financial Services', 'BAC': 'Financial Services', 'WFC': 'Financial Services',
  'GS': 'Financial Services', 'MS': 'Financial Services', 'SCHW': 'Financial Services',
  'BLK': 'Financial Services', 'C': 'Financial Services', 'AXP': 'Financial Services',
  
  // Healthcare
  'UNH': 'Healthcare', 'JNJ': 'Healthcare', 'LLY': 'Healthcare', 'ABBV': 'Healthcare',
  'MRK': 'Healthcare', 'TMO': 'Healthcare', 'ABT': 'Healthcare', 'PFE': 'Healthcare',
  
  // Add more mappings as needed...
};

/**
 * Get sector for a ticker (returns 'Unknown' if not found)
 */
export function getSectorForTicker(ticker: string): string {
  return SECTOR_MAPPING[ticker] || 'Unknown';
}
