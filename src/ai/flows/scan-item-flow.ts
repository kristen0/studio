'use server';

/**
 * @fileOverview A flow to scan a cut of meat using the device's camera, extract item name, category, and expiry date using AI, and pre-fill the 'Add Item' dialog.
 *
 * - scanItem - A function that handles the item scanning process.
 * - ScanItemInput - The input type for the scanItem function.
 * - ScanItemOutput - The return type for the scanItem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScanItemInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of the item to scan, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ScanItemInput = z.infer<typeof ScanItemInputSchema>;

const ScanItemOutputSchema = z.object({
  itemName: z.string().describe('The name of the scanned cut of meat (e.g., "Ribeye Steak", "Pork Belly").'),
  category: z.string().describe('A suitable category for the meat (e.g., "Beef", "Pork", "Poultry", "Lamb", "Seafood").'),
  expiryDate: z.string().optional().describe('The Best Before or pack date of the item in YYYY-MM-DD format if visible, otherwise null.'),
});
export type ScanItemOutput = z.infer<typeof ScanItemOutputSchema>;

export async function scanItem(input: ScanItemInput): Promise<ScanItemOutput> {
  return scanItemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scanItemPrompt',
  input: {schema: ScanItemInputSchema},
  output: {schema: ScanItemOutputSchema},
  prompt: `You are an AI assistant for a butcher or chef, skilled at analyzing images of packaged meat.

  Your task is to analyze the provided image of a meat product and extract the following details from its label:
  1.  **itemName**: The full name of the cut of meat. Be specific (e.g., "USDA Prime Ribeye", "Organic Chicken Thighs").
  2.  **category**: A relevant category for the item (e.g., "Beef", "Pork", "Poultry", "Lamb", "Seafood").
  3.  **expiryDate**: If a "Best Before", "Use-By", "Sell-By", or "Packaged On" date is visible, extract it and format it as YYYY-MM-DD. If no date is visible, return null for this field.

  Respond ONLY with a valid JSON object matching the specified output schema.

  Image: {{media url=photoDataUri}}
  `,
});

const scanItemFlow = ai.defineFlow(
  {
    name: 'scanItemFlow',
    inputSchema: ScanItemInputSchema,
    outputSchema: ScanItemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
