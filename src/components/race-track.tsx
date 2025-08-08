'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Bot, User } from 'lucide-react';
import { type Player } from '@/app/page';
import { Avatar, AvatarFallback } from './ui/avatar';


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
              <Avatar className="w-10 h-10 border-2 border-background shadow-lg">
                <AvatarFallback style={{ backgroundColor: player.color }}>
                  {player.isAI ? (
                    <Bot className="text-background" />
                  ) : (
                    <User className="text-background" />
                  )}
                </AvatarFallback>
              </Avatar>
          </div>
        </div>
      ))}
    </div>
  );
}
