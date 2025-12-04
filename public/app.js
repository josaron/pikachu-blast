// Logging utility for frontend
const frontendLogger = {
  logQueue: [],
  isInitialized: false,
  
  async sendToBackend(level, message, stack = null, additionalData = null) {
    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          level,
          message,
          stack,
          data: additionalData
        })
      });
    } catch (error) {
      // If backend is unavailable, queue the log
      this.logQueue.push({ level, message, stack, additionalData });
    }
  },
  
  async flushQueue() {
    if (this.logQueue.length === 0) return;
    
    const queue = [...this.logQueue];
    this.logQueue = [];
    
    for (const log of queue) {
      await this.sendToBackend(log.level, log.message, log.stack, log.additionalData);
    }
  },
  
  init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    // Intercept console methods
    const originalConsole = {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console)
    };
    
    console.log = (...args) => {
      originalConsole.log(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      this.sendToBackend('INFO', message, null, { args });
    };
    
    console.error = (...args) => {
      originalConsole.error(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      const stack = new Error().stack;
      this.sendToBackend('ERROR', message, stack, { args });
    };
    
    console.warn = (...args) => {
      originalConsole.warn(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      this.sendToBackend('WARN', message, null, { args });
    };
    
    console.info = (...args) => {
      originalConsole.info(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      this.sendToBackend('INFO', message, null, { args });
    };
    
    console.debug = (...args) => {
      originalConsole.debug(...args);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      this.sendToBackend('DEBUG', message, null, { args });
    };
    
    // Flush queue periodically
    setInterval(() => this.flushQueue(), 5000);
    
    // Flush queue on page unload
    window.addEventListener('beforeunload', () => {
      this.flushQueue();
    });
  }
};

// Intensity levels
const INTENSITY_LEVELS = ['low', 'medium', 'high', 'extreme'];
const INTENSITY_WEIGHTS = [0.4, 0.3, 0.2, 0.1]; // Probability distribution

// Lightning colors for each intensity
const LIGHTNING_COLORS = {
    low: '#FFFF00',
    medium: '#FFD700',
    high: '#FF8C00',
    extreme: '#FF0000'
};

// Sound frequencies for each intensity (Web Audio API)
const SOUND_FREQUENCIES = {
    low: 200,
    medium: 400,
    high: 600,
    extreme: 800
};

let audioContext;
let scores = {
    low: 0,
    medium: 0,
    high: 0,
    extreme: 0
};

// Initialize audio context
function initAudio() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        console.log('Audio context initialized successfully');
    } catch (e) {
        console.warn('Web Audio API not supported', e);
    }
}

// Generate random intensity based on weights
function getRandomIntensity() {
    const random = Math.random();
    let cumulative = 0;
    
    for (let i = 0; i < INTENSITY_WEIGHTS.length; i++) {
        cumulative += INTENSITY_WEIGHTS[i];
        if (random <= cumulative) {
            return INTENSITY_LEVELS[i];
        }
    }
    return INTENSITY_LEVELS[INTENSITY_LEVELS.length - 1];
}

// Play sound based on intensity
function playSound(intensity) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = SOUND_FREQUENCIES[intensity];
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// Draw lightning effect
function drawLightning(canvas, intensity) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const pikachuY = centerY - 50; // Approximate Pikachu position
    
    const color = LIGHTNING_COLORS[intensity];
    const branches = intensity === 'low' ? 3 : intensity === 'medium' ? 5 : intensity === 'high' ? 7 : 10;
    const duration = intensity === 'low' ? 300 : intensity === 'medium' ? 400 : intensity === 'high' ? 500 : 700;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    function drawBolt(x1, y1, x2, y2, depth) {
        if (depth > 8) return;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        
        ctx.lineTo(midX + offsetX, midY + offsetY);
        ctx.lineTo(x2, y2);
        
        ctx.strokeStyle = color;
        ctx.lineWidth = depth === 0 ? 4 : 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = color;
        ctx.stroke();
        
        if (depth < branches) {
            const angle = Math.atan2(y2 - y1, x2 - x1);
            const branchAngle = (Math.random() - 0.5) * Math.PI / 3;
            const branchLength = Math.random() * 50 + 30;
            const branchX = midX + Math.cos(angle + branchAngle) * branchLength;
            const branchY = midY + Math.sin(angle + branchAngle) * branchLength;
            
            drawBolt(midX + offsetX, midY + offsetY, branchX, branchY, depth + 1);
        }
        
        drawBolt(midX + offsetX, midY + offsetY, x2, y2, depth + 1);
    }
    
    // Draw multiple lightning bolts
    for (let i = 0; i < branches; i++) {
        const angle = (Math.PI * 2 * i) / branches;
        const length = 200 + Math.random() * 100;
        const endX = centerX + Math.cos(angle) * length;
        const endY = pikachuY + Math.sin(angle) * length;
        
        drawBolt(centerX, pikachuY, endX, endY, 0);
    }
    
    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, duration);
}

// Handle Pikachu click
async function handlePikachuClick() {
    const intensity = getRandomIntensity();
    const canvas = document.getElementById('lightningCanvas');
    const pikachuContainer = document.getElementById('pikachuContainer');
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Add shake animation
    pikachuContainer.classList.add('shake');
    setTimeout(() => {
        pikachuContainer.classList.remove('shake');
    }, 300);
    
    // Draw lightning
    drawLightning(canvas, intensity);
    
    // Play sound
    playSound(intensity);
    
    // Send to backend
    try {
        const response = await fetch('/api/blast', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ intensity })
        });
        
        const data = await response.json();
        if (data.success) {
            updateScores(data.scores);
        }
    } catch (error) {
        console.error('Error recording blast:', error);
        // Update local scores anyway
        scores[intensity]++;
        updateScores(scores);
    }
    
    console.log(`Lightning blast triggered: ${intensity} intensity`);
}

// Update score display
function updateScores(newScores) {
    scores = newScores;
    document.getElementById('lowScore').textContent = scores.low;
    document.getElementById('mediumScore').textContent = scores.medium;
    document.getElementById('highScore').textContent = scores.high;
    document.getElementById('extremeScore').textContent = scores.extreme;
}

// Load initial scores
async function loadScores() {
    try {
        console.log('Loading initial scores from backend');
        const response = await fetch('/api/scores');
        const data = await response.json();
        updateScores(data);
        console.log('Scores loaded successfully', data);
    } catch (error) {
        console.error('Error loading scores:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize frontend logging first
    frontendLogger.init();
    console.log('Pika-Blast frontend initialized');
    
    initAudio();
    loadScores();
    
    // Use SVG as fallback if PNG doesn't exist
    const pikachu = document.getElementById('pikachu');
    pikachu.addEventListener('error', function() {
        // If PNG fails to load, try SVG
        if (this.src.endsWith('.png')) {
            console.warn('PNG image failed to load, falling back to SVG');
            this.src = 'pikachu.svg';
        }
    });
    
    pikachu.addEventListener('click', handlePikachuClick);
    console.log('Pikachu click handler attached');
    
    // Handle window resize
    window.addEventListener('resize', () => {
        const canvas = document.getElementById('lightningCanvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        console.debug('Canvas resized', { width: canvas.width, height: canvas.height });
    });
    
    console.info('Application fully initialized');
});

