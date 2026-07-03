import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * =========================================================
 * AWM ERP 2026 - AI Translation Engine
 * =========================================================
 * Features:
 * ✅ Enterprise-grade translation
 * ✅ Input validation
 * ✅ Language validation
 * ✅ Secure error handling
 * ✅ Fast GPT-4o processing
 * ✅ Production-ready response format
 * =========================================================
 */

const SUPPORTED_LANGUAGES = [
  "en",
  "bn",
  "es",
  "fr",
  "de",
  "ar",
  "hi",
  "ur",
  "zh",
  "ja",
  "ko",
  "ru",
  "pt",
];

export async function POST(request: NextRequest) {
  try {
    /**
     * Validate API Key
     */
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "OPENAI_API_KEY is missing.",
        },
        { status: 500 }
      );
    }

    /**
     * Parse Request Body
     */
    const body = await request.json();

    const text =
      typeof body.text === "string"
        ? body.text.trim()
        : "";

    const targetLang =
      typeof body.targetLang === "string"
        ? body.targetLang.trim().toLowerCase()
        : "";

    /**
     * Validate Inputs
     */
    if (!text || !targetLang) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Both 'text' and 'targetLang' are required.",
        },
        { status: 400 }
      );
    }

    /**
     * Validate Language
     */
    if (!SUPPORTED_LANGUAGES.includes(targetLang)) {
      return NextResponse.json(
        {
          success: false,
          error: "Unsupported target language.",
          supportedLanguages:
            SUPPORTED_LANGUAGES,
        },
        { status: 400 }
      );
    }

    /**
     * Prevent Oversized Input
     */
    if (text.length > 5000) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Text exceeds maximum limit (5000 chars).",
        },
        { status: 413 }
      );
    }

    /**
     * AI Translation Prompt
     */
    const systemPrompt = `
You are an enterprise-grade multilingual AI translation engine.

RULES:
1. Maintain business and ERP terminology.
2. Preserve formatting and placeholders.
3. Ensure contextual accuracy.
4. Return ONLY translated text.
`;

    const response =
      await openai.chat.completions.create({
        model: "gpt-4o",
        temperature: 0.2,
        max_tokens: 2000,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `
Target Language: ${targetLang}

Text:
${text}
`,
          },
        ],
      });

    const translatedText =
      response.choices?.[0]?.message?.content?.trim() ||
      "";

    if (!translatedText) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Translation model returned empty response.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        translatedText,
        metadata: {
          targetLang,
          characters: text.length,
          translatedAt:
            new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "AI Translation API Error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Internal server error.",
      },
      { status: 500 }
    );
  }
}
