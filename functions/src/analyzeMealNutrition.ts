import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import * as admin from "firebase-admin";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";
import z from "zod";
import { defineString } from "firebase-functions/params";

// Initialize Firebase Admin
admin.initializeApp();

const OPENAI_API_KEY = defineString("OPENAI_API_KEY");

// Initialize OpenAI client with API key from Firebase Functions config
const getOpenAIClient = () =>
  new OpenAI({
    apiKey: OPENAI_API_KEY.value(),
  });

// Simple authorization function
const isAuthorized = (token: admin.auth.DecodedIdToken): boolean => {
  // You can implement custom role checking similar to intelevator's approach
  // For now, we'll just check if the user is authenticated
  return !!token.uid;
};

// Types for the meal analysis using Zod for validation
const MealAnalysisInputSchema = z
  .object({
    description: z.string().nullish(),
    imageBase64: z.string().nullish(),
  })
  .refine((data) => !!data.description || !!data.imageBase64, {
    message: "Either meal description or image must be provided",
  });

export type MealAnalysisInput = z.infer<typeof MealAnalysisInputSchema>;

export interface NutritionAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

// Type for OpenAI image message content
interface ImageContent {
  type: "image_url";
  image_url: {
    url: string;
  };
}

interface TextContent {
  type: "text";
  text: string;
}

type MessageContent = string | (ImageContent | TextContent)[];

/**
 * Firebase Function to analyze meal nutrition using OpenAI
 * This function expects either a text description or a base64-encoded image (or both)
 * and returns a structured nutritional analysis.
 */
export const analyzeMealNutrition = onCall(
  {
    cors: true,
    region: "us-central1",
    memory: "256MiB",
    timeoutSeconds: 540,
  },
  async ({ data: unsafeData, auth }) => {
    logger.info("Analyzing meal nutrition", { structuredData: true });

    if (!auth) {
      throw new HttpsError(
        "unauthenticated",
        "User must be authenticated to analyze meals"
      );
    }

    if (!isAuthorized(auth.token)) {
      throw new HttpsError("permission-denied", "User is not authorized");
    }

    // Initialize OpenAI client at runtime
    const openai = getOpenAIClient();

    // Safe parse the data
    const parseResult = MealAnalysisInputSchema.safeParse(unsafeData);
    if (!parseResult.success) {
      logger.error(parseResult.error, { structuredData: true });
      throw new HttpsError(
        "invalid-argument",
        "Invalid data",
        parseResult.error
      );
    }

    const { data } = parseResult;

    try {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: "system",
          content:
            "You are a nutritional analysis expert. Analyze the provided meal description and/or image and return the nutritional information in a structured JSON format with the following fields: calories (total calories), protein (grams), carbs (grams), and fat (grams). Provide your best estimate based on the visible food items.",
        },
      ];

      // Add text input if provided
      if (data.description) {
        messages.push({
          role: "user",
          content: `Please analyze this meal: ${data.description}`,
        });
      }

      // Add image content if provided
      if (data.imageBase64) {
        // Using proper typing for the OpenAI API
        const imageMessageContent: MessageContent = [
          {
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${data.imageBase64}`,
            },
          },
          {
            type: "text",
            text: "Please analyze the nutritional content of this meal image.",
          },
        ];

        messages.push({
          role: "user",
          content: imageMessageContent,
        } as ChatCompletionMessageParam);
      }

      // Call OpenAI API with GPT-4 Vision capabilities
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: messages,
        max_tokens: 1000,
        response_format: { type: "json_object" },
      });

      const content = response.choices[0]?.message.content;

      if (!content) {
        throw new HttpsError("internal", "Failed to analyze meal nutrition");
      }

      // Parse the response and extract nutritional information
      const result = JSON.parse(content);

      // Log the analysis
      logger.info("Meal analysis result", {
        userId: auth.uid,
        hadImage: !!data.imageBase64,
        hadDescription: !!data.description,
        structuredData: true,
      });

      // Return the structured analysis
      return {
        calories: Number(result.calories) || 0,
        protein: Number(result.protein) || 0,
        carbs: Number(result.carbs) || 0,
        fat: Number(result.fat) || 0,
      };
    } catch (error) {
      logger.error("Error analyzing meal:", error);
      throw new HttpsError(
        "internal",
        "Failed to analyze meal nutrition. Please try again."
      );
    }
  }
);
