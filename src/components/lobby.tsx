'use client';

import { useState, useTransition } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { generateJockeyNameAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';

interface LobbyProps {
  onStartRace: (userName: string, jockeyName: string) => void;
}

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.').max(50),
});

export default function Lobby({ onStartRace }: LobbyProps) {
  const [jockeyName, setJockeyName] = useState('Speedy Steed');
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: 'Player 1',
    },
  });

  const handleGenerateName = () => {
    startTransition(async () => {
      const result = await generateJockeyNameAction({ animalType: 'horse' });
      if (result.jockeyName) {
        setJockeyName(result.jockeyName);
        toast({
          title: 'Jockey Name Generated!',
          description: `Your new jockey is "${result.jockeyName}".`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Uh oh! Something went wrong.',
          description: result.error,
        });
      }
    });
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    onStartRace(values.name, jockeyName);
  }

  return (
    <Card className="w-full max-w-lg mx-auto animate-in fade-in duration-500">
      <CardHeader>
        <CardTitle>Prepare for the Race</CardTitle>
        <CardDescription>Enter your name and get a jockey for the derby.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Your Jockey</FormLabel>
              <div className="flex items-center gap-4">
                <FormControl>
                  <Input readOnly value={jockeyName} className="font-medium" />
                </FormControl>
                <Button type="button" onClick={handleGenerateName} disabled={isPending} variant="outline">
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Generate
                </Button>
              </div>
            </FormItem>
            
            <Button type="submit" size="lg" className="w-full">
              Start Race
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
