'use client';

import { Horse, Trophy, User, Bot } from 'lucide-react';
import { type Player } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface PlayerStatsProps {
  players: Player[];
  progress: Map<string, number>;
  winnerId: string | null;
}

export default function PlayerStats({ players, progress, winnerId }: PlayerStatsProps) {
  const sortedPlayers = [...players].sort((a, b) => {
    const progressA = progress.get(a.id) ?? 0;
    const progressB = progress.get(b.id) ?? 0;
    return progressB - progressA;
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Race Standings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedPlayers.map((player, index) => {
            const playerProgress = progress.get(player.id) ?? 0;
            const isWinner = player.id === winnerId;
            const rank = index + 1;

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
                    {rank === 1 ? (
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
                       <Horse className="w-4 h-4" />
                       <span>{player.jockeyName}</span>
                    </div>
                  </div>
                   <div className="text-2xl font-black tabular-nums">
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
