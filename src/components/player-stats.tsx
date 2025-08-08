'use client';

import { Trophy, User, Bot, Wind, Timer } from 'lucide-react';
import { type Player, type PlayerStatsData } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

// Using an inline SVG for the horse icon as it's not in lucide-react
const HorseIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M3.5 22.5c4.286-4.286 7.5-8.429 7.5-12.857C11 5.214 9.143 4.5 8 4.5c-1.143 0-2.5 1.286-2.5 1.286m0 0s0-1.286-1.286-1.286C3.071 4.5 2.5 5.214 2.5 6.357c0 4.429 3.214 8.571 7.5 12.857M6.5 12.5s2-1.5 4-1.5 4 1.5 4 1.5-2 1.5-4 1.5-4-1.5-4-1.5z" />
      <path d="M17.5 4.5c1.143 0 2.5 1.286 2.5 1.286s0-1.286 1.286-1.286c1.143 0 1.643.714 1.643 1.857 0 4.429-3.214 8.571-7.5 12.857m0 0c-4.286-4.286-7.5-8.429-7.5-12.857" />
    </svg>
  );

interface PlayerStatsProps {
  players: Player[];
  progress: Map<string, number>;
  speeds: Map<string, number>;
  winnerId: string | null;
  raceState: 'racing' | 'finished';
  finishTimes: Map<string, PlayerStatsData>;
}

export default function PlayerStats({ players, progress, speeds, winnerId, raceState, finishTimes }: PlayerStatsProps) {

  const sortedPlayers = useMemo(() => {
    const playersWithFinishTime = players.map(p => {
      const stats = finishTimes.get(p.id);
      return { ...p, finishTime: stats?.finishTime };
    });

    return playersWithFinishTime.sort((a, b) => {
      if (raceState === 'finished') {
        if (a.finishTime === undefined && b.finishTime === undefined) return 0;
        if (a.finishTime === undefined) return 1;
        if (b.finishTime === undefined) return -1;
        return a.finishTime - b.finishTime;
      }
      const progressA = progress.get(a.id) ?? 0;
      const progressB = progress.get(b.id) ?? 0;
      return progressB - progressA;
    });
  }, [players, progress, raceState, finishTimes]);
  

  return (
    <Card>
      <CardHeader>
        <CardTitle>Race Standings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedPlayers.map((player, index) => {
            const playerProgress = progress.get(player.id) ?? 0;
            const playerSpeed = speeds.get(player.id) ?? 0;
            const isWinner = player.id === winnerId;
            const rank = index + 1;
            const playerFinishTime = finishTimes.get(player.id)?.finishTime;

            return (
              <div
                key={player.id}
                className={cn(
                  'p-4 rounded-lg transition-all',
                  isWinner ? 'bg-accent/30 border-2 border-accent' : 'bg-secondary/20 border border-transparent'
                )}
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex flex-col items-center justify-center w-10">
                    {isWinner ? (
                        <Trophy className="w-6 h-6 text-accent" />
                    ) : (
                        <span className="text-2xl font-bold text-muted-foreground">{rank}</span>
                    )}
                  </div>

                  <Avatar>
                    <AvatarFallback style={{ backgroundColor: player.color }}>
                      {player.isAI ? (
                        <Bot className="text-background" />
                      ) : (
                        <User className="text-background" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-bold text-lg">{player.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                       <HorseIcon className="w-4 h-4" />
                       <span>{player.jockeyName}</span>
                    </div>
                  </div>
                  {raceState === 'finished' && playerFinishTime !== undefined ? (
                    <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                       <Timer className="w-5 h-5" />
                       <span>{(playerFinishTime / 1000).toFixed(2)}s</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-lg font-semibold text-muted-foreground">
                      <Wind className="w-5 h-5" />
                      <span>{playerSpeed.toFixed(1)} m/s</span>
                    </div>
                  )}

                   <div className="text-2xl font-black tabular-nums w-20 text-right">
                    {Math.floor(playerProgress)}%
                  </div>
                </div>
                <Progress value={playerProgress} indicatorColor={player.color} />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
