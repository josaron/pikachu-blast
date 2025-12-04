# Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Add Pikachu Image (Optional)
The app includes an SVG fallback, but for the best experience, add a `pikachu.png` image to the `public/` folder.
- See `public/GET_PIKACHU_IMAGE.md` for details
- The app will work with the included SVG if no PNG is provided

### 2. Build and Run with Docker
```bash
docker-compose up --build
```

### 3. Open Your Browser
Navigate to: http://localhost:3000

Click the Pikachu to create lightning blasts! ⚡

## 📦 What's Included

- ✅ Frontend with interactive Pikachu
- ✅ Lightning animations with 4 intensity levels
- ✅ Sound effects matching intensity
- ✅ Backend API tracking scores
- ✅ Docker containerization
- ✅ Production-ready configuration
- ✅ GitHub Actions CI/CD workflows
- ✅ Health checks and error handling

## 🎮 How It Works

1. Click the Pikachu on the screen
2. Watch the lightning animation (random intensity)
3. Hear the matching sound effect
4. See your scores update in real-time

## 🐳 Production Deployment

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 📊 API Endpoints

- `GET /health` - Health check
- `GET /api/scores` - Get current scores
- `POST /api/blast` - Record a blast (with intensity)

## 🔧 Development

```bash
npm install
npm start
```

For auto-reload:
```bash
npm run dev
```

## 📝 Notes

- Scores are stored in-memory (reset on restart)
- For persistent storage, add a database (see README.md)
- The app includes graceful shutdown handling
- Health checks are configured for container orchestration

