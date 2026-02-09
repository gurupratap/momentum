# Docker & CI/CD Documentation

Complete guide for running Momentum with Docker and deploying with GitHub Actions.

## 📦 Docker Setup

### Prerequisites

- Docker Desktop 4.0+ or Docker Engine 20.10+
- Docker Compose 2.0+

### Quick Start

#### 1. Development with Hot Reload

```bash
# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start development environment
docker compose -f docker-compose.dev.yml up

# Access the app
open http://localhost:3000
```

**Features:**
- ✅ Hot reload enabled (code changes reflect immediately)
- ✅ PostgreSQL database included
- ✅ Source code mounted as volume
- ✅ Automatic Prisma migrations

#### 2. Production Build

```bash
# Build and start production containers
docker compose up --build -d

# View logs
docker compose logs -f app

# Access the app
open http://localhost:3000
```

**Features:**
- ✅ Optimized multi-stage build
- ✅ Minimal image size (~200MB)
- ✅ Health checks included
- ✅ Non-root user (security)

### Available Commands

```bash
# Development
docker compose -f docker-compose.dev.yml up          # Start dev environment
docker compose -f docker-compose.dev.yml down        # Stop dev environment
docker compose -f docker-compose.dev.yml logs -f     # View logs

# Production
docker compose up -d                                 # Start production
docker compose down                                  # Stop production
docker compose restart app                           # Restart app only
docker compose exec app npx prisma studio           # Open Prisma Studio

# Database
docker compose exec db psql -U momentum             # Access PostgreSQL CLI
docker compose exec app npx prisma migrate dev      # Create new migration
docker compose exec app npx prisma migrate deploy   # Apply migrations

# Cleanup
docker compose down -v                              # Remove containers + volumes
docker system prune -a                              # Clean up Docker system
```

## 🏗 Build Details

### Multi-Stage Build

Our Dockerfile uses a 3-stage build for optimization:

**Stage 1: Dependencies**
- Installs production dependencies only
- Caches node_modules for faster rebuilds

**Stage 2: Builder**
- Copies source code
- Generates Prisma client
- Builds Next.js application

**Stage 3: Runner**
- Minimal Alpine Linux base
- Copies only necessary files
- Runs as non-root user
- ~200MB final image size

### Environment Variables

Required environment variables for Docker:

```env
# Database (auto-configured in docker-compose)
DATABASE_URL=postgresql://momentum:password@db:5432/momentum

# StackAuth (get from https://stack-auth.com)
NEXT_PUBLIC_STACK_PROJECT_ID=your_project_id
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=your_client_key
STACK_SECRET_SERVER_KEY=your_secret_key

# Google AI (get from https://ai.google.dev)
GOOGLE_GENERATIVE_AI_API_KEY=your_api_key

# Opik (optional - get from https://www.comet.com/opik)
OPIK_API_KEY=your_opik_key
OPIK_WORKSPACE=your_workspace

# AI Configuration (optional)
AI_MODEL_ID=gemini-2.0-flash-exp
AI_MODEL_TEMPERATURE=0.3
AI_MODEL_MAX_TOKENS=4096
```

## 🔄 GitHub Actions CI/CD

### Pipeline Overview

Our CI/CD pipeline runs automatically on every push and PR:

```
┌─────────────────────────────────────────────────────────┐
│                    Trigger (push/PR)                    │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
   ┌───▼───┐      ┌────▼────┐
   │ Lint  │      │TypeCheck│
   └───┬───┘      └────┬────┘
       │               │
       └───────┬───────┘
               │
       ┌───────▼────────┐
       │     Build      │
       └───────┬────────┘
               │
       ┌───────▼────────┐
       │     Test       │
       └───────┬────────┘
               │
    ┌──────────▼──────────┐
    │   Build Docker      │
    │  (main branch only) │
    └──────────┬──────────┘
               │
    ┌──────────▼──────────┐
    │   Deploy (Manual)   │
    │  Workflow Dispatch  │
    └─────────────────────┘
```

### Jobs

#### 1. Lint
- Runs ESLint on all code
- Checks Prettier formatting
- Fast feedback on code quality

#### 2. TypeCheck
- Validates Prisma schema
- Runs TypeScript compiler
- Ensures type safety

#### 3. Build
- Builds Next.js application
- Uses dummy env vars for build
- Uploads build artifacts

#### 4. Test
- Placeholder for future tests
- Currently validates setup
- Add `npm test` when ready

#### 5. Build Docker
- Only runs on `main` branch pushes
- Builds and pushes to GitHub Container Registry
- Tags: `latest`, `main-{sha}`

#### 6. Deploy (Manual Only)
- **Trigger:** Manual workflow dispatch
- **Condition:** Must select "Deploy to production" checkbox
- **Requires:** All previous jobs must pass
- **Environment:** Production (with protection rules)

### Triggering Deployment

#### Method 1: GitHub UI

1. Go to **Actions** tab
2. Select **CI/CD Pipeline** workflow
3. Click **Run workflow**
4. Check ✅ **Deploy to production**
5. Click **Run workflow**

