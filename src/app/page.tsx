'use client';

import { useState, useCallback, useEffect } from 'react';
import { Flag, Trophy, X } from 'lucide-react';
import RaceTrack from '@/components/race-track';
import PlayerStats from '@/components/player-stats';
import Lobby from '@/components/lobby';
import { ValueNoise } from '@/lib/noise';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactConfetti from 'react-confetti';

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
  const [showWinnerPopup, setShowWinnerPopup] = useState(false);
  const [progress, setProgress] = useState<Map<string, number>>(new Map());
  const [speeds, setSpeeds] = useState<Map<string, number>>(new Map());
  const [windowSize, setWindowSize] = useState<{width: number, height: number}>({width: 0, height: 0});

  useEffect(() => {
    const handleResize = () => {
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStartRace = useCallback((players: Player[]) => {
    const playersWithNoise = players.map(p => ({
      ...p,
      noise: new ValueNoise(Math.random()),
    }));

    setPlayers(playersWithNoise);

    const initialProgress = new Map<string, number>();
    const initialSpeeds = new Map<string, number>();
    playersWithNoise.forEach(p => {
        initialProgress.set(p.id, 0);
        initialSpeeds.set(p.id, 0);
    });
    setProgress(initialProgress);
    setSpeeds(initialSpeeds);

    setWinner(null);
    setGameState('racing');
    setShowWinnerPopup(false);
  }, []);

  const handleRaceEnd = useCallback((winnerId: string) => {
    const winnerPlayer = players.find(p => p.id === winnerId);
    if (winnerPlayer) {
      setWinner(winnerPlayer);
    }
    setGameState('finished');
    setShowWinnerPopup(true);
  }, [players]);

  const handleProgressUpdate = useCallback((newProgress: Map<string, number>, newSpeeds: Map<string, number>) => {
    setProgress(new Map(newProgress));
    setSpeeds(new Map(newSpeeds));
  }, []);

  const handleBackToLobby = () => {
    setGameState('lobby');
    setShowWinnerPopup(false);
    // We keep the players list so the user can race again with the same players
  };

  const handleResetGame = () => {
    setGameState('lobby');
    setPlayers([]);
    setWinner(null);
    setProgress(new Map());
    setSpeeds(new Map());
    setShowWinnerPopup(false);
  }

  return (
    <main className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-screen font-sans">
      <div className="w-full max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="font-headline text-5xl md:text-7xl font-black text-primary flex items-center justify-center gap-4">
            <Flag className="w-12 h-12 md:w-16 md:h-16 transform -scale-x-100" />
            Sprint Derby
            <Flag className="w-12 h-12 md:w-16 md:h-16" />
          </h1>
          <p className="text-muted-foreground text-lg mt-2">The ultimate AI-powered horse racing simulation.</p>
        </header>
        
        {gameState === 'lobby' && (
            <Lobby onStartRace={handleStartRace} availableColors={availableColors} players={players} setPlayers={setPlayers} />
        )}

        {(gameState === 'racing' || gameState === 'finished') && (
          <div className="space-y-8 w-full mt-8">
            <RaceTrack
              players={players}
              onRaceEnd={handleRaceEnd}
              onProgressUpdate={handleProgressUpdate}
              isRacing={gameState === 'racing'}
            />
            <PlayerStats players={players} progress={progress} speeds={speeds} winnerId={winner?.id ?? null} />
          </div>
        )}

        {showWinnerPopup && winner && (
          <>
            <ReactConfetti
              width={windowSize.width}
              height={windowSize.height}
              recycle={false}
              numberOfPieces={500}
              tweenDuration={10000}
              style={{ zIndex: 100 }}
            />
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
              <Card className="w-full max-w-md text-center shadow-2xl animate-in fade-in zoom-in-95 relative">
                <Button variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => setShowWinnerPopup(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
                <CardHeader>
                  <CardTitle className="text-4xl font-black text-accent flex items-center justify-center gap-3">
                    <Trophy className="w-10 h-10" />
                    We have a winner!
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                  <div className="p-4 rounded-lg" style={{ backgroundColor: winner.color }}>
                     <p className="text-2xl font-bold" style={{ color: 'hsl(var(--background))' }}>{winner.jockeyName}</p>
                     <p className="text-lg text-black/70">ridden by {winner.name}</p>
                  </div>
                  <p className="text-xl">Congratulations, you are running the Sprint</p>
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
          </>
        )}
      </div>
    </main>
  );
}
