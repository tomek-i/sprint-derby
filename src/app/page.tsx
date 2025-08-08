'use client';

import { useState, useCallback } from 'react';
import { Flag, Trophy } from 'lucide-react';
import Lobby from '@/components/lobby';
import RaceTrack from '@/components/race-track';
import PlayerStats from '@/components/player-stats';
import { ValueNoise } from '@/lib/noise';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export type Player = {
  id: string;
  name: string;
  jockeyName: string;
  color: string;
  noise: ValueNoise;
  isAI: boolean;
};

type GameState = 'lobby' | 'racing' | 'finished';

const aiOpponents = [
  { name: 'Rival', jockeyName: 'Gallop Ghost', color: 'hsl(210 40% 96%)' },
  { name: 'Challenger', jockeyName: 'Star Strider', color: 'hsl(140 40% 96%)' },
  { name: 'Maverick', jockeyName: 'Night Runner', color: 'hsl(340 40% 96%)' },
];

const darkAIColors = [
    'hsl(210 80% 50%)',
    'hsl(140 70% 50%)',
    'hsl(340 80% 60%)',
];


export default function Home() {
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [players, setPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [progress, setProgress] = useState<Map<string, number>>(new Map());

  const handleStartRace = useCallback((userName: string, userJockeyName: string) => {
    const userPlayer: Player = {
      id: 'player',
      name: userName,
      jockeyName: userJockeyName,
      color: 'hsl(40 50% 96%)',
      noise: new ValueNoise(Math.random()),
      isAI: false,
    };

    const opponentPlayers: Player[] = aiOpponents.map((op, index) => ({
      id: `ai-${index}`,
      name: op.name,
      jockeyName: op.jockeyName,
      color: darkAIColors[index],
      noise: new ValueNoise(Math.random()),
      isAI: true,
    }));

    const allPlayers = [userPlayer, ...opponentPlayers];
    setPlayers(allPlayers);

    const initialProgress = new Map<string, number>();
    allPlayers.forEach(p => initialProgress.set(p.id, 0));
    setProgress(initialProgress);

    setWinner(null);
    setGameState('racing');
  }, []);

  const handleRaceEnd = useCallback((winnerId: string) => {
    const winnerPlayer = players.find(p => p.id === winnerId);
    if (winnerPlayer) {
      setWinner(winnerPlayer);
    }
    setGameState('finished');
  }, [players]);

  const handleProgressUpdate = useCallback((newProgress: Map<string, number>) => {
    setProgress(new Map(newProgress));
  }, []);

  const handlePlayAgain = () => {
    setGameState('lobby');
    setPlayers([]);
    setWinner(null);
    setProgress(new Map());
  };

  return (
    <main className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-screen font-sans">
      <div className="w-full max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="font-headline text-5xl md:text-7xl font-black text-primary flex items-center justify-center gap-4">
            <Flag className="w-12 h-12 md:w-16 md:h-16 transform -scale-x-100" />
            Photo Finish Derby
            <Flag className="w-12 h-12 md:w-16 md:h-16" />
          </h1>
          <p className="text-muted-foreground text-lg mt-2">The ultimate AI-powered horse racing simulation.</p>
        </header>

        {gameState === 'lobby' && <Lobby onStartRace={handleStartRace} />}

        {(gameState === 'racing' || gameState === 'finished') && (
          <div className="space-y-8 w-full">
            <RaceTrack
              players={players}
              onRaceEnd={handleRaceEnd}
              onProgressUpdate={handleProgressUpdate}
              isRacing={gameState === 'racing'}
            />
            <PlayerStats players={players} progress={progress} winnerId={winner?.id ?? null} />
          </div>
        )}

        {gameState === 'finished' && winner && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
            <Card className="w-full max-w-md text-center shadow-2xl animate-in fade-in zoom-in-95">
              <CardHeader>
                <CardTitle className="text-4xl font-black text-accent flex items-center justify-center gap-3">
                  <Trophy className="w-10 h-10" />
                  We have a winner!
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <div className="p-4 rounded-lg" style={{ backgroundColor: winner.color }}>
                   <p className="text-2xl font-bold" style={{ color: 'hsl(var(--background))' }}>{winner.name}</p>
                   <p className="text-lg text-black/70">ridden by {winner.jockeyName}</p>
                </div>
                <p className="text-xl">Congratulations on the victory!</p>
                <Button onClick={handlePlayAgain} size="lg" className="mt-4">
                  Race Again
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
