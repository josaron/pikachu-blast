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

// Draw static electricity graphic
function drawLightning(canvas, intensity) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const pikachuY = centerY - 50; // Approximate Pikachu position
    
    // Calculate screen dimensions for scaling
    const screenSize = Math.min(canvas.width, canvas.height);
    const graphicRadius = screenSize * 0.25; // Cover roughly half the screen
    
    const color = LIGHTNING_COLORS[intensity];
    // Duration based on intensity: Low=300ms, Medium=500ms, High=750ms, Extreme=1000ms
    const duration = intensity === 'low' ? 300 : intensity === 'medium' ? 500 : intensity === 'high' ? 750 : 1000;
    
    // Intensity display text
    const intensityText = intensity.toUpperCase();
    const intensityEmojis = {
        low: '⚡',
        medium: '⚡⚡',
        high: '⚡⚡⚡',
        extreme: '⚡⚡⚡⚡'
    };
    const displayText = `${intensityEmojis[intensity]} ${intensityText}`;
    
    // Function to draw static electricity sparks
    function drawStaticElectricity(scale, alpha) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 20 * scale;
        ctx.shadowColor = color;
        ctx.lineCap = 'round';
        
        const centerXPos = centerX;
        const centerYPos = pikachuY;
        const radius = graphicRadius * scale;
        
        // Center sparks (vertical, horizontal, diagonal)
        ctx.lineWidth = 4 * scale;
        ctx.beginPath();
        ctx.moveTo(centerXPos, centerYPos);
        ctx.lineTo(centerXPos, centerYPos - radius * 0.5);
        ctx.moveTo(centerXPos, centerYPos);
        ctx.lineTo(centerXPos, centerYPos + radius * 0.5);
        ctx.moveTo(centerXPos, centerYPos);
        ctx.lineTo(centerXPos - radius * 0.5, centerYPos);
        ctx.moveTo(centerXPos, centerYPos);
        ctx.lineTo(centerXPos + radius * 0.5, centerYPos);
        ctx.stroke();
        
        // Diagonal center sparks
        ctx.lineWidth = 3 * scale;
        ctx.beginPath();
        const diagDist = radius * 0.35;
        ctx.moveTo(centerXPos, centerYPos);
        ctx.lineTo(centerXPos - diagDist, centerYPos - diagDist);
        ctx.moveTo(centerXPos, centerYPos);
        ctx.lineTo(centerXPos + diagDist, centerYPos - diagDist);
        ctx.moveTo(centerXPos, centerYPos);
        ctx.lineTo(centerXPos - diagDist, centerYPos + diagDist);
        ctx.moveTo(centerXPos, centerYPos);
        ctx.lineTo(centerXPos + diagDist, centerYPos + diagDist);
        ctx.stroke();
        
        // Outer ring sparks (8 directions)
        ctx.lineWidth = 3 * scale;
        const angles = [0, Math.PI / 4, Math.PI / 2, 3 * Math.PI / 4, Math.PI, 5 * Math.PI / 4, 3 * Math.PI / 2, 7 * Math.PI / 4];
        angles.forEach((angle, i) => {
            const x = centerXPos + Math.cos(angle) * radius;
            const y = centerYPos + Math.sin(angle) * radius;
            
            ctx.beginPath();
            // Main spark
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * radius * 0.2, y + Math.sin(angle) * radius * 0.2);
            // Side sparks
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle + Math.PI / 2) * radius * 0.15, y + Math.sin(angle + Math.PI / 2) * radius * 0.15);
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle - Math.PI / 2) * radius * 0.15, y + Math.sin(angle - Math.PI / 2) * radius * 0.15);
            ctx.stroke();
        });
        
        // Scattered spark points
        ctx.lineWidth = 1;
        const sparkPoints = [
            [centerXPos - radius * 0.4, centerYPos - radius * 0.3],
            [centerXPos + radius * 0.4, centerYPos - radius * 0.3],
            [centerXPos + radius * 0.6, centerYPos],
            [centerXPos + radius * 0.4, centerYPos + radius * 0.3],
            [centerXPos - radius * 0.4, centerYPos + radius * 0.3],
            [centerXPos - radius * 0.6, centerYPos],
        ];
        sparkPoints.forEach(([x, y]) => {
            ctx.beginPath();
            ctx.arc(x, y, 3 * scale, 0, Math.PI * 2);
            ctx.fill();
        });
        
        ctx.restore();
    }
    
    // Animate intensity text with pulsing effect
    const textY = centerY + 100;
    const fontSize = Math.max(48, screenSize * 0.08); // Responsive font size
    let startTime = Date.now();
    let animationFrameId;
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw colored overlay
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.15 * (1 - progress * 0.5);
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
        
        // Draw static electricity with pulsing effect
        const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
        const graphicAlpha = progress < 0.1 ? progress * 10 : (progress > 0.9 ? (1 - progress) * 10 : 1);
        drawStaticElectricity(pulse, graphicAlpha);
        
        // Draw intensity text with pulsing effect
        const currentFontSize = fontSize * pulse;
        const textAlpha = progress < 0.1 ? progress * 10 : (progress > 0.9 ? (1 - progress) * 10 : 1);
        
        ctx.save();
        ctx.font = `bold ${currentFontSize}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Text shadow/glow effect
        ctx.shadowBlur = 30;
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.globalAlpha = textAlpha;
        
        // Draw text with outline for visibility
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.lineWidth = 4;
        ctx.strokeText(displayText, centerX, textY);
        ctx.fillText(displayText, centerX, textY);
        
        ctx.restore();
        
        if (progress < 1) {
            animationFrameId = requestAnimationFrame(animate);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    // Start animation
    animate();
    
    // Cleanup after duration
    setTimeout(() => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
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

