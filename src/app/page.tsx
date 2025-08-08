'use client';

import { useState, useCallback, useMemo } from 'react';
import { Flag, Trophy } from 'lucide-react';
import RaceTrack from '@/components/race-track';
import PlayerStats from '@/components/player-stats';
import Lobby from '@/components/lobby';
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

const availableColors = [
    'hsl(40 50% 96%)',
    'hsl(210 80% 50%)',
    'hsl(140 70% 50%)',
    'hsl(340 80% 60%)',
    'hsl(20 80% 60%)',
    'hsl(260 70% 60%)',
    'hsl(180 70% 40%)',
    'hsl(60 80% 55%)'
];

export default function Home() {
  const [gameState, setGameState] = useState<GameState>('lobby');
  const [players, setPlayers] = useState<Player[]>([]);
  const [winner, setWinner] = useState<Player | null>(null);
  const [progress, setProgress] = useState<Map<string, number>>(new Map());

  const handleStartRace = useCallback((players: Player[]) => {
    const playersWithNoise = players.map(p => ({
      ...p,
      noise: new ValueNoise(Math.random()),
    }));

    setPlayers(playersWithNoise);

    const initialProgress = new Map<string, number>();
    playersWithNoise.forEach(p => initialProgress.set(p.id, 0));
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

  const handleBackToLobby = () => {
    setGameState('lobby');
    // We keep the players list so the user can race again with the same players
  };

  const handleResetGame = () => {
    setGameState('lobby');
    setPlayers([]);
    setWinner(null);
    setProgress(new Map());
  }

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
        
        <Lobby onStartRace={handleStartRace} availableColors={availableColors} players={players} setPlayers={setPlayers} disabled={gameState !== 'lobby'} />

        {(gameState === 'racing' || gameState === 'finished') && (
          <div className="space-y-8 w-full mt-8">
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
                <div className="flex gap-4 mt-4">
                  <Button onClick={handleBackToLobby} size="lg" variant="outline">
                    Back to Lobby
                  </Button>
                  <Button onClick={handleResetGame} size="lg">
                    New Race
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}
