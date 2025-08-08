'use server';
/**
 * @fileOverview A jockey name generator AI agent.
 *
 * - generateJockeyName - A function that generates a jockey name.
 * - GenerateJockeyNameInput - The input type for the generateJockeyName function.
 * - GenerateJockeyNameOutput - The return type for the generateJockeyName function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJockeyNameInputSchema = z.object({
  animalType: z
    .string()
    .default('horse')
    .describe('The type of animal the jockey will ride.'),
  playerName: z
    .string()
    .describe('The name of the player to generate a jockey name for.'),
});
export type GenerateJockeyNameInput = z.infer<typeof GenerateJockeyNameInputSchema>;

const GenerateJockeyNameOutputSchema = z.object({
  jockeyName: z.string().describe('The generated name for the jockey.'),
});
export type GenerateJockeyNameOutput = z.infer<typeof GenerateJockeyNameOutputSchema>;

export async function generateJockeyName(input: GenerateJockeyNameInput): Promise<GenerateJockeyNameOutput> {
  return generateJockeyNameFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJockeyNamePrompt',
  input: {schema: GenerateJockeyNameInputSchema},
  output: {schema: GenerateJockeyNameOutputSchema},
  prompt: `You are a creative jockey name generator for a {{animalType}} race.

  Generate a fun and thematic jockey name for a player named "{{playerName}}".

  Name:`,
});

const generateJockeyNameFlow = ai.defineFlow(
  {
    name: 'generateJockeyNameFlow',
    inputSchema: GenerateJockeyNameInputSchema,
    outputSchema: GenerateJockeyNameOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
