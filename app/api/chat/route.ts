import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

/* ========================================================================== */
/* GEMINI CLIENT */
/* ========================================================================== */

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

/* ========================================================================== */
/* CONFIG */
/* ========================================================================== */

const MAX_INPUT_LENGTH = 8000;
const REQUEST_TIMEOUT = 30000;
const MAX_CONCURRENT_REQUESTS = 5;

/* ========================================================================== */
/* ACTIVE REQUESTS */
/* ========================================================================== */

let activeRequests = 0;

/* ========================================================================== */
/* HELPERS */
/* ========================================================================== */

const timeoutPromise = (ms: number) =>
  new Promise((_, reject) => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);

      reject(new Error("Request timeout"));
    }, ms);
  });

const sanitizeText = (
  text: unknown
): string => {
  if (typeof text !== "string") {
    return "";
  }

  return text
    .replace(/\s+/g, " ")
    .trim();
};

/* ========================================================================== */
/* ROUTE */
/* ========================================================================== */

export async function POST(
  request: Request
) {
  try {
    /* ====================================================================== */
    /* REQUEST LIMIT */
    /* ====================================================================== */

    if (
      activeRequests >=
      MAX_CONCURRENT_REQUESTS
    ) {
      return NextResponse.json(
        {
          success: false,

          reply:
            "সার্ভারে বর্তমানে অনেক বেশি অনুরোধ এসেছে। কয়েক সেকেন্ড পরে আবার চেষ্টা করুন।",
        },
        {
          status: 429,
        }
      );
    }

    activeRequests += 1;

    /* ====================================================================== */
    /* API KEY VALIDATION */
    /* ====================================================================== */

    if (!process.env.GEMINI_API_KEY) {
      console.error(
        "GEMINI_API_KEY missing."
      );

      return NextResponse.json(
        {
          success: false,

          reply:
            "সার্ভারে Gemini API Key কনফিগার করা হয়নি।",
        },
        {
          status: 500,
        }
      );
    }

    /* ====================================================================== */
    /* SAFE BODY PARSE */
    /* ====================================================================== */

    let body: any = null;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,

          reply:
            "Invalid JSON request body.",
        },
        {
          status: 400,
        }
      );
    }

    /* ====================================================================== */
    /* BODY VALIDATION */
    /* ====================================================================== */

    const rawMessage = sanitizeText(
      body?.message
    );

    const rawMessages = Array.isArray(
      body?.messages
    )
      ? body.messages
      : null;

    if (!rawMessage && !rawMessages) {
      return NextResponse.json(
        {
          success: false,

          reply:
            "Message or conversation history is required.",
        },
        {
          status: 400,
        }
      );
    }

    /* ====================================================================== */
    /* BUILD CONTENTS */
    /* ====================================================================== */

    let finalContents: any =
      rawMessage;

    if (rawMessages) {
      finalContents = rawMessages
        .filter(
          (m: any) =>
            m &&
            typeof m.content ===
              "string" &&
            m.content.trim()
        )
        .map((m: any) => ({
          role:
            m.role === "user"
              ? "user"
              : "model",

          parts: [
            {
              text: sanitizeText(
                m.content
              ),
            },
          ],
        }));
    }

    /* ====================================================================== */
    /* EMPTY CONTENT CHECK */
    /* ====================================================================== */

    if (
      !finalContents ||
      (Array.isArray(
        finalContents
      ) &&
        !finalContents.length)
    ) {
      return NextResponse.json(
        {
          success: false,

          reply:
            "কোনো বৈধ মেসেজ পাওয়া যায়নি।",
        },
        {
          status: 400,
        }
      );
    }

    /* ====================================================================== */
    /* INPUT LENGTH PROTECTION */
    /* ====================================================================== */

    const checkLength =
      typeof finalContents ===
      "string"
        ? finalContents
        : JSON.stringify(
            finalContents
          );

    if (
      checkLength.length >
      MAX_INPUT_LENGTH
    ) {
      return NextResponse.json(
        {
          success: false,

          reply:
            "আপনার অনুরোধ অনেক বড় হয়ে গেছে। দয়া করে সংক্ষেপে লিখুন।",
        },
        {
          status: 400,
        }
      );
    }

    /* ====================================================================== */
    /* GEMINI REQUEST */
    /* ====================================================================== */

    const aiPromise =
      ai.models.generateContent({
        model: "gemini-2.5-flash",

        contents: finalContents,

        config: {
          systemInstruction: `
You are the official "AWM ERP AI Assistant".

You are an expert in:
- ERP
- Accounting
- Payroll
- Inventory
- HRM
- Reporting
- Business Intelligence

CRITICAL IDENTITY RULE:
If anyone asks who created you, you must reply:

Created by H. M. Alim Uddin.

Professional Address:
Village: BURDEW
Post Office: COMPANYGANJ-3140
Police Station: COMPANYGONJ
District: SYLHET

GENERAL RULES:
- Always provide professional responses.
- Maintain business-focused behavior.
- Respond in the user's language.
- Never generate misleading financial information.
          `,

          temperature: 0.2,

          maxOutputTokens: 2048,
        },
      });

    /* ====================================================================== */
    /* TIMEOUT PROTECTION */
    /* ====================================================================== */

    const aiResponse: any =
      await Promise.race([
        aiPromise,

        timeoutPromise(
          REQUEST_TIMEOUT
        ),
      ]);

    /* ====================================================================== */
    /* RESPONSE EXTRACTION */
    /* ====================================================================== */

    const generatedText =
      typeof aiResponse?.text ===
      "function"
        ? await aiResponse.text()
        : aiResponse?.text;

    const replyText =
      sanitizeText(
        generatedText
      ) ||
      "দুঃখিত, এআই কোনো উত্তর তৈরি করতে পারেনি।";

    /* ====================================================================== */
    /* SUCCESS */
    /* ====================================================================== */

    return NextResponse.json({
      success: true,

      reply: replyText,
    });
  } catch (error: any) {
    console.error(
      "Advanced Gemini Route Error:",
      error
    );

    const status =
      error?.status ||
      error?.response?.status;

    /* ====================================================================== */
    /* RATE LIMIT */
    /* ====================================================================== */

    if (status === 429) {
      return NextResponse.json(
        {
          success: false,

          reply:
            "অনেক বেশি অনুরোধ করা হয়েছে। কিছুক্ষণ পর আবার চেষ্টা করুন।",
        },
        {
          status: 429,
        }
      );
    }

    /* ====================================================================== */
    /* TIMEOUT */
    /* ====================================================================== */

    if (
      error?.message ===
      "Request timeout"
    ) {
      return NextResponse.json(
        {
          success: false,

          reply:
            "এআই সার্ভার উত্তর দিতে বেশি সময় নিচ্ছে। আবার চেষ্টা করুন।",
        },
        {
          status: 408,
        }
      );
    }

    /* ====================================================================== */
    /* GENERIC ERROR */
    /* ====================================================================== */

    return NextResponse.json(
      {
        success: false,

        reply:
          "দুঃখিত, সার্ভারে অভ্যন্তরীণ সমস্যা হয়েছে।",
      },
      {
        status: 500,
      }
    );
  } finally {
    /* ====================================================================== */
    /* CLEANUP */
    /* ====================================================================== */

    activeRequests = Math.max(
      0,
      activeRequests - 1
    );
  }
}