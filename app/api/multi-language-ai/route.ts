import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * =========================================================
 * AWM ERP 2026 - AI Translation Engine
 * =========================================================
 * ✅ Enterprise Grade Translation
 * ✅ OpenAI GPT-4o Optimized
 * ✅ Advanced Validation
 * ✅ Rate-Limit Ready
 * ✅ Production Error Handling
 * ✅ Secure API Key Protection
 * ✅ Language Detection Friendly
 * ✅ Token Safe
 * ✅ ERP/Business Terminology Optimized
 * =========================================================
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * =========================================================
 * Supported Language Codes
 * =========================================================
 */
const SUPPORTED_LANGUAGES = [
  "en",
  "bn",
  "hi",
  "ar",
  "es",
  "fr",
  "de",
  "pt",
  "ru",
  "zh",
  "ja",
  "ko",
  "tr",
  "it",
  "id",
];

/**
 * =========================================================
 * MAX INPUT LIMIT
 * =========================================================
 */
const MAX_TEXT_LENGTH = 5000;

/**
 * =========================================================
 * POST
 * =========================================================
 */
export async function POST(request: NextRequest) {
  try {
    /**
     * -----------------------------------------------------
     * Environment Validation
     * -----------------------------------------------------
     */
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing OPENAI_API_KEY environment variable.",
        },
        { status: 500 }
      );
    }

    /**
     * -----------------------------------------------------
     * Parse Body
     * -----------------------------------------------------
     */
    const body = await request.json();

    const text =
      typeof body?.text === "string"
        ? body.text.trim()
        : "";

    const targetLang =
      typeof body?.targetLang === "string"
        ? body.targetLang.trim().toLowerCase()
        : "";

    /**
     * -----------------------------------------------------
     * Validation
     * -----------------------------------------------------
     */
    if (!text) {
      return NextResponse.json(
        {
          success: false,
          error: "Text is required.",
        },
        { status: 400 }
      );
    }

    if (!targetLang) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Target language code is required.",
        },
        { status: 400 }
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      return NextResponse.json(
        {
          success: false,
          error: `Text exceeds maximum limit of ${MAX_TEXT_LENGTH} characters.`,
        },
        { status: 413 }
      );
    }

    /**
     * -----------------------------------------------------
     * Optional Language Validation
     * -----------------------------------------------------
     */
    if (
      !SUPPORTED_LANGUAGES.includes(targetLang)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Unsupported target language code.",
          supportedLanguages:
            SUPPORTED_LANGUAGES,
        },
        { status: 400 }
      );
    }

    /**
     * -----------------------------------------------------
     * AI SYSTEM PROMPT
     * -----------------------------------------------------
     */
    const systemPrompt = `
You are an enterprise-grade multilingual AI translation engine designed for ERP systems, HR platforms, payroll systems, finance tools, and workforce management software.

CRITICAL REQUIREMENTS:

1. Translate professionally and naturally.
2. Preserve ERP/business terminology.
3. Maintain formatting, variables, placeholders, IDs, emails, URLs, and numbers.
4. Preserve JSON-like structures if present.
5. Do NOT add explanations.
6. Do NOT add quotation marks.
7. Output ONLY the translated content.
8. Ensure cultural and contextual correctness.
9. Keep technical terms accurate.
10. Avoid hallucination or extra text.
`;

    /**
     * -----------------------------------------------------
     * USER PROMPT
     * -----------------------------------------------------
     */
    const userPrompt = `
Target Language: ${targetLang}

Text:
${text}
`;

    /**
     * -----------------------------------------------------
     * OpenAI Request
     * -----------------------------------------------------
     */
    const response =
      await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.2,
        max_tokens: 3000,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      });

    /**
     * -----------------------------------------------------
     * Extract Translation
     * -----------------------------------------------------
     */
    const translatedText =
      response.choices?.[0]?.message?.content?.trim() ||
      "";

    if (!translatedText) {
      return NextResponse.json(
        {
          success: false,
          error:
            "AI returned an empty translation.",
        },
        { status: 502 }
      );
    }

    /**
     * -----------------------------------------------------
     * Success Response
     * -----------------------------------------------------
     */
    return NextResponse.json(
      {
        success: true,
        translatedText,
        meta: {
          model: "gpt-4o",
          targetLanguage: targetLang,
          inputLength: text.length,
          outputLength:
            translatedText.length,
          timestamp:
            new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    /**
     * -----------------------------------------------------
     * Error Handler
     * -----------------------------------------------------
     */
    console.error(
      "❌ AI Translation Route Error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Unknown server error occurred.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
