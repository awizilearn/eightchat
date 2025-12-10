'use server';

/**
 * @fileOverview Provides personalized content recommendations based on user subscription history.
 *
 * - recommendContent - A function that returns content recommendations for a user.
 * - ContentRecommendationInput - The input type for the recommendContent function.
 * - ContentRecommendationOutput - The return type for the recommendContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentRecommendationInputSchema = z.object({
  userId: z.string().describe('The ID of the user.'),
  subscriptionHistory: z
    .array(z.string())
    .describe('List of content or creators the user has subscribed to.'),
});
export type ContentRecommendationInput = z.infer<typeof ContentRecommendationInputSchema>;

const ContentRecommendationOutputSchema = z.object({
  recommendations: z
    .array(z.string())
    .describe('List of recommended content or creator IDs.'),
});
export type ContentRecommendationOutput = z.infer<typeof ContentRecommendationOutputSchema>;

export async function recommendContent(input: ContentRecommendationInput): Promise<ContentRecommendationOutput> {
  return recommendContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentRecommendationPrompt',
  input: {schema: ContentRecommendationInputSchema},
  output: {schema: ContentRecommendationOutputSchema},
  prompt: `You are a content recommendation expert.
  Given a user's subscription history, provide a list of content or creator IDs that the user might be interested in.
  User ID: {{{userId}}}
  Subscription History: {{#each subscriptionHistory}}{{{this}}}, {{/each}}
  Recommendations:`,
});

const recommendContentFlow = ai.defineFlow(
  {
    name: 'recommendContentFlow',
    inputSchema: ContentRecommendationInputSchema,
    outputSchema: ContentRecommendationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
