/**
 * USELESS MAZE - Neon Arcade Labyrinth
 * Feature: Start point with Key, End point with Door.
 * Troll Mechanic: Door relocates to the furthest reachable cell when the player gets next to it!
 */

(function () {
  'use strict';

  // --- AUDIO SYNTHESIZER (Web Audio API) ---
  class SoundFX {
    constructor() {
      this.ctx = null;
      this.muted = false;
      this.initAudio();
    }

    initAudio() {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }

    resume() {
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    playMove() {
      if (this.muted || !this.ctx) return;
      this.resume();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      } catch (e) {}
    }

    playKey() {
      if (this.muted || !this.ctx) return;
      this.resume();
      try {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const startTime = this.ctx.currentTime + idx * 0.07;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.12, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.2);
        });
      } catch (e) {}
    }

    playTroll() {
      if (this.muted || !this.ctx) return;
      this.resume();
      try {
        // Comedic cyber slide / cartoon whoosh
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, this.ctx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.35);

        // Secondary taunt chirp
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(260, this.ctx.currentTime + 0.1);
        osc2.frequency.linearRampToValueAtTime(620, this.ctx.currentTime + 0.25);
        osc2.frequency.linearRampToValueAtTime(300, this.ctx.currentTime + 0.4);

        gain2.gain.setValueAtTime(0.08, this.ctx.currentTime + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.4);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(this.ctx.currentTime + 0.1);
        osc2.stop(this.ctx.currentTime + 0.4);
      } catch (e) {}
    }

    playBump() {
      if (this.muted || !this.ctx) return;
      this.resume();
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(110, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.08);

        gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
      } catch (e) {}
    }

    playLagRewind() {
      if (this.muted || !this.ctx) return;
      this.resume();
      try {
        const now = this.ctx.currentTime;
        // High-to-low glitch sweep
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(700, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.22);

        // Low electric chirp
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(150, now + 0.04);
        osc2.frequency.exponentialRampToValueAtTime(70, now + 0.2);

        gain2.gain.setValueAtTime(0.1, now + 0.04);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.04);
        osc2.stop(now + 0.2);
      } catch (e) {}
    }

    playWin() {
      if (this.muted || !this.ctx) return;
      this.resume();
      try {
        const fanfare = [
          { f: 523.25, d: 0.12 },
          { f: 659.25, d: 0.12 },
          { f: 783.99, d: 0.14 },
          { f: 1046.5, d: 0.35 }
        ];
        let t = this.ctx.currentTime;
        fanfare.forEach(note => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.f, t);

          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + note.d);
          t += note.d * 0.9;
        });
      } catch (e) {}
    }

    playQuip() {
      if (this.muted || !this.ctx) return;
      this.resume();
      try {
        const now = this.ctx.currentTime;
        // Comedic cartoon boing / spring taunt
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.12);
        osc.frequency.exponentialRampToValueAtTime(240, now + 0.28);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);

        // Sub sparkle pop
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(800, now + 0.08);
        osc2.frequency.linearRampToValueAtTime(1200, now + 0.2);

        gain2.gain.setValueAtTime(0.06, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.25);
      } catch (e) {}
    }
  }

  // --- AMBIENT BACKGROUND CANVAS PARTICLES ---
  class AmbientBackground {
    constructor(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.nodes = [];
      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.initNodes();
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);
    }

    resize() {
      if (!this.canvas) return;
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }

    initNodes() {
      const count = Math.min(45, Math.floor((window.innerWidth * window.innerHeight) / 25000));
      this.nodes = [];
      for (let i = 0; i < count; i++) {
        this.nodes.push({
          x: Math.random() * this.canvas.width,
          y: Math.random() * this.canvas.height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2 + 1,
          alpha: Math.random() * 0.4 + 0.15
        });
      }
    }

    animate() {
      if (!this.canvas) return;
      const ctx = this.ctx;
      const w = this.canvas.width;
      const h = this.canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Update & Draw nodes
      for (let i = 0; i < this.nodes.length; i++) {
        const p = this.nodes[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = h;

        ctx.fillStyle = `rgba(0, 243, 255, ${ p.alpha })`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        // Connect nearby nodes
        for (let j = i + 1; j < this.nodes.length; j++) {
          const p2 = this.nodes[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.strokeStyle = `rgba(0, 243, 255, ${(1 - dist / 130) * 0.12})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(this.animate);
    }
  }

  // --- PROCEDURAL MAZE GENERATOR ---
  class MazeGenerator {
    static generate(cols, rows) {
      if (cols % 2 === 0) cols++;
      if (rows % 2 === 0) rows++;

      const grid = Array.from({ length: rows }, () => Array(cols).fill(1));

      const stack = [];
      const startX = 1;
      const startY = 1;
      grid[startY][startX] = 0;
      stack.push([startX, startY]);

      const dirs = [
        [0, -2], // Up
        [0, 2],  // Down
        [-2, 0], // Left
        [2, 0]   // Right
      ];

      while (stack.length > 0) {
        const [cx, cy] = stack[stack.length - 1];
        const neighbors = [];

        for (const [dx, dy] of dirs) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx > 0 && nx < cols - 1 && ny > 0 && ny < rows - 1 && grid[ny][nx] === 1) {
            neighbors.push([nx, ny, cx + dx / 2, cy + dy / 2]);
          }
        }

        if (neighbors.length > 0) {
          const [nx, ny, wallX, wallY] = neighbors[Math.floor(Math.random() * neighbors.length)];
          grid[wallY][wallX] = 0;
          grid[ny][nx] = 0;
          stack.push([nx, ny]);
        } else {
          stack.pop();
        }
      }

      return { grid, cols, rows };
    }

    static findFurthestCell(grid, startX, startY) {
      const rows = grid.length;
      const cols = grid[0].length;
      const dist = Array.from({ length: rows }, () => Array(cols).fill(-1));
      const queue = [[startX, startY]];
      dist[startY][startX] = 0;

      let maxDist = 0;
      let furthestCells = [{ x: startX, y: startY }];

      const dirs = [
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0]
      ];

      while (queue.length > 0) {
        const [cx, cy] = queue.shift();
        const curD = dist[cy][cx];

        for (const [dx, dy] of dirs) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            if (grid[ny][nx] === 0 && dist[ny][nx] === -1) {
              dist[ny][nx] = curD + 1;
              queue.push([nx, ny]);

              if (curD + 1 > maxDist) {
                maxDist = curD + 1;
                furthestCells = [{ x: nx, y: ny }];
              } else if (curD + 1 === maxDist) {
                furthestCells.push({ x: nx, y: ny });
              }
            }
          }
        }
      }

      const chosen = furthestCells[Math.floor(Math.random() * furthestCells.length)];
      return {
        cell: chosen,
        maxDist,
        distMap: dist
      };
    }
  }

  // --- PARTICLE SYSTEM ---
  class ParticleSystem {
    constructor() {
      this.particles = [];
    }

    spawnPoof(x, y, color = '#ff0077', count = 28) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.2;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 4 + 2,
          color,
          alpha: 1,
          decay: Math.random() * 0.03 + 0.02,
          shape: Math.random() > 0.5 ? 'circle' : 'square'
        });
      }
    }

    spawnSparkles(x, y, color = '#ffb703', count = 15) {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2 + 0.5;
        this.particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          size: Math.random() * 3 + 1.5,
          color,
          alpha: 1,
          decay: Math.random() * 0.02 + 0.015,
          shape: 'sparkle'
        });
      }
    }

    spawnTrail(x, y, color = '#00f3ff') {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 4,
        y: y + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 3 + 2,
        color,
        alpha: 0.65,
        decay: 0.04,
        shape: 'circle'
      });
    }

    spawnLagGlitch(fromX, fromY, toX, toY, count = 22) {
      for (let i = 0; i < count; i++) {
        const t = Math.random();
        const px = fromX + (toX - fromX) * t + (Math.random() - 0.5) * 16;
        const py = fromY + (toY - fromY) * t + (Math.random() - 0.5) * 16;
        this.particles.push({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 2.5,
          vy: (Math.random() - 0.5) * 2.5,
          size: Math.random() * 4 + 2,
          color: Math.random() > 0.4 ? '#ff7700' : '#ffca3a',
          alpha: 1,
          decay: Math.random() * 0.04 + 0.03,
          shape: 'square'
        });
      }
    }

    update() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.size *= 0.96;
        if (p.alpha <= 0 || p.size <= 0.3) {
          this.particles.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      for (const p of this.particles) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;

        if (p.shape === 'circle') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === 'square') {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        } else if (p.shape === 'sparkle') {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size * 1.5);
          ctx.lineTo(p.x + p.size, p.y);
          ctx.lineTo(p.x, p.y + p.size * 1.5);
          ctx.lineTo(p.x - p.size, p.y);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
      }
    }
  }

  // --- MAIN GAME CONTROLLER ---
  class UselessMazeGame {
    constructor() {
      // DOM references
      this.canvas = document.getElementById('maze-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.wrapper = document.querySelector('.canvas-wrapper');

      this.hudTimer = document.getElementById('hud-timer');
      this.hudMoves = document.getElementById('hud-moves');
      this.hudKey = document.getElementById('hud-key');
      this.hudEscapes = document.getElementById('hud-escapes');
      this.difficultySelect = document.getElementById('difficulty-select');
      this.modeSelect = document.getElementById('mode-select');

      this.btnAudio = document.getElementById('btn-audio');
      this.iconSoundOn = document.getElementById('icon-sound-on');
      this.iconSoundOff = document.getElementById('icon-sound-off');
      this.btnNewGame = document.getElementById('btn-new-game');

      this.trollToast = document.getElementById('troll-toast');
      this.trollToastTitle = document.getElementById('troll-toast-title');
      this.trollToastSub = document.getElementById('troll-toast-sub');
      this.keyToast = document.getElementById('key-toast');
      this.lagToast = document.getElementById('lag-toast');
      this.lagToastTitle = document.getElementById('lag-toast-title');
      this.lagToastSub = document.getElementById('lag-toast-sub');

      this.hudLagTimer = document.getElementById('hud-lag-timer');
      this.lagMeterBar = document.getElementById('lag-meter-bar');
      this.hudRewinds = document.getElementById('hud-rewinds');

      this.victoryModal = document.getElementById('victory-modal');
      this.winTime = document.getElementById('win-time');
      this.winSteps = document.getElementById('win-steps');
      this.winEscapes = document.getElementById('win-escapes');
      this.winRewinds = document.getElementById('win-rewinds');
      this.btnPlayAgain = document.getElementById('btn-play-again');

      // Big Useless Commentary Pop-up Elements
      this.uselessPopup = document.getElementById('useless-popup');
      this.uselessPopupGlow = document.getElementById('useless-popup-glow');
      this.uselessPopupClose = document.getElementById('useless-popup-close');
      this.uselessPopupEmoji = document.getElementById('useless-popup-emoji');
      this.uselessPopupTag = document.getElementById('useless-popup-tag');
      this.uselessPopupTitle = document.getElementById('useless-popup-title');
      this.uselessPopupSub = document.getElementById('useless-popup-sub');
      this.uselessPopupProgress = document.getElementById('useless-popup-progress');
      this.commentaryTimeout = null;
      this.commentaryCloseTimeout = null;
      this.periodicCommentaryInterval = null;
      this.lastCommentaryIndex = -1;
      this.lastMoveTimestamp = 0;

      // Audio & VFX
      this.sound = new SoundFX();
      this.particles = new ParticleSystem();

      // State
      this.difficultySizes = {
        easy: 11,
        medium: 17,
        hard: 25,
        insane: 33
      };

      this.cols = 17;
      this.rows = 17;
      this.grid = [];
      this.cellSize = 0;
      this.offsetX = 0;
      this.offsetY = 0;

      this.player = {
        x: 1,
        y: 1,
        renderX: 1,
        renderY: 1,
        dirX: 1,
        dirY: 0,
        targetAngle: 0,
        renderAngle: 0
      };

      this.startPos = { x: 1, y: 1 };
      this.doorPos = { x: 1, y: 1 };

      this.hasKey = true; 
      this.doorEscapesCount = 0;
      this.doorExhausted = false; 
      this.isGameOver = false;

      // 1-Second Lag Rewind Mechanic
      this.moveHistory = [{ x: 1, y: 1 }];
      this.lastMoveTime = 0;
      this.lagRewindCount = 0;
      this.lagThresholdMs = 1000; 
      this.lagToastTimeout = null;

      // Sarcastic Comment Trigger States
      this.lastInputTime = 0;
      this.wallBumpsCount = 0;
      this.hasTriggeredFirstMoveSnark = false;

      // HUD Stats
      this.movesCount = 0;
      this.startTime = null;
      this.timerInterval = null;
      this.elapsedSeconds = 0;

      // Troll Messages
      this.trollMessages = [
        { title: "NOPE! 🏃‍♂️💨", sub: "The door saw the key coming and fled!" },
        { title: "DOOR RUNS AWAY!", sub: "Relocated to the furthest corridor!" },
        { title: "TOO SLOW!", sub: "The door won't let the key unlock it that easily!" },
        { title: "PSYCHE!", sub: "Slip sliding away into the deep labyrinth!" },
        { title: "ACCESS RELOCATED!", sub: "The door teleported across the maze!" },
        { title: "NICE TRY, KEY!", sub: "Corner the door to unlock it!" },
        { title: "ZOOM! ⚡", sub: "Catch that door if you can!" }
      ];

      // Curated Useless & Funny Commentary Catalog (Big size popups with emojis)
      this.uselessComments = [
        // User explicitly requested quotes
        { emoji: "🥱🛋️", title: "AREN'T YOU EXHAUSTED?", sub: "Your couch misses you deeply. Go take a nap.", theme: "pink" },
        { emoji: "🚶‍♂️❓", title: "WHY ARE YOU CONTINUING?", sub: "There is literally no prize waiting at the end.", theme: "cyan" },
        { emoji: "🤷‍♂️📉", title: "IF YOU WIN, IT MEANS NOTHING.", sub: "Zero accomplishments will be recorded in the universe.", theme: "amber" },

        // Additional hilarious useless, demotivational & existential roasts
        { emoji: "⏳🤡", title: "IMAGINE SPENDING FINITE LIFESPAN HERE.", sub: "Every second in this maze is gone forever. Poof.", theme: "pink" },
        { emoji: "📱😭", title: "YOUR SCREEN TIME REPORT IS CRYING.", sub: "Your phone is embarrassed on your behalf.", theme: "cyan" },
        { emoji: "🌿🌱", title: "HAVE YOU CONSIDERED TOUCHING GRASS?", sub: "It's outside. It's green. It doesn't lag or run away.", theme: "green" },
        { emoji: "🎂🚫", title: "SPOILER: THERE IS NO CAKE.", sub: "Just cold digital neon walls and existential regret.", theme: "pink" },
        { emoji: "👵📞", title: "DOES YOUR MOM KNOW YOU'RE DOING THIS?", sub: "We won't tell her if you promise to rethink your life.", theme: "amber" },
        { emoji: "🎓📉", title: "PEAK COGNITIVE PERFORMANCE DETECTED.", sub: "Is this what your education prepared you for?", theme: "cyan" },
        { emoji: "🧘‍♂️💀", title: "WHY RUN? JUST SIT AND CONTEMPLATE.", sub: "Inner peace is far superior to chasing fleeing doors.", theme: "pink" },
        { emoji: "🏆💩", title: "ACHIEVEMENT: POINTLESS PERSISTENCE!", sub: "Congratulations! You've successfully wasted another minute.", theme: "amber" },
        { emoji: "🌀🪤", title: "YOU ARE TRAPPED WITH YOUR CHOICES.", sub: "This labyrinth is a visual metaphor for your schedule.", theme: "cyan" },
        { emoji: "🧱🥺", title: "EVEN THE WALLS FEEL BAD FOR YOU.", sub: "They whispered that you should go take a breather.", theme: "pink" },
        { emoji: "🤖💤", title: "ERROR 404: PURPOSE OF LIFE NOT FOUND.", sub: "Rebooting existential motivation... 0% complete.", theme: "cyan" },
        { emoji: "🏃‍♂️💨", title: "BRO IS REALLY SWEATING OVER A NEON KEY.", sub: "Hydrate yourself, champion. You're going nowhere fast.", theme: "amber" },
        { emoji: "🧭🗑️", title: "ZERO TRAJECTORY DETECTED.", sub: "Statistically speaking, you are just walking in circles.", theme: "pink" },
        { emoji: "🛑✋", title: "YOU COULD BE LEARNING A LANGUAGE.", sub: "Bonjour? Hola? Nope, just wandering around neon tiles.", theme: "cyan" },
        { emoji: "💸📉", title: "YOUR PRODUCTIVITY STOCKS ARE CRASHING.", sub: "Sell! Sell! Sell!", theme: "pink" },
        { emoji: "👀🧱", title: "STARING CONTEST WITH A NEON WALL?", sub: "Spoiler: the wall never blinks.", theme: "amber" }
      ];

      this.toastTimeout = null;
      this.keyToastTimeout = null;

      // Bindings
      this.initEvents();
      this.resetGame();

      // Start render loop
      this.lastFrameTime = performance.now();
      this.render = this.render.bind(this);
      requestAnimationFrame(this.render);
    }

    // Dynamic Useless & Funny Commentary Engine (Big Pop-up with emojis)
    showCommentary(customItem) {
      if (this.isGameOver || !this.uselessPopup) return;

      let comment = customItem;
      if (!comment) {
        let idx;
        let attempts = 0;
        do {
          idx = Math.floor(Math.random() * this.uselessComments.length);
          attempts++;
        } while (idx === this.lastCommentaryIndex && attempts < 10);
        this.lastCommentaryIndex = idx;
        comment = this.uselessComments[idx];
      }

      // Clear any pending dismissal timeouts
      if (this.commentaryTimeout) {
        clearTimeout(this.commentaryTimeout);
        this.commentaryTimeout = null;
      }
      if (this.commentaryCloseTimeout) {
        clearTimeout(this.commentaryCloseTimeout);
        this.commentaryCloseTimeout = null;
      }

      // Populate text & emoji
      this.uselessPopupEmoji.textContent = comment.emoji || "🤡💬";
      this.uselessPopupTitle.textContent = comment.title;
      this.uselessPopupSub.textContent = comment.sub;

      // Apply theme
      this.uselessPopup.classList.remove('theme-pink', 'theme-cyan', 'theme-amber', 'theme-green', 'closing', 'active');
      this.uselessPopup.classList.add(`theme-${comment.theme || 'pink'}`);

      // Comedic audio cue
      this.sound.playQuip();

      // Reveal & Trigger CSS keyframe animation
      this.uselessPopup.classList.remove('hidden');
      void this.uselessPopup.offsetWidth;
      this.uselessPopup.classList.add('active');

      // Auto-dismiss countdown (3.5 seconds)
      this.commentaryTimeout = setTimeout(() => {
        this.dismissCommentary();
      }, 3500);
    }

    dismissCommentary() {
      if (!this.uselessPopup || this.uselessPopup.classList.contains('hidden')) return;

      if (this.commentaryTimeout) {
        clearTimeout(this.commentaryTimeout);
        this.commentaryTimeout = null;
      }

      this.uselessPopup.classList.remove('active');
      this.uselessPopup.classList.add('closing');

      if (this.commentaryCloseTimeout) {
        clearTimeout(this.commentaryCloseTimeout);
      }
      this.commentaryCloseTimeout = setTimeout(() => {
        this.uselessPopup.classList.add('hidden');
        this.uselessPopup.classList.remove('closing');
        this.commentaryCloseTimeout = null;
      }, 260);
    }

    initEvents() {
      const updateKeyVisual = (key, isPressed) => {
        const keyMap = {
          'arrowup': ['arrowup', 'w'],
          'w': ['w', 'arrowup'],
          'z': ['w', 'arrowup'],
          'i': ['w', 'arrowup'],
          'arrowdown': ['arrowdown', 's'],
          's': ['s', 'arrowdown'],
          'k': ['s', 'arrowdown'],
          'arrowleft': ['arrowleft', 'a'],
          'a': ['a', 'arrowleft'],
          'q': ['a', 'arrowleft'],
          'j': ['a', 'arrowleft'],
          'arrowright': ['arrowright', 'd'],
          'd': ['d', 'arrowright'],
          'l': ['d', 'arrowright']
        };

        const targetKeys = keyMap[key];
        if (targetKeys) {
          targetKeys.forEach(k => {
            const pill = document.querySelector(`.key-pill[data-key="${k}"]`);
            if (pill) {
              if (isPressed) pill.classList.add('active');
              else pill.classList.remove('active');
            }
          });
        }
      };

      // Close commentary popup on close button or click
      if (this.uselessPopupClose) {
        this.uselessPopupClose.addEventListener('click', (e) => {
          e.stopPropagation();
          this.dismissCommentary();
        });
      }
      if (this.uselessPopup) {
        this.uselessPopup.addEventListener('click', () => {
          this.dismissCommentary();
        });
      }

      window.addEventListener('keydown', (e) => {
        if (this.isGameOver) return;
        const key = e.key.toLowerCase();
        const code = e.code;
        let dx = 0;
        let dy = 0;

        if (key === 'arrowup' || key === 'w' || key === 'z' || key === 'i' || code === 'KeyW') {
          dy = -1;
          updateKeyVisual('arrowup', true);
        }
        else if (key === 'arrowdown' || key === 's' || key === 'k' || code === 'KeyS') {
          dy = 1;
          updateKeyVisual('arrowdown', true);
        }
        else if (key === 'arrowleft' || key === 'a' || key === 'q' || key === 'j' || code === 'KeyA') {
          dx = -1;
          updateKeyVisual('arrowleft', true);
        }
        else if (key === 'arrowright' || key === 'd' || key === 'l' || code === 'KeyD') {
          dx = 1;
          updateKeyVisual('arrowright', true);
        }
        else if (key === 'm') {
          this.toggleAudio();
          return;
        }

        if (dx !== 0 || dy !== 0) {
          e.preventDefault();
          this.movePlayer(dx, dy);
        }
      });

      window.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        updateKeyVisual(key, false);
      });

      const dpadBtns = document.querySelectorAll('.dpad-btn');
      dpadBtns.forEach(btn => {
        const handleDpad = (e) => {
          e.preventDefault();
          if (this.isGameOver) return;
          const dir = btn.getAttribute('data-dir');
          if (dir === 'up') this.movePlayer(0, -1);
          else if (dir === 'down') this.movePlayer(0, 1);
          else if (dir === 'left') this.movePlayer(-1, 0);
          else if (dir === 'right') this.movePlayer(1, 0);
        };
        btn.addEventListener('click', handleDpad);
        btn.addEventListener('touchstart', handleDpad, { passive: false });
      });

      let touchStartX = 0;
      let touchStartY = 0;
      this.canvas.addEventListener('touchstart', (e) => {
        if (e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      this.canvas.addEventListener('touchend', (e) => {
        if (this.isGameOver || e.changedTouches.length === 0) return;
        const dx = e.changedTouches[0].clientX - touchStartX;
        const dy = e.changedTouches[0].clientY - touchStartY;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (Math.max(absX, absY) > 25) {
          if (absX > absY) {
            this.movePlayer(dx > 0 ? 1 : -1, 0);
          } else {
            this.movePlayer(0, dy > 0 ? 1 : -1);
          }
        }
      }, { passive: true });

      this.btnNewGame.addEventListener('click', () => this.resetGame());
      this.btnPlayAgain.addEventListener('click', () => {
        this.victoryModal.classList.add('hidden');
        this.resetGame();
      });

      this.difficultySelect.addEventListener('change', () => this.resetGame());
      this.modeSelect.addEventListener('change', () => {
        this.checkDoorExhaustion();
      });

      this.btnAudio.addEventListener('click', () => this.toggleAudio());
      window.addEventListener('resize', () => this.updateCanvasDimensions());
    }

    toggleAudio() {
      this.sound.muted = !this.sound.muted;
      if (this.sound.muted) {
        this.iconSoundOn.classList.add('hidden');
        this.iconSoundOff.classList.remove('hidden');
      } else {
        this.iconSoundOn.classList.remove('hidden');
        this.iconSoundOff.classList.add('hidden');
        this.sound.resume();
        this.sound.playMove();
      }
    }

    resetGame() {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }
      this.startTime = null;
      this.elapsedSeconds = 0;
      this.movesCount = 0;
      this.doorEscapesCount = 0;
      this.hasKey = true; 
      this.doorExhausted = false;
      this.isGameOver = false;

      // Clear dynamic comments system state
      this.dismissCommentary();
      if (this.periodicCommentaryInterval) {
        clearInterval(this.periodicCommentaryInterval);
        this.periodicCommentaryInterval = null;
      }
      this.lastInputTime = performance.now();
      this.wallBumpsCount = 0;
      this.hasTriggeredFirstMoveSnark = false;

      this.moveHistory = [{ x: 1, y: 1 }];
      this.lastMoveTime = 0;
      this.lagRewindCount = 0;
      if (this.hudRewinds) this.hudRewinds.textContent = '0';
      if (this.hudLagTimer) this.hudLagTimer.textContent = '1.0s';
      if (this.lagMeterBar) {
        this.lagMeterBar.style.width = '100%';
        this.lagMeterBar.className = 'lag-gauge-bar';
      }
      if (this.lagToast) this.lagToast.classList.add('hidden');
      if (this.lagToastTimeout) {
        clearTimeout(this.lagToastTimeout);
        this.lagToastTimeout = null;
      }

      this.victoryModal.classList.add('hidden');
      this.trollToast.classList.add('hidden');
      this.keyToast.classList.add('hidden');

      this.hudTimer.textContent = '00:00';
      this.hudMoves.textContent = '0';
      this.hudEscapes.textContent = '0';
      this.hudKey.textContent = '🗝️ ACTIVE';
      this.hudKey.classList.add('acquired');

      const diff = this.difficultySelect.value || 'medium';
      const size = this.difficultySizes[diff] || 17;
      this.cols = size;
      this.rows = size;

      const { grid } = MazeGenerator.generate(this.cols, this.rows);
      this.grid = grid;

      this.startPos = { x: 1, y: 1 };
      this.player.x = 1;
      this.player.y = 1;
      this.player.renderX = 1;
      this.player.renderY = 1;
      this.player.dirX = 1;
      this.player.dirY = 0;
      this.player.targetAngle = 0;
      this.player.renderAngle = 0;

      const furthest = MazeGenerator.findFurthestCell(this.grid, this.player.x, this.player.y);
      this.doorPos = { x: furthest.cell.x, y: furthest.cell.y };

      this.updateCanvasDimensions();
    }

    startTimerIfNeeded() {
      if (!this.startTime) {
        this.startTime = Date.now();
        this.lastInputTime = performance.now();
        this.timerInterval = setInterval(() => {
          if (this.isGameOver) return;
          this.elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
          const mins = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
          const secs = String(this.elapsedSeconds % 60).padStart(2, '0');
          this.hudTimer.textContent = `${mins}:${secs}`;
        }, 1000);

        // Start periodic useless commentary loop while playing (every 12 seconds)
        if (this.periodicCommentaryInterval) clearInterval(this.periodicCommentaryInterval);
        this.periodicCommentaryInterval = setInterval(() => {
          if (this.isGameOver || !this.startTime) return;
          if (this.uselessPopup && this.uselessPopup.classList.contains('hidden')) {
            this.showCommentary();
          }
        }, 12000);
      }
    }

    updateCanvasDimensions() {
      const rect = this.wrapper.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const displaySize = Math.min(rect.width, rect.height) || 580;

      this.canvas.width = displaySize * dpr;
      this.canvas.height = displaySize * dpr;
      this.ctx.resetTransform();
      this.ctx.scale(dpr, dpr);

      this.cellSize = displaySize / Math.max(this.cols, this.rows);
      this.offsetX = (displaySize - this.cols * this.cellSize) / 2;
      this.offsetY = (displaySize - this.rows * this.cellSize) / 2;
    }

    checkDoorExhaustion() {
      const mode = this.modeSelect.value;
      if (mode === 'catchable' && this.doorEscapesCount >= 3) {
        this.doorExhausted = true;
      } else if (mode === 'troll-5' && this.doorEscapesCount >= 5) {
        this.doorExhausted = true;
      } else {
        this.doorExhausted = false;
      }
    }

    movePlayer(dx, dy) {
      if (this.isGameOver) return;
      this.startTimerIfNeeded();

      // Reset activity timers on input
      this.lastInputTime = performance.now();

      this.player.dirX = dx;
      this.player.dirY = dy;
      if (dx === 1) this.player.targetAngle = 0;
      else if (dx === -1) this.player.targetAngle = Math.PI;
      else if (dy === 1) this.player.targetAngle = Math.PI / 2;
      else if (dy === -1) this.player.targetAngle = -Math.PI / 2;

      const targetX = this.player.x + dx;
      const targetY = this.player.y + dy;

      // Handle Wall collision trigger
      if (
        targetX < 0 ||
        targetX >= this.cols ||
        targetY < 0 ||
        targetY >= this.rows ||
        this.grid[targetY][targetX] === 1
      ) {
        this.sound.playBump();
        this.wallBumpsCount++;
        
        // Sarcastic comments on repetitive wall bumping
        if (this.wallBumpsCount === 5) {
          this.showCommentary({
            emoji: "🧱🥴",
            title: "THE WALL IS SOLID. STOP KISSING IT.",
            sub: "Spoiler alert: kissing the wall does not make it disappear.",
            theme: "pink"
          });
        } else if (this.wallBumpsCount === 9) {
          this.showCommentary({
            emoji: "🧱💥",
            title: "MAYBE 10 MORE BUMPS WILL WORK?",
            sub: "Your forehead must be completely numb by now.",
            theme: "amber"
          });
        }
        return;
      }

      // Reset bump count on successful movement step
      this.wallBumpsCount = 0;

      // Door block check
      if (targetX === this.doorPos.x && targetY === this.doorPos.y) {
        if (!this.doorExhausted) {
          this.triggerDoorFlee();
          return;
        }
      }

      // First Step Comment
      if (!this.hasTriggeredFirstMoveSnark) {
        this.showCommentary({
          emoji: "🚶‍♂️💨",
          title: "LET THE POINTLESS JOURNEY BEGIN.",
          sub: "Every step brings you closer to absolutely nothing.",
          theme: "cyan"
        });
        this.hasTriggeredFirstMoveSnark = true;
      }

      this.player.x = targetX;
      this.player.y = targetY;

      if (this.moveHistory.length >= 2) {
        const prev = this.moveHistory[this.moveHistory.length - 2];
        if (prev.x === targetX && prev.y === targetY) {
          this.moveHistory.pop();
        } else {
          this.moveHistory.push({ x: targetX, y: targetY });
        }
      } else {
        this.moveHistory.push({ x: targetX, y: targetY });
      }
      this.lastMoveTime = performance.now();

      this.movesCount++;
      this.hudMoves.textContent = this.movesCount;
      this.sound.playMove();

      // Step milestone comments (big popups with emojis)
      if (this.movesCount === 15) {
        this.showCommentary({
          emoji: "🚶‍♂️❓",
          title: "WHY ARE YOU CONTINUING?",
          sub: "15 moves in, and there is literally no prize waiting at the end.",
          theme: "cyan"
        });
      } else if (this.movesCount === 35) {
        this.showCommentary({
          emoji: "🤷‍♂️📉",
          title: "IF YOU WIN, IT MEANS NOTHING.",
          sub: "Zero universe accomplishments will be recorded in your name.",
          theme: "amber"
        });
      } else if (this.movesCount === 60) {
        this.showCommentary({
          emoji: "⏳🤡",
          title: "IMAGINE SPENDING FINITE LIFESPAN HERE.",
          sub: "60 steps made. Every second spent on this maze is gone forever.",
          theme: "pink"
        });
      } else if (this.movesCount === 95) {
        this.showCommentary({
          emoji: "🏆💩",
          title: "ACHIEVEMENT: POINTLESS PERSISTENCE!",
          sub: "Almost 100 steps! Your keyboard/fingers must be so proud.",
          theme: "amber"
        });
      }

      // Proximity check to Door
      const distToDoor = Math.abs(this.player.x - this.doorPos.x) + Math.abs(this.player.y - this.doorPos.y);
      if (distToDoor === 1) {
        this.checkDoorExhaustion();
        if (!this.doorExhausted) {
          this.triggerDoorFlee();
        }
      }

      if (this.player.x === this.doorPos.x && this.player.y === this.doorPos.y) {
        if (this.doorExhausted || this.modeSelect.value === 'none') {
          this.handleVictory();
        }
      }
    }

    collectKey() {
      this.hasKey = true;
      this.hudKey.textContent = '🗝️ ACQUIRED';
      this.hudKey.classList.add('acquired');
      this.sound.playKey();

      const cx = this.offsetX + (this.keyPos.x + 0.5) * this.cellSize;
      const cy = this.offsetY + (this.keyPos.y + 0.5) * this.cellSize;
      this.particles.spawnSparkles(cx, cy, '#ffca3a', 30);

      this.showKeyToast();
    }

    showKeyToast() {
      this.keyToast.classList.remove('hidden');
      if (this.keyToastTimeout) clearTimeout(this.keyToastTimeout);
      this.keyToastTimeout = setTimeout(() => {
        this.keyToast.classList.add('hidden');
      }, 2200);
    }

    triggerDoorFlee() {
      this.doorEscapesCount++;
      this.hudEscapes.textContent = this.doorEscapesCount;

      const oldX = this.offsetX + (this.doorPos.x + 0.5) * this.cellSize;
      const oldY = this.offsetY + (this.doorPos.y + 0.5) * this.cellSize;

      this.particles.spawnPoof(oldX, oldY, '#ff0077', 35);
      this.particles.spawnPoof(oldX, oldY, '#00f3ff', 20);

      const furthest = MazeGenerator.findFurthestCell(this.grid, this.player.x, this.player.y);
      this.doorPos = { x: furthest.cell.x, y: furthest.cell.y };

      const newX = this.offsetX + (this.doorPos.x + 0.5) * this.cellSize;
      const newY = this.offsetY + (this.doorPos.y + 0.5) * this.cellSize;

      this.particles.spawnPoof(newX, newY, '#00ff9d', 25);

      this.sound.playTroll();
      this.wrapper.classList.remove('shake');
      void this.wrapper.offsetWidth;
      this.wrapper.classList.add('shake');

      this.checkDoorExhaustion();
      this.showTrollToast();

      // Dynamic Door-escape jokes (big popups with emojis)
      if (this.doorEscapesCount === 2) {
        this.showCommentary({
          emoji: "🚪🤣",
          title: "THE DOOR IS LAUGHING AT YOU!",
          sub: "It sprinted across the maze while giggling at your key.",
          theme: "pink"
        });
      } else if (this.doorEscapesCount === 4) {
        this.showCommentary({
          emoji: "💔🚪",
          title: "THE EXIT DOESN'T LOVE YOU BACK.",
          sub: "It's just not that into you. Why are you still chasing?",
          theme: "cyan"
        });
      }
    }

    showTrollToast() {
      let msg;
      if (this.doorExhausted) {
        msg = {
          title: "DOOR IS TIRED! 🚪💤",
          sub: "The door collapsed from exhaustion! Now's your chance to enter!"
        };
      } else {
        const randIndex = Math.floor(Math.random() * this.trollMessages.length);
        msg = this.trollMessages[randIndex];
      }

      this.trollToastTitle.textContent = msg.title;
      this.trollToastSub.textContent = msg.sub;
      this.trollToast.classList.remove('hidden');

      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        this.trollToast.classList.add('hidden');
      }, 2400);
    }

    triggerLagRewind() {
      if (this.isGameOver || this.moveHistory.length <= 1) return;

      const fromX = this.player.x;
      const fromY = this.player.y;

      this.moveHistory.pop();
      const prev = this.moveHistory[this.moveHistory.length - 1];

      this.player.x = prev.x;
      this.player.y = prev.y;

      const dx = prev.x - fromX;
      const dy = prev.y - fromY;
      if (dx === 1) this.player.targetAngle = 0;
      else if (dx === -1) this.player.targetAngle = Math.PI;
      else if (dy === 1) this.player.targetAngle = Math.PI / 2;
      else if (dy === -1) this.player.targetAngle = -Math.PI / 2;

      this.lagRewindCount++;
      if (this.hudRewinds) this.hudRewinds.textContent = this.lagRewindCount;

      this.sound.playLagRewind();

      const cs = this.cellSize;
      const fromPxX = this.offsetX + (fromX + 0.5) * cs;
      const fromPxY = this.offsetY + (fromY + 0.5) * cs;
      const toPxX = this.offsetX + (prev.x + 0.5) * cs;
      const toPxY = this.offsetY + (prev.y + 0.5) * cs;
      this.particles.spawnLagGlitch(fromPxX, fromPxY, toPxX, toPxY, 24);

      this.wrapper.classList.remove('lag-glitch');
      void this.wrapper.offsetWidth;
      this.wrapper.classList.add('lag-glitch');

      this.showLagToast();

      // Lag Rewind Sarcastic Comments (big popups with emojis)
      if (this.lagRewindCount === 1) {
        this.showCommentary({
          emoji: "⚡⏱️",
          title: "1s HESITATION?! IN THIS ECONOMY?!",
          sub: "Hesitation penalty! Rewound back into the dark corridor.",
          theme: "amber"
        });
      } else if (this.lagRewindCount === 3) {
        this.showCommentary({
          emoji: "⏪🤦‍♂️",
          title: "REWINDING WON'T REWIND LIFE CHOICES.",
          sub: "Time travel achieved, but existential regret remains.",
          theme: "pink"
        });
      } else if (this.lagRewindCount === 6) {
        this.showCommentary({
          emoji: "🤖💤",
          title: "ARE YOU LAGGING OR IS YOUR BRAIN BUFFERING?",
          sub: "6 lag rewinds! Maybe it's time to take a break.",
          theme: "cyan"
        });
      }
    }

    showLagToast() {
      if (!this.lagToast) return;
      this.lagToast.classList.remove('hidden');
      if (this.lagToastTimeout) clearTimeout(this.lagToastTimeout);
      this.lagToastTimeout = setTimeout(() => {
        this.lagToast.classList.add('hidden');
      }, 2000);
    }

    handleVictory() {
      if (!this.hasKey) {
        this.trollToastTitle.textContent = "DOOR IS LOCKED! 🔒";
        this.trollToastSub.textContent = "You need the Golden Key from the start point!";
        this.trollToast.classList.remove('hidden');
        return;
      }

      this.isGameOver = true;
      this.dismissCommentary();
      if (this.periodicCommentaryInterval) {
        clearInterval(this.periodicCommentaryInterval);
        this.periodicCommentaryInterval = null;
      }

      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = null;
      }

      if (this.lagToast) this.lagToast.classList.add('hidden');

      this.sound.playWin();

      const cx = this.offsetX + (this.doorPos.x + 0.5) * this.cellSize;
      const cy = this.offsetY + (this.doorPos.y + 0.5) * this.cellSize;
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          this.particles.spawnSparkles(cx, cy, '#00ff9d', 40);
          this.particles.spawnPoof(cx, cy, '#00f3ff', 30);
        }, i * 200);
      }

      const mins = String(Math.floor(this.elapsedSeconds / 60)).padStart(2, '0');
      const secs = String(this.elapsedSeconds % 60).padStart(2, '0');
      this.winTime.textContent = `${mins}:${secs}`;
      this.winSteps.textContent = this.movesCount;
      this.winEscapes.textContent = this.doorEscapesCount;
      if (this.winRewinds) this.winRewinds.textContent = this.lagRewindCount;

      setTimeout(() => {
        this.victoryModal.classList.remove('hidden');
        this.showCommentary({
          emoji: "🏆💩",
          title: "YOU WON! (IT MEANS NOTHING)",
          sub: "You conquered a pointless maze. Zero real-world impact recorded.",
          theme: "green"
        });
      }, 700);
    }

    // --- RENDERING LOOP ---
    render(now) {
      const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1);
      this.lastFrameTime = now;

      const lerpSpeed = 16 * dt;
      this.player.renderX += (this.player.x - this.player.renderX) * Math.min(lerpSpeed, 1);
      this.player.renderY += (this.player.y - this.player.renderY) * Math.min(lerpSpeed, 1);

      if (this.player.targetAngle !== undefined) {
        let diff = this.player.targetAngle - this.player.renderAngle;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff > Math.PI) diff -= Math.PI * 2;
        this.player.renderAngle += diff * Math.min(18 * dt, 1);
      }

      if (Math.abs(this.player.renderX - this.player.x) > 0.05 || Math.abs(this.player.renderY - this.player.y) > 0.05) {
        const px = this.offsetX + (this.player.renderX + 0.5) * this.cellSize;
        const py = this.offsetY + (this.player.renderY + 0.5) * this.cellSize;
        this.particles.spawnSparkles(px, py, '#ffca3a', 1);
        this.particles.spawnTrail(px, py, '#ffb703');
      }

      // Idle / Exhaustion Comment Checks (User requested: "aren't you exhausted?")
      if (!this.isGameOver && this.startTime !== null) {
        if (now - this.lastInputTime > 7000) { // 7 seconds of zero input
          if (this.uselessPopup && this.uselessPopup.classList.contains('hidden')) {
            const idleComments = [
              { emoji: "🥱🛋️", title: "AREN'T YOU EXHAUSTED?", sub: "7 seconds of zero movement. Your couch misses you deeply.", theme: "pink" },
              { emoji: "👀🧱", title: "STARING CONTEST WITH A NEON WALL?", sub: "Spoiler alert: the wall has never blinked once.", theme: "amber" },
              { emoji: "😴🛏️", title: "TAKING A POWER NAP IN THE LABYRINTH?", sub: "At least find a comfortable digital corner.", theme: "cyan" },
              { emoji: "📱😭", title: "YOUR SCREEN TIME REPORT IS CRYING.", sub: "Your phone is embarrassed on your behalf right now.", theme: "pink" }
            ];
            const chosen = idleComments[Math.floor(Math.random() * idleComments.length)];
            this.showCommentary(chosen);
            this.lastInputTime = now;
          }
        }
      }

      // 1-Second Lag Countdown
      if (!this.isGameOver && this.startTime !== null) {
        if (!this.lastMoveTime) this.lastMoveTime = now;

        const timeSinceMove = now - this.lastMoveTime;
        const remainingMs = Math.max(0, this.lagThresholdMs - timeSinceMove);
        const pct = Math.min(100, Math.max(0, (remainingMs / this.lagThresholdMs) * 100));

        if (this.lagMeterBar) {
          this.lagMeterBar.style.width = `${pct}%`;
          if (pct < 30) {
            this.lagMeterBar.className = 'lag-gauge-bar danger';
          } else if (pct < 60) {
            this.lagMeterBar.className = 'lag-gauge-bar warning';
          } else {
            this.lagMeterBar.className = 'lag-gauge-bar';
          }
        }

        if (this.hudLagTimer) {
          this.hudLagTimer.textContent = (remainingMs / 1000).toFixed(1) + 's';
        }

        if (timeSinceMove >= this.lagThresholdMs) {
          if (this.moveHistory.length > 1) {
            this.triggerLagRewind();
            this.lastMoveTime = now; 
          } else {
            this.lastMoveTime = now;
          }
        }
      }

      this.particles.update();

      const ctx = this.ctx;
      const w = this.canvas.width / (window.devicePixelRatio || 1);
      const h = this.canvas.height / (window.devicePixelRatio || 1);
      ctx.clearRect(0, 0, w, h);

      this.drawMaze(ctx);
      this.drawStartPoint(ctx, now);
      this.drawDoor(ctx, now);
      this.particles.draw(ctx);
      this.drawKeyPlayer(ctx, now);

      requestAnimationFrame(this.render);
    }

    drawMaze(ctx) {
      const cs = this.cellSize;
      const ox = this.offsetX;
      const oy = this.offsetY;

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          const x = ox + c * cs;
          const y = oy + r * cs;

          if (this.grid[r][c] === 1) {
            ctx.fillStyle = '#060810';
            ctx.fillRect(x, y, cs, cs);

            ctx.strokeStyle = 'rgba(0, 243, 255, 0.45)';
            ctx.lineWidth = Math.max(1, cs * 0.08);
            ctx.strokeRect(x + 0.5, y + 0.5, cs - 1, cs - 1);

            ctx.fillStyle = 'rgba(0, 243, 255, 0.04)';
            ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
          } else {
            ctx.fillStyle = 'rgba(12, 16, 26, 0.85)';
            ctx.fillRect(x, y, cs, cs);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.fillRect(x + cs * 0.45, y + cs * 0.45, cs * 0.1, cs * 0.1);
          }
        }
      }
    }

    drawStartPoint(ctx, now) {
      const cs = this.cellSize;
      const x = this.offsetX + (this.startPos.x + 0.5) * cs;
      const y = this.offsetY + (this.startPos.y + 0.5) * cs;

      const pulse = Math.sin(now * 0.003) * 0.15 + 0.85;
      ctx.save();
      ctx.strokeStyle = `rgba(0, 255, 157, ${ 0.4 * pulse })`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, y, cs * 0.38, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = `rgba(0, 255, 157, ${ 0.1 * pulse })`;
      ctx.fill();

      if (cs > 22) {
        ctx.fillStyle = 'rgba(0, 255, 157, 0.7)';
        ctx.font = `600 ${ Math.max(7, cs * 0.22) }px Orbitron, sans - serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('START', x, y + cs * 0.36);
      }
      ctx.restore();
    }

    drawDoor(ctx, now) {
      const cs = this.cellSize;
      const x = this.offsetX + (this.doorPos.x + 0.5) * cs;
      const y = this.offsetY + (this.doorPos.y + 0.5) * cs;

      ctx.save();
      const doorW = cs * 0.72;
      const doorH = cs * 0.82;
      const drawLeft = x - doorW / 2;
      const drawTop = y - doorH / 2;

      const themeColor = this.doorExhausted ? '#00ff9d' : '#ff0077';
      const themeGlow = this.doorExhausted ? 'rgba(0, 255, 157, 0.7)' : 'rgba(255, 0, 119, 0.7)';

      ctx.shadowColor = themeColor;
      ctx.shadowBlur = 12;

      ctx.fillStyle = 'rgba(20, 12, 28, 0.95)';
      ctx.strokeStyle = themeColor;
      ctx.lineWidth = Math.max(2, cs * 0.08);

      ctx.beginPath();
      const rad = doorW * 0.2;
      ctx.roundRect(drawLeft, drawTop, doorW, doorH, [rad, rad, 2, 2]);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = themeGlow;
      const barH = doorH * 0.1;
      ctx.fillRect(drawLeft + doorW * 0.15, drawTop + doorH * 0.25, doorW * 0.7, barH);
      ctx.fillRect(drawLeft + doorW * 0.15, drawTop + doorH * 0.45, doorW * 0.7, barH);
      ctx.fillRect(drawLeft + doorW * 0.15, drawTop + doorH * 0.65, doorW * 0.7, barH);

      const lockY = drawTop + doorH * 0.5;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(drawLeft + doorW * 0.75, lockY, doorW * 0.09, 0, Math.PI * 2);
      ctx.fill();

      if (cs > 22) {
        ctx.fillStyle = themeColor;
        ctx.font = `700 ${ Math.max(7, cs * 0.2) }px Orbitron, sans - serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(this.doorExhausted ? 'OPEN' : 'EXIT', x, drawTop - 2);
      }

      if (!this.doorExhausted) {
        const legWiggle = Math.sin(now * 0.015) * (cs * 0.1);
        ctx.strokeStyle = '#ff0077';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(drawLeft + doorW * 0.3, drawTop + doorH);
        ctx.lineTo(drawLeft + doorW * 0.25 + legWiggle, drawTop + doorH + cs * 0.1);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(drawLeft + doorW * 0.7, drawTop + doorH);
        ctx.lineTo(drawLeft + doorW * 0.75 - legWiggle, drawTop + doorH + cs * 0.1);
        ctx.stroke();
      }

      ctx.restore();
    }

    drawKeyPlayer(ctx, now) {
      const cs = this.cellSize;
      const x = this.offsetX + (this.player.renderX + 0.5) * cs;
      const y = this.offsetY + (this.player.renderY + 0.5) * cs;

      const bob = Math.sin(now * 0.005) * (cs * 0.05);

      ctx.save();
      ctx.translate(x, y + bob);
      ctx.rotate(this.player.renderAngle || 0);

      const auraPulse = Math.sin(now * 0.007) * 0.15 + 0.85;
      const auraGrad = ctx.createRadialGradient(0, 0, cs * 0.05, 0, 0, cs * 0.52);
      auraGrad.addColorStop(0, `rgba(255, 202, 58, ${ 0.45 * auraPulse })`);
      auraGrad.addColorStop(0.5, `rgba(255, 183, 3, ${ 0.15 * auraPulse })`);
      auraGrad.addColorStop(1, 'rgba(255, 183, 3, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(0, 0, cs * 0.52, 0, Math.PI * 2);
      ctx.fill();

      const keyLen = cs * 0.72;
      const bowRadius = keyLen * 0.25;
      const bowCenter = -keyLen * 0.24;
      const shaftH = keyLen * 0.14;
      const shaftStart = bowCenter + bowRadius * 0.6;
      const shaftEnd = keyLen * 0.44;

      ctx.shadowColor = '#ffb703';
      ctx.shadowBlur = 10;

      const keyGrad = ctx.createLinearGradient(bowCenter - bowRadius, 0, shaftEnd, 0);
      keyGrad.addColorStop(0, '#fff3b0');
      keyGrad.addColorStop(0.3, '#ffca3a');
      keyGrad.addColorStop(0.7, '#ff9f1c');
      keyGrad.addColorStop(1, '#e85d04');

      ctx.fillStyle = keyGrad;
      ctx.beginPath();
      ctx.arc(bowCenter, 0, bowRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#060810';
      ctx.beginPath();
      ctx.arc(bowCenter, 0, bowRadius * 0.52, 0, Math.PI * 2);
      ctx.fill();

      const coreGlow = Math.sin(now * 0.01) * 0.25 + 0.75;
      ctx.fillStyle = `rgba(0, 243, 255, ${ coreGlow })`;
      ctx.shadowColor = '#00f3ff';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(bowCenter, 0, bowRadius * 0.3, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowColor = '#ffb703';
      ctx.shadowBlur = 10;
      ctx.fillStyle = keyGrad;
      ctx.beginPath();
      ctx.roundRect(shaftStart, -shaftH / 2, shaftEnd - shaftStart, shaftH, [0, shaftH * 0.4, shaftH * 0.4, 0]);
      ctx.fill();

      const tooth1W = keyLen * 0.11;
      const tooth1H = keyLen * 0.22;
      const tooth1X = shaftEnd - tooth1W - keyLen * 0.12;

      const tooth2W = keyLen * 0.09;
      const tooth2H = keyLen * 0.16;
      const tooth2X = shaftEnd - tooth2W;

      ctx.fillRect(tooth1X, shaftH / 2, tooth1W, tooth1H);
      ctx.fillRect(tooth2X, shaftH / 2, tooth2W, tooth2H);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = Math.max(1, cs * 0.035);
      ctx.beginPath();
      ctx.moveTo(shaftStart, -shaftH / 2 + 1);
      ctx.lineTo(shaftEnd - 2, -shaftH / 2 + 1);
      ctx.stroke();

      ctx.restore();
    }
  }

  // --- INITIALIZE GAME ON DOM READY ---
  window.addEventListener('DOMContentLoaded', () => {
    new AmbientBackground('bg-canvas');
    window.game = new UselessMazeGame();
  });
})();