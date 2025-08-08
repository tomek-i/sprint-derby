'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Bot, User } from 'lucide-react';
import { type Player } from '@/app/page';
import { Avatar, AvatarFallback } from './ui/avatar';


interface RaceTrackProps {
  players: Player[];
  onRaceEnd: (finishTimes: Map<string, number>, speedHistory: Map<string, number[]>) => void;
  onProgressUpdate: (progress: Map<string, number>, speeds: Map<string, number>) => void;
  isRacing: boolean;
}

const RACE_DISTANCE_METERS = 400; 
const TIME_STEP = 1 / 60; // Simulate 60 physics updates per second
const MAX_SPEED_MPS = 20; // Max speed in meters per second (approx. 72 km/h)
const ACCELERATION_FACTOR = 2; // How quickly they can change speed

export default function RaceTrack({ players, onRaceEnd, onProgressUpdate, isRacing }: RaceTrackProps) {
  const horseRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const distanceRef = useRef<Map<string, number>>(new Map());
  const speedsRef = useRef<Map<string, number>>(new Map());
  const speedHistoryRef = useRef<Map<string, number[]>>(new Map());
  const finishTimesRef = useRef<Map<string, number>>(new Map());
  const animationFrameId = useRef<number>();
  const raceTimeRef = useRef(0);
  const raceStartTimeRef = useRef(0);

  const setupRace = useCallback(() => {
    const initialDistance = new Map<string, number>();
    const initialSpeeds = new Map<string, number>();
    const initialSpeedHistory = new Map<string, number[]>();
    players.forEach(p => {
        initialDistance.set(p.id, 0);
        initialSpeeds.set(p.id, 0);
        initialSpeedHistory.set(p.id, []);
        const horseEl = horseRefs.current.get(p.id);
        if (horseEl) {
            horseEl.style.transform = `translateX(0px)`;
        }
    });
    distanceRef.current = initialDistance;
    speedsRef.current = initialSpeeds;
    speedHistoryRef.current = initialSpeedHistory;
    finishTimesRef.current = new Map();
    raceTimeRef.current = 0;
    raceStartTimeRef.current = 0;
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
      
      if (raceStartTimeRef.current === 0) {
        raceStartTimeRef.current = timestamp;
      }
      const elapsedTime = timestamp - raceStartTimeRef.current;
      
      const physicsTime = raceTimeRef.current + 0.1; // Using a consistent increment for noise sampling
      raceTimeRef.current = physicsTime;

      let finishedCount = 0;

      players.forEach(player => {
        let currentDistance = distanceRef.current.get(player.id) ?? 0;
        
        // If the horse has finished, don't update it further
        if (currentDistance >= RACE_DISTANCE_METERS) {
          finishedCount++;
          return;
        }

        let currentSpeed = speedsRef.current.get(player.id) ?? 0;

        const noise = player.noise.get(physicsTime); // Value from 0 to 1
        const targetSpeed = noise * MAX_SPEED_MPS;

        const speedChange = (targetSpeed - currentSpeed) * ACCELERATION_FACTOR * TIME_STEP;
        currentSpeed += speedChange;
        currentSpeed = Math.max(0, Math.min(currentSpeed, MAX_SPEED_MPS));
        
        // Update distance based on speed and time step of animation frame
        currentDistance += currentSpeed * TIME_STEP; 

        speedsRef.current.set(player.id, currentSpeed);
        speedHistoryRef.current.get(player.id)?.push(currentSpeed);
        distanceRef.current.set(player.id, currentDistance);
        
        const horseEl = horseRefs.current.get(player.id);
        if (horseEl) {
            const trackWidth = horseEl.parentElement!.offsetWidth;
            const horseWidth = horseEl.offsetWidth;
            const progressPercentage = currentDistance / RACE_DISTANCE_METERS;
            horseEl.style.transform = `translateX(${progressPercentage * (trackWidth - horseWidth)}px)`;
        }
        
        if (currentDistance >= RACE_DISTANCE_METERS && !finishTimesRef.current.has(player.id)) {
          finishTimesRef.current.set(player.id, elapsedTime);
          finishedCount++;
        }
      });
      
      // Send progress update periodically
      if (timestamp - lastProgressUpdateTime > 100) {
        const progressMap = new Map<string, number>();
        distanceRef.current.forEach((dist, id) => {
          progressMap.set(id, Math.min(100, (dist / RACE_DISTANCE_METERS) * 100));
        });
        onProgressUpdate(progressMap, new Map(speedsRef.current));
        lastProgressUpdateTime = timestamp;
      }
      
      // If all players have finished, end the race
      if (finishedCount === players.length) {
        onRaceEnd(new Map(finishTimesRef.current), speedHistoryRef.current);
      } else {
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
