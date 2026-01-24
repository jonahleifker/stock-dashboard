-- CreateTable
CREATE TABLE "Ticker" (
    "symbol" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "sector" TEXT,
    "industry" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "StockPrice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tickerId" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "change" REAL,
    "changePercent" REAL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "StockPrice_tickerId_fkey" FOREIGN KEY ("tickerId") REFERENCES "Ticker" ("symbol") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "NewsItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tickerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT,
    "summary" TEXT,
    "source" TEXT,
    "publishedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "NewsItem_tickerId_fkey" FOREIGN KEY ("tickerId") REFERENCES "Ticker" ("symbol") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EarningsReport" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tickerId" TEXT NOT NULL,
    "quarter" TEXT NOT NULL,
    "reportDate" DATETIME NOT NULL,
    "revenue" REAL,
    "eps" REAL,
    "notes" TEXT,
    "documentUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "EarningsReport_tickerId_fkey" FOREIGN KEY ("tickerId") REFERENCES "Ticker" ("symbol") ON DELETE RESTRICT ON UPDATE CASCADE
);
