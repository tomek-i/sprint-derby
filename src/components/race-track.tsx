'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Bot, User } from 'lucide-react';
import { type Player } from '@/app/page';
import { Avatar, AvatarFallback } from './ui/avatar';


interface RaceTrackProps {
  players: Player[];
  onRaceEnd: (winnerId: string, speedHistory: Map<string, number[]>) => void;
  onProgressUpdate: (progress: Map<string, number>, speeds: Map<string, number>) => void;
  isRacing: boolean;
}

const RACE_LENGTH = 100; // Represents 100% of the track
const TIME_STEP = 1 / 60; // Simulate 60 physics updates per second
const MAX_SPEED_MPS = 20; // Max speed in meters per second (approx. 72 km/h)
const ACCELERATION_FACTOR = 2; // How quickly they can change speed

export default function RaceTrack({ players, onRaceEnd, onProgressUpdate, isRacing }: RaceTrackProps) {
  const horseRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const progressRef = useRef<Map<string, number>>(new Map());
  const speedsRef = useRef<Map<string, number>>(new Map());
  const speedHistoryRef = useRef<Map<string, number[]>>(new Map());
  const animationFrameId = useRef<number>();
  const timeRef = useRef(0);

  const setupRace = useCallback(() => {
    const initialProgress = new Map<string, number>();
    const initialSpeeds = new Map<string, number>();
    const initialSpeedHistory = new Map<string, number[]>();
    players.forEach(p => {
        initialProgress.set(p.id, 0);
        initialSpeeds.set(p.id, 0);
        initialSpeedHistory.set(p.id, []);
        const horseEl = horseRefs.current.get(p.id);
        if (horseEl) {
            horseEl.style.transform = `translateX(0%)`;
        }
    });
    progressRef.current = initialProgress;
    speedsRef.current = initialSpeeds;
    speedHistoryRef.current = initialSpeedHistory;
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
        let currentSpeed = speedsRef.current.get(player.id) ?? 0;

        if (currentProgress < RACE_LENGTH) {
            const noise = player.noise.get(timeRef.current); // Value from 0 to 1
            
            // The noise determines the 'target' speed for this moment.
            // It's a percentage of the max possible speed.
            const targetSpeed = noise * MAX_SPEED_MPS;

            // Smoothly move the current speed towards the target speed.
            const speedChange = (targetSpeed - currentSpeed) * ACCELERATION_FACTOR * TIME_STEP;
            currentSpeed += speedChange;

            // Ensure speed doesn't go below zero or exceed max speed
            currentSpeed = Math.max(0, Math.min(currentSpeed, MAX_SPEED_MPS));
            
            // The progress update is based on the current speed
            // We divide by a factor to make the race last a reasonable amount of time on screen
            currentProgress += (currentSpeed / MAX_SPEED_MPS) * 0.2; 
            
            speedsRef.current.set(player.id, currentSpeed);
            speedHistoryRef.current.get(player.id)?.push(currentSpeed);
        }
        
        progressRef.current.set(player.id, Math.min(currentProgress, RACE_LENGTH));
        
        const horseEl = horseRefs.current.get(player.id);
        if (horseEl) {
            horseEl.style.transform = `translateX(${currentProgress / RACE_LENGTH * (horseEl.parentElement!.offsetWidth - horseEl.offsetWidth)}px)`;
        }

        if (currentProgress >= RACE_LENGTH && !winnerFound) {
          winnerFound = true;
          onRaceEnd(player.id, speedHistoryRef.current);
        }
      });
      
      if (timestamp - lastProgressUpdateTime > 100) {
        onProgressUpdate(new Map(progressRef.current), new Map(speedsRef.current));
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
        <div className="absolute top-0 right-4 h-full border-r-4 border-dashed border-red-500/70 z-0"></div>
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
