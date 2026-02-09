# Vercel Deployment Guide

## Prerequisites

1. **Vercel CLI** (already installed)
2. **PostgreSQL Database** - You need a production database. Options:
   - **Vercel Postgres** (recommended, easiest)
   - **Neon** (free tier available)
   - **Supabase** (free tier available)
   - **Railway** (free tier available)

## Step 1: Set Up Database

### Option A: Vercel Postgres (Recommended)

```bash
# Login to Vercel
vercel login

# Link your project
vercel link

# Add Vercel Postgres
vercel integration add postgres

# This will automatically add DATABASE_URL to your environment variables
```

### Option B: External Database (Neon, Supabase, etc.)

1. Create a PostgreSQL database at your chosen provider
2. Copy the connection string (should look like: `postgresql://user:password@host:5432/database`)
3. You'll add this as an environment variable in the next step

## Step 2: Set Environment Variables

You need to add all environment variables from `.env.example`:

```bash
# Set environment variables (one at a time)
vercel env add NEXT_PUBLIC_STACK_PROJECT_ID
vercel env add NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY
vercel env add STACK_SECRET_SERVER_KEY
vercel env add GOOGLE_GENERATIVE_AI_API_KEY

# Optional (Opik observability)
vercel env add OPIK_API_KEY
vercel env add OPIK_WORKSPACE

# AI Configuration (optional, has defaults)
vercel env add AI_MODEL_ID
vercel env add AI_MODEL_TEMPERATURE
vercel env add AI_MODEL_MAX_TOKENS

# If using external database (not Vercel Postgres)
vercel env add DATABASE_URL
```

**Note:** For each variable, you'll be asked which environment (production, preview, development). Select:
- **production** - Required for live site
- **preview** - Recommended for PR previews
- **development** - Optional

## Step 3: Deploy

```bash
# Deploy to production
vercel --prod

# Or deploy to preview (test deployment)
vercel
```

The build process will:
1. Install dependencies
2. Generate Prisma client
3. Run database migrations (`prisma migrate deploy`)
4. Build Next.js app

## Step 4: Verify Deployment

After deployment:
1. Visit the URL provided by Vercel
2. Test authentication (StackAuth)
3. Create a test goal
4. Verify AI analysis works

## Troubleshooting

### Build fails with "Prisma Client not generated"
- Make sure `postinstall` script runs: `"postinstall": "prisma generate"`

### Database migration fails
- Check that DATABASE_URL is set correctly
- Verify database is accessible from Vercel
- Check Vercel logs: `vercel logs`

### AI features not working
- Verify GOOGLE_GENERATIVE_AI_API_KEY is set
- Check API key has sufficient quota

### Authentication issues
- Verify all STACK_* environment variables are set
- Check StackAuth dashboard for configuration

## Continuous Deployment

Once deployed, Vercel will automatically:
- Deploy on every push to `main` branch (production)
- Create preview deployments for pull requests
- Run builds and migrations automatically

## Database Migrations in Production

When you make schema changes:

```bash
# Locally, create migration
npx prisma migrate dev --name your_migration_name

# Commit the migration files
git add prisma/migrations
git commit -m "Add migration: your_migration_name"
git push

# Vercel will automatically run migrations during build
```

## Environment Variables Management

To update environment variables:

```bash
# List all variables
vercel env ls

# Remove a variable
vercel env rm VARIABLE_NAME

# Pull environment variables to local
vercel env pull .env.local
```

## Cost Considerations

- **Vercel**: Free for hobby projects, check pricing for production
- **Vercel Postgres**: Has limits on free tier
- **Google AI API**: Check your quota and pricing
- **StackAuth**: Check your plan limits
- **Opik**: Optional, has free tier
