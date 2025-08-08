'use client';

import { useEffect, useRef, useCallback } from 'react';
import { type Player } from '@/app/page';

// Using an inline SVG for the horse icon as it's not in lucide-react
const HorseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.5 22.5c4.286-4.286 7.5-8.429 7.5-12.857C11 5.214 9.143 4.5 8 4.5c-1.143 0-2.5 1.286-2.5 1.286m0 0s0-1.286-1.286-1.286C3.071 4.5 2.5 5.214 2.5 6.357c0 4.429 3.214 8.571 7.5 12.857M6.5 12.5s2-1.5 4-1.5 4 1.5 4 1.5-2 1.5-4 1.5-4-1.5-4-1.5z" />
      <path d="M17.5 4.5c1.143 0 2.5 1.286 2.5 1.286s0-1.286 1.286-1.286c1.143 0 1.643.714 1.643 1.857 0 4.429-3.214 8.571-7.5 12.857m0 0c-4.286-4.286-7.5-8.429-7.5-12.857" />
    </svg>
  );


interface RaceTrackProps {
  players: Player[];
  onRaceEnd: (winnerId: string) => void;
  onProgressUpdate: (progress: Map<string, number>) => void;
  isRacing: boolean;
}

const RACE_LENGTH = 100; // Represents 100%
const BASE_SPEED = 0.05;
const SPEED_VARIATION = 0.15; // Increased from 0.05

export default function RaceTrack({ players, onRaceEnd, onProgressUpdate, isRacing }: RaceTrackProps) {
  const horseRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const progressRef = useRef<Map<string, number>>(new Map());
  const animationFrameId = useRef<number>();
  const timeRef = useRef(0);

  const setupRace = useCallback(() => {
    const initialProgress = new Map<string, number>();
    players.forEach(p => {
        initialProgress.set(p.id, 0);
        const horseEl = horseRefs.current.get(p.id);
        if (horseEl) {
            horseEl.style.transform = `translateX(0%)`;
        }
    });
    progressRef.current = initialProgress;
    timeRef.current = 0;
  }, [players]);

  useEffect(() => {
    setupRace();
  }, [setupRace]);

  useEffect(() => {
    let lastProgressUpdateTime = 0;

    const animate = (timestamp: number) => {
      if (!isRacing) {
        return;
      }
      
      timeRef.current += 0.1;
      let winnerFound = false;

      players.forEach(player => {
        let currentProgress = progressRef.current.get(player.id) ?? 0;

        if (currentProgress < RACE_LENGTH) {
            const noise = player.noise.get(timeRef.current);
            const speed = BASE_SPEED + noise * SPEED_VARIATION;
            currentProgress += speed;
        }
        
        progressRef.current.set(player.id, Math.min(currentProgress, RACE_LENGTH));
        
        const horseEl = horseRefs.current.get(player.id);
        if (horseEl) {
            horseEl.style.transform = `translateX(${currentProgress / RACE_LENGTH * (horseEl.parentElement!.offsetWidth - horseEl.offsetWidth)}px)`;
        }

        if (currentProgress >= RACE_LENGTH && !winnerFound) {
          winnerFound = true;
          onRaceEnd(player.id);
        }
      });
      
      if (timestamp - lastProgressUpdateTime > 100) {
        onProgressUpdate(new Map(progressRef.current));
        lastProgressUpdateTime = timestamp;
      }

      if (!winnerFound) {
        animationFrameId.current = requestAnimationFrame(animate);
      }
    };

    if (isRacing) {
        animationFrameId.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isRacing, players, onRaceEnd, onProgressUpdate]);


  return (
    <div className="w-full bg-secondary/30 p-4 rounded-lg border-2 border-dashed border-primary/50 space-y-2 relative overflow-hidden" data-ai-hint="race track">
        <div className="absolute top-1/2 right-4 -translate-y-1/2 h-full border-l-4 border-dashed border-red-500/70 z-10 flex items-center">
            <span className="bg-red-500 text-white font-bold p-2 rounded-l-md -ml-[2px]">FINISH</span>
        </div>
      {players.map((player) => (
        <div key={player.id} className="h-12 w-full rounded-md flex items-center bg-background/50 relative">
          <div ref={el => horseRefs.current.set(player.id, el)} className="transition-transform duration-100 ease-linear">
            <div className="flex items-center gap-2 w-max p-2 rounded-lg" style={{ backgroundColor: player.color }}>
                 <HorseIcon className="h-6 w-6" style={{ color: 'hsl(var(--background))' }} />
                 <span className="font-bold text-sm hidden sm:inline" style={{ color: 'hsl(var(--background))' }}>{player.jockeyName}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
