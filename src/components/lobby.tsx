'use client';

import { useState, useTransition, useMemo } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Loader2, UserPlus, Trash2, Bot, User } from 'lucide-react';
import { type Player } from '@/app/page';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { generateJockeyNameAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';

interface LobbyProps {
  onStartRace: (players: Player[]) => void;
  availableColors: string[];
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  disabled: boolean;
}

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50),
  isAI: z.boolean(),
});

export default function Lobby({ onStartRace, availableColors, players, setPlayers, disabled }: LobbyProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      isAI: false,
    },
  });

  const nextColor = useMemo(() => {
    return availableColors[players.length % availableColors.length];
  }, [players.length, availableColors]);

  const addPlayer = async (values: z.infer<typeof formSchema>) => {
    if (players.length >= availableColors.length) {
        toast({
            variant: 'destructive',
            title: 'Lobby is full!',
            description: `You can add a maximum of ${availableColors.length} players.`,
        });
        return;
    }

    startTransition(async () => {
      const jockeyNameResult = await generateJockeyNameAction({ animalType: 'horse', playerName: values.name });
      if (jockeyNameResult.error || !jockeyNameResult.jockeyName) {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: jockeyNameResult.error || 'Could not generate a jockey name.',
        });
        return;
      }
      
      const newPlayer: Omit<Player, 'noise'> = {
        id: `${values.name}-${Math.random()}`,
        name: values.name,
        jockeyName: jockeyNameResult.jockeyName,
        color: nextColor,
        isAI: values.isAI,
      };

      // The noise property will be added in page.tsx before the race starts
      setPlayers(prev => [...prev, newPlayer as Player]);
      form.reset({ name: '', isAI: false });
    });
  };
  
  const removePlayer = (id: string) => {
    setPlayers(prev => prev.filter(p => p.id !== id));
  }

  const handleStartRace = () => {
    onStartRace(players);
  }

  return (
    <Card className={cn("w-full max-w-4xl mx-auto transition-opacity", disabled && "opacity-50 pointer-events-none")}>
      <CardHeader>
        <CardTitle>Race Lobby</CardTitle>
        <CardDescription>Add up to {availableColors.length} players to the race. Then start the derby!</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-bold mb-4">Add New Player</h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(addPlayer)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter player name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isAI"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <FormLabel>AI Opponent</FormLabel>
                            <p className="text-sm text-muted-foreground">
                                Is this player controlled by AI?
                            </p>
                        </div>
                        <FormControl>
                            <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            />
                        </FormControl>
                    </FormItem>
                )}
               />
              
              <Button type="submit" disabled={isPending || players.length >= availableColors.length} className="w-full">
                {isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
                Add Player
              </Button>
            </form>
          </Form>
        </div>
        <div>
          <h3 className="font-bold mb-4">Current Racers ({players.length})</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {players.length === 0 && <p className="text-muted-foreground text-center py-8">No players added yet.</p>}
            {players.map(player => (
              <div key={player.id} className="flex items-center gap-4 p-2 rounded-md bg-secondary/30">
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
                    <p className="font-bold">{player.name}</p>
                    <p className="text-sm text-muted-foreground">{player.jockeyName}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removePlayer(player.id)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
          <Button onClick={handleStartRace} size="lg" className="w-full" disabled={players.length < 2}>
              Start Race with {players.length} players
          </Button>
      </CardFooter>
    </Card>
  );
}
