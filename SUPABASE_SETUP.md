# Supabase Setup Instructions

Follow these steps to set up Supabase for your stock dashboard:

## Step 1: Create a Supabase Account & Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or "Sign In"
3. Create a new account (or sign in with GitHub)
4. Click "New Project"
5. Fill in:
   - **Project Name**: `stock-dashboard` (or any name you prefer)
   - **Database Password**: Create a strong password (save it somewhere safe!)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is fine for this project
6. Click "Create new project"
7. Wait 1-2 minutes for your project to be provisioned

## Step 2: Get Your API Credentials

1. Once your project is ready, you'll be on the project dashboard
2. Click on the **Settings** icon (⚙️) in the left sidebar
3. Click on **API** in the settings menu
4. You'll see two important values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (a long JWT token starting with `eyJ...`)
5. Copy both of these values

## Step 3: Create Your .env File

1. In your project root, copy the `.env.example` file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and replace the placeholder values:
   ```
   SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
   SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

3. Save the file

## Step 4: Create Database Tables

1. In your Supabase dashboard, click on **SQL Editor** in the left sidebar
2. Click **New query**
3. Copy the entire contents of `supabase_migrations.sql` file
4. Paste it into the SQL editor
5. Click **Run** (or press Cmd/Ctrl + Enter)
6. You should see "Success. No rows returned" - this is good!

## Step 5: Verify Tables Were Created

1. Click on **Table Editor** in the left sidebar
2. You should see two new tables:
   - `stock_metadata`
   - `stock_prices`
3. Both tables should be empty for now (they'll be populated when you run the API)

## Step 6: Install Python Dependencies

```bash
cd /Users/willleifker/src/stock-dashboard
pip install -r requirements.txt
```

## Step 7: Test the Connection

After completing the implementation, you can test with:

```bash
python server.py
```

Then in another terminal:
```bash
# First call will be slow (fetches from Yahoo Finance)
curl http://localhost:8000/api/stocks

# Check your Supabase Table Editor - should have data now!

# Second call should be fast (from cache)
curl http://localhost:8000/api/stocks
```

## Troubleshooting

### "Connection timeout" error
- Check that your `SUPABASE_URL` and `SUPABASE_KEY` are correct in `.env`
- Make sure there are no extra spaces or quotes around the values

### "Failed to run sql query"
- Verify the SQL was pasted correctly in the SQL Editor
- Try running the migrations in smaller chunks if needed

### Import errors
- Make sure you've run `pip install -r requirements.txt`
- You may need to use `pip3` instead of `pip` depending on your setup

## Next Steps

Once Supabase is set up, the refactored `server.py` will:
1. Check Supabase cache first (fast!)
2. If no cache, fetch from Yahoo Finance (slow, first time only)
3. Store results in Supabase for next time
4. Provide `/api/stocks/refresh` endpoint to manually refresh data


