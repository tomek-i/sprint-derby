'use client';

import { ChevronsDown, ChevronsUp, Rabbit, Snail, TrendingUp } from "lucide-react";
import { type Player, type PlayerStatsData } from '@/app/page';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useMemo } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";

interface RaceSummaryProps {
  players: Player[];
  stats: Map<string, PlayerStatsData>;
  speedHistory: Map<string, number[]>;
}

export default function RaceSummary({ players, stats }: RaceSummaryProps) {
    const toFixed = (speed: number) => speed.toFixed(1);

    const leaderboard = useMemo(() => {
        if (stats.size === 0) return null;
        
        let fastest: {player: Player, speed: number} | null = null;
        let slowest: {player: Player, speed: number} | null = null;
        let mostConsistent: {player: Player, variation: number} | null = null;

        players.forEach(player => {
            const playerStats = stats.get(player.id);
            if (!playerStats) return;

            if (!fastest || playerStats.maxSpeed > fastest.speed) {
                fastest = { player, speed: playerStats.maxSpeed };
            }
            if (!slowest || playerStats.minSpeed < slowest.speed) {
                slowest = { player, speed: playerStats.minSpeed };
            }
        });

        return { fastest, slowest };
    }, [players, stats]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Race Summary</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
            <h3 className="font-bold text-lg">Racer Performance</h3>
            {players.map(player => {
                const playerStats = stats.get(player.id);
                if (!playerStats) return null;

                return (
                    <div key={player.id} className="p-3 rounded-lg bg-secondary/20 flex items-center gap-4">
                        <Avatar>
                            <AvatarFallback style={{ backgroundColor: player.color, color: 'hsl(var(--background))' }}>
                                {player.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                         <div className="flex-1">
                            <p className="font-bold">{player.jockeyName}</p>
                            <p className="text-sm text-muted-foreground">{player.name}</p>
                        </div>
                        <div className="flex gap-4 text-sm text-center">
                            <div>
                                <div className="flex items-center justify-center gap-1 text-green-500"><ChevronsUp className="w-4 h-4"/> Max</div>
                                <p className="font-bold">{toFixed(playerStats.maxSpeed)} m/s</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-center gap-1 text-blue-500"><TrendingUp className="w-4 h-4"/> Avg</div>
                                <p className="font-bold">{toFixed(playerStats.avgSpeed)} m/s</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-center gap-1 text-red-500"><ChevronsDown className="w-4 h-4"/> Min</div>
                                <p className="font-bold">{toFixed(playerStats.minSpeed)} m/s</p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
        
        {leaderboard && (
            <div className="space-y-4">
                 <h3 className="font-bold text-lg">Highlights</h3>
                 <div className="space-y-3">
                    {leaderboard.fastest && (
                        <Card className="p-4 bg-green-500/10 border-green-500/30">
                           <div className="flex items-center gap-3">
                                <Rabbit className="w-8 h-8 text-green-500"/>
                                <div>
                                    <p className="font-bold text-green-500">Top Speed</p>
                                    <p>{leaderboard.fastest.player.jockeyName}</p>
                                    <p className="text-sm font-semibold">{toFixed(leaderboard.fastest.speed)} m/s</p>
                                </div>
                           </div>
                        </Card>
                    )}
                     {leaderboard.slowest && (
                        <Card className="p-4 bg-red-500/10 border-red-500/30">
                            <div className="flex items-center gap-3">
                                <Snail className="w-8 h-8 text-red-500"/>
                                <div>
                                    <p className="font-bold text-red-500">Slowest Moment</p>
                                    <p>{leaderboard.slowest.player.jockeyName}</p>
                                    <p className="text-sm font-semibold">{toFixed(leaderboard.slowest.speed)} m/s</p>
                                </div>
                           </div>
                        </Card>
                    )}
                 </div>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