#### Method 2: GitHub CLI

```bash
# Trigger deployment
gh workflow run ci-cd.yml \
  --ref main \
  --field deploy=true
```

#### Method 3: API

```bash
curl -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/OWNER/REPO/actions/workflows/ci-cd.yml/dispatches \
  -d '{"ref":"main","inputs":{"deploy":"true"}}'
```

### Required Secrets

Add these secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

#### For Vercel Deployment:
```
VERCEL_TOKEN              # From vercel.com/account/tokens
VERCEL_ORG_ID            # From .vercel/project.json
VERCEL_PROJECT_ID        # From .vercel/project.json
```

#### For Docker Registry:
```
GITHUB_TOKEN             # Auto-provided by GitHub
```

#### For Kubernetes (if using):
```
KUBE_CONFIG              # Your kubeconfig file content
```

### Setting Up Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login and link project
vercel login
vercel link

# Get organization and project IDs
cat .vercel/project.json

# Add secrets to GitHub
gh secret set VERCEL_TOKEN --body "your-token"
gh secret set VERCEL_ORG_ID --body "your-org-id"
gh secret set VERCEL_PROJECT_ID --body "your-project-id"
```

## 🔒 Security

### Docker Security

1. **Non-root user**: App runs as `nextjs:nodejs` (UID 1001)
2. **Minimal base**: Alpine Linux reduces attack surface
3. **No secrets in image**: All secrets via environment variables
4. **Health checks**: Automatic container restart on failure

### CI/CD Security

1. **Environment protection**: Production requires manual approval
2. **Secret scanning**: GitHub scans for leaked secrets
3. **Dependency scanning**: Automated security updates via Dependabot
4. **Branch protection**: Require PR reviews and passing checks

### Best Practices

```bash
# Never commit secrets
echo ".env" >> .gitignore

# Use GitHub secrets for CI/CD
gh secret set SECRET_NAME --body "value"

# Rotate credentials regularly
# Update in GitHub Settings → Secrets

# Enable branch protection
# Settings → Branches → Add rule
```

## 📊 Monitoring

### Health Checks

**Endpoint:** `http://localhost:3000/api/health`

**Response (healthy):**
```json
{
  "status": "healthy",
  "timestamp": "2024-02-09T12:00:00.000Z",
  "database": "connected"
}
```

**Response (unhealthy):**
```json
{
  "status": "unhealthy",
  "timestamp": "2024-02-09T12:00:00.000Z",
  "database": "disconnected",
  "error": "Connection timeout"
}
```

### Docker Health Checks

```bash
# Check container health
docker ps

# View health check logs
docker inspect --format='{{json .State.Health}}' momentum-app

# Watch health status
watch -n 5 "docker ps --filter name=momentum"
```

## 🐛 Troubleshooting

### Common Issues

**Issue: Build fails with "Cannot find module"**
```bash
# Solution: Clear Docker cache
docker compose build --no-cache
```

**Issue: Database connection refused**
```bash
# Solution: Ensure database is healthy
docker compose ps
docker compose logs db

# Restart database
docker compose restart db
```

**Issue: Hot reload not working**
```bash
# Solution: Check volume mounts
docker compose -f docker-compose.dev.yml config

# Ensure you're using docker-compose.dev.yml
docker compose -f docker-compose.dev.yml up
```

**Issue: Port 3000 already in use**
```bash
# Solution: Stop local Next.js server
lsof -ti:3000 | xargs kill -9

# Or change port in docker-compose.yml
ports:
  - "3001:3000"  # Access at http://localhost:3001
```

**Issue: Prisma migrations fail**
```bash
# Solution: Run migrations manually
docker compose exec app npx prisma migrate deploy

# Or reset database (development only!)
docker compose exec app npx prisma migrate reset
```

## 📈 Performance Tips

### Optimize Build Time

```bash
# Use build cache
docker compose build

# Build with BuildKit (faster)
DOCKER_BUILDKIT=1 docker compose build

# Build specific service
docker compose build app
```

### Reduce Image Size

Current optimizations:
- ✅ Multi-stage build (saves ~500MB)
- ✅ Alpine Linux base (saves ~200MB)
- ✅ Standalone output (saves ~300MB)
- ✅ .dockerignore (saves build time)

**Total savings: ~1GB per image!**

## 🚀 Production Checklist

Before deploying to production:

- [ ] Environment variables configured in GitHub Secrets
- [ ] Database backup strategy in place
- [ ] Monitoring and alerting set up (Opik, Sentry, etc.)
- [ ] Domain and SSL certificates configured
- [ ] Branch protection rules enabled
- [ ] Deployment environment set up in GitHub
- [ ] Health check endpoint tested
- [ ] Run manual deployment test
- [ ] Document rollback procedure

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Next.js Docker Deployment](https://nextjs.org/docs/deployment#docker-image)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

---

**Need help?** Check the main [README.md](./README.md) or open an issue.
