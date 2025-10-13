# 🔧 Render Deployment Fix

## ❌ Issue: Exit Status 134

The deployment is failing because Render is using the wrong start command.

**Problem**: Render is running `npm run start` (development mode) instead of `npm run start:prod` (production mode)

---

## ✅ Solution

You need to update the start command in the **Render Dashboard** (not just render.yaml).

### Steps to Fix:

#### 1. Go to Render Dashboard
- Visit: https://dashboard.render.com/
- Find your service: **bebrand-api**
- Click on it

#### 2. Update Start Command
- Go to **Settings** tab
- Scroll to **Build & Deploy** section
- Find **Start Command**
- Change from: `npm run start` or `npm install; npm run build`
- Change to: `npm run start:prod`

#### 3. Update Build Command (if needed)
- **Build Command** should be: `npm install --legacy-peer-deps && npm run build`
- **Start Command** should be: `npm run start:prod`

#### 4. Save and Redeploy
- Click **Save Changes**
- Go to **Manual Deploy** → **Deploy latest commit**

---

## 📝 Correct Configuration

### In Render Dashboard:

```yaml
Build Command:
npm install --legacy-peer-deps && npm run build

Start Command:
npm run start:prod
```

### Environment Variables (add these in Render Dashboard):

```
NODE_ENV=production
PORT=3000
JWT_SECRET=99c73b0b9f43879805fa785d0057e402548faeac155dc913312bcc153c82f0408cd583a6f2c8790cb72c3ac64175d5980728fb27c97cee9b9871e8462120aead
JWT_EXPIRATION=7d
MONGODB_URI=mongodb+srv://bebrand:0rWTao4KTjEwj8Ok@cluster0.duyus4s.mongodb.net/bebrand?retryWrites=true&w=majority&appName=Cluster0
```

---

## 🔍 Why This Matters

| Command | What It Does | Status |
|---------|--------------|---------|
| `npm run start` | Runs `nest start` (development, watches files) | ❌ Wrong for production |
| `npm run start:prod` | Runs `node dist/main` (production, built files) | ✅ Correct for production |

The error "Exited with status 134" happens because:
- ❌ `nest start` tries to compile TypeScript on-the-fly
- ❌ This fails in production without dev dependencies
- ✅ `node dist/main` runs pre-compiled JavaScript

---

## 🚀 Quick Fix Steps

### Option 1: Via Render Dashboard (Recommended)
1. Dashboard → Your Service → Settings
2. **Start Command**: `npm run start:prod`
3. Save → Manual Deploy

### Option 2: Delete and Recreate Service
1. Delete current service
2. Create new Web Service
3. Connect GitHub repo: `arkade-01/bebrand`
4. Set **Build Command**: `npm install --legacy-peer-deps && npm run build`
5. Set **Start Command**: `npm run start:prod`
6. Add all environment variables
7. Deploy

---

## ⚠️ Important: Environment Variables

Make sure these are set in Render Dashboard → Environment Variables:

```bash
# Required
NODE_ENV=production
JWT_SECRET=99c73b0b9f43879805fa785d0057e402548faeac155dc913312bcc153c82f0408cd583a6f2c8790cb72c3ac64175d5980728fb27c97cee9b9871e8462120aead
MONGODB_URI=mongodb+srv://bebrand:0rWTao4KTjEwj8Ok@cluster0.duyus4s.mongodb.net/bebrand?retryWrites=true&w=majority&appName=Cluster0

# Optional (has defaults)
PORT=3000
JWT_EXPIRATION=7d
```

**Note**: Don't forget to whitelist `0.0.0.0/0` in MongoDB Atlas → Network Access!

---

## 🧪 After Fixing

You should see in the logs:
```
> bebrand@0.0.1 start:prod
> node dist/main

[Nest] 93  - LOG [NestFactory] Starting Nest application...
[Nest] 93  - LOG [InstanceLoader] AppModule dependencies initialized
[Nest] 93  - LOG [InstanceLoader] ConfigModule dependencies initialized
[Nest] 93  - LOG [InstanceLoader] MongooseModule dependencies initialized
[Nest] 93  - LOG [RoutesResolver] AppController {/}
✅ Application is running on: http://0.0.0.0:3000
```

Then your API will be live at:
- https://bebrand-eoo2.onrender.com/
- https://bebrand-eoo2.onrender.com/api/docs

---

## 📋 Checklist

Before redeploying, verify:
- ✅ Build Command: `npm install --legacy-peer-deps && npm run build`
- ✅ Start Command: `npm run start:prod`
- ✅ Environment variables added (JWT_SECRET, MONGODB_URI, etc.)
- ✅ MongoDB Atlas IP whitelist: `0.0.0.0/0`
- ✅ Repository connected: `arkade-01/bebrand`
- ✅ Branch: `master`

---

## 🎯 Summary

**Problem**: Wrong start command (`npm run start` instead of `npm run start:prod`)

**Solution**: Update Start Command in Render Dashboard to `npm run start:prod`

**Result**: App will run production build and start successfully! 🎊

---

**Next Step**: Go to Render Dashboard and update the Start Command!
