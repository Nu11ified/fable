import React, { useRef, useEffect, useState } from 'react';

interface Obstacle { x: number; width: number; height: number; }

const DinoGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  // Constants
  const height = 150;
  const gravity = 0.6;
  const jumpStrength = -12;
  const dinoWidth = 30;
  const dinoHeight = 30;
  const dinoX = 50;
  const obstacleFreq = 90;
  const cycleLength = 500;

  // Refs for mutable game state
  const dinoYRef = useRef<number>(height - 10 - dinoHeight);
  const velocityRef = useRef<number>(0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const frameRef = useRef<number>(0);
  const animationIdRef = useRef<number>(0);
  const scoreRef = useRef<number>(0);
  const widthRef = useRef<number>(0);

  const resetGame = () => {
    obstaclesRef.current = [];
    frameRef.current = 0;
    dinoYRef.current = height - 10 - dinoHeight;
    velocityRef.current = 0;
    scoreRef.current = 0;
    setGameOver(false);
  };

  const gameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const width = widthRef.current;

    frameRef.current++;
    scoreRef.current++;

    // Day/Night cycle
    const t = (frameRef.current % cycleLength) / cycleLength;
    if (t < 0.5) {
      const tx = (t * 2) * width;
      // sky (transparent) + sun
      ctx.fillStyle = 'yellow';
      ctx.beginPath();
      ctx.arc(tx, 30, 10, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const tm = (t - 0.5) * 2;
      const mx = tm * width;
      ctx.fillStyle = '#ddd';
      ctx.beginPath();
      ctx.arc(mx, 30, 10, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw ground
    ctx.strokeStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, height - 10);
    ctx.lineTo(width, height - 10);
    ctx.stroke();

    // Dino physics
    velocityRef.current += gravity;
    dinoYRef.current = Math.min(
      dinoYRef.current + velocityRef.current,
      height - 10 - dinoHeight
    );

    // Draw dino (simple rectangle)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(dinoX, dinoYRef.current, dinoWidth, dinoHeight);

    // Spawn obstacles (cactuses)
    if (frameRef.current % obstacleFreq === 0) {
      const obsHeight = 20 + Math.random() * 30;
      obstaclesRef.current.push({ x: width, width: 10, height: obsHeight });
    }

    // Move & draw obstacles
    const speed = 5 + scoreRef.current / 100;
    for (const obs of obstaclesRef.current) {
      obs.x -= speed;
      ctx.fillStyle = '#0f0';
      ctx.fillRect(obs.x, height - 10 - obs.height, obs.width, obs.height);
    }

    // Remove off-screen
    obstaclesRef.current = obstaclesRef.current.filter(o => o.x + o.width > 0);

    // Collision detection
    for (const obs of obstaclesRef.current) {
      if (
        obs.x < dinoX + dinoWidth &&
        obs.x + obs.width > dinoX &&
        dinoYRef.current + dinoHeight > height - 10 - obs.height
      ) {
        setRunning(false);
        setGameOver(true);
        return;
      }
    }

    // Draw score
    ctx.fillStyle = '#fff';
    ctx.font = '16px sans-serif';
    ctx.fillText(`Score: ${Math.floor(scoreRef.current / 10)}`, width - 100, 20);

    // Loop
    animationIdRef.current = requestAnimationFrame(gameLoop);
  };

  const startGame = () => {
    resetGame();
    if (containerRef.current) {
      widthRef.current = containerRef.current.clientWidth;
    }
    setRunning(true);
    animationIdRef.current = requestAnimationFrame(gameLoop);
  };

  const handleKey = (e: KeyboardEvent) => {
    if (!running) return;
    if (e.code === 'Space' && dinoYRef.current >= height - 10 - dinoHeight) {
      velocityRef.current = jumpStrength;
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.height = height;
      canvas.width = widthRef.current;
    }
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      cancelAnimationFrame(animationIdRef.current);
    };
  }, [running]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[150px] cursor-pointer overflow-hidden"
      onClick={() => {
        if (!running) startGame();
      }}
    >
      <canvas
        ref={canvasRef}
        className="border border-muted-foreground rounded-lg w-full h-full"
        style={{ background: 'transparent' }}
      />
      {!running && !gameOver && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          Click to start
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg text-white mb-2">Game Over</span>
          <button
            className="px-4 py-2 bg-primary text-white rounded"
            onClick={startGame}
          >
            Restart
          </button>
        </div>
      )}
    </div>
  );
};

export default DinoGame; 