'use server';

import {
  generateJockeyName,
  type GenerateJockeyNameInput,
} from '@/ai/flows/generate-jockey-name';

export async function generateJockeyNameAction(
  input: GenerateJockeyNameInput & { apiKey?: string }
) {
  try {
    const result = await generateJockeyName({ ...input, apiKey: input.apiKey });
    return { jockeyName: result.jockeyName };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate jockey name. Please try again.' };
  }
}
