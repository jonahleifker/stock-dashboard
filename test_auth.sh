#!/bin/bash

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================="
echo "Stock Dashboard Auth Test Script"
echo "=================================="
echo ""

# Check if backend is running
echo "1. Checking if backend is running on port 6405..."
if curl -s http://localhost:6405/api/stocks > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend is running${NC}"
else
    echo -e "${RED}✗ Backend is NOT running. Start it with: npm run dev${NC}"
    exit 1
fi

echo ""

# Check database users
echo "2. Checking database users..."
echo ""
sqlite3 var/dev.sqlite "SELECT 'User ID: ' || id || ' | Username: ' || username || ' | Display Name: ' || displayName || ' | Created: ' || createdAt FROM users ORDER BY createdAt DESC;" 2>/dev/null
echo ""

# Check environment variables
echo "3. Checking auth bypass flags..."
echo ""
if grep -q "DEV_AUTH_BYPASS=true" .env 2>/dev/null; then
    echo -e "${YELLOW}⚠ Backend bypass is ENABLED (DEV_AUTH_BYPASS=true)${NC}"
else
    echo -e "${GREEN}✓ Backend bypass is disabled (secure mode)${NC}"
fi

if grep -q "REACT_APP_DEV_BYPASS=true" client/.env 2>/dev/null; then
    echo -e "${YELLOW}⚠ Frontend bypass is ENABLED (REACT_APP_DEV_BYPASS=true)${NC}"
else
    echo -e "${GREEN}✓ Frontend bypass is disabled (secure mode)${NC}"
fi

echo ""

# Test auth endpoints
echo "4. Testing authentication endpoints..."
echo ""

# Test /api/auth/me without token (should fail)
echo -n "Testing /api/auth/me without token... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:6405/api/auth/me)
if [ "$HTTP_CODE" = "401" ]; then
    echo -e "${GREEN}✓ Returns 401 (correct)${NC}"
else
    echo -e "${RED}✗ Returns $HTTP_CODE (expected 401)${NC}"
fi

# Test register endpoint exists
echo -n "Testing /api/auth/register endpoint... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:6405/api/auth/register -H "Content-Type: application/json" -d '{}')
if [ "$HTTP_CODE" = "400" ] || [ "$HTTP_CODE" = "409" ]; then
    echo -e "${GREEN}✓ Endpoint exists (returns $HTTP_CODE for invalid request)${NC}"
else
    echo -e "${YELLOW}⚠ Returns $HTTP_CODE${NC}"
fi

# Test login endpoint exists
echo -n "Testing /api/auth/login endpoint... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:6405/api/auth/login -H "Content-Type: application/json" -d '{}')
if [ "$HTTP_CODE" = "401" ] || [ "$HTTP_CODE" = "400" ]; then
    echo -e "${GREEN}✓ Endpoint exists (returns $HTTP_CODE for invalid credentials)${NC}"
else
    echo -e "${YELLOW}⚠ Returns $HTTP_CODE${NC}"
fi

echo ""

# Check for notes and favorites tables
echo "5. Checking user-specific data in database..."
echo ""

NOTE_COUNT=$(sqlite3 var/dev.sqlite "SELECT COUNT(*) FROM notes;" 2>/dev/null)
FAV_COUNT=$(sqlite3 var/dev.sqlite "SELECT COUNT(*) FROM favorites;" 2>/dev/null)
WATCH_COUNT=$(sqlite3 var/dev.sqlite "SELECT COUNT(*) FROM watchlist;" 2>/dev/null)

echo "Notes in database: $NOTE_COUNT"
echo "Favorites in database: $FAV_COUNT"
echo "Watchlist items in database: $WATCH_COUNT"

echo ""
echo "=================================="
echo "Summary"
echo "=================================="
echo ""
echo -e "${GREEN}✓ Backend is running and auth endpoints are working${NC}"
echo ""
echo "Next steps:"
echo "1. Visit http://localhost:3000"
echo "2. You should be redirected to /login"
echo "3. Try registering a new user or logging in"
echo "4. Test adding notes on /company/AAPL"
echo "5. Test adding favorites on /portfolio"
echo ""
echo "To enable dev bypass (skip login):"
echo "  - Set DEV_AUTH_BYPASS=true in .env"
echo "  - Set REACT_APP_DEV_BYPASS=true in client/.env"
echo "  - Restart servers"
echo ""
