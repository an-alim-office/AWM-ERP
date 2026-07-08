// app/api/next-gen/ai-voice-erp/route.ts

import { NextRequest, NextResponse } from "next/server";

// =====================================================
// TYPES
// =====================================================

type CommandStatus =
  | "Active"
  | "Training"
  | "Disabled";

interface VoiceCommand {
  _id: string;

  command: string;
  response: string;

  module: string;

  aiModel: string;

  status: CommandStatus;

  accuracy: number;

  executions: number;

  tags: string[];

  features: string[];

  voiceRecognition: boolean;
  liveAIChat: boolean;
  gptVoiceCommand: boolean;
  multiLanguageVoice: boolean;
  realtimeAnalytics: boolean;
  voiceAuthentication: boolean;
  aiAssistantAvatar: boolean;
  websocketLiveUpdates: boolean;
  mongodbStorage: boolean;
  rolePermissionSystem: boolean;
  aiAutomationWorkflow: boolean;
  voicePayrollControl: boolean;
  voiceInventoryControl: boolean;
  aiMeetingAssistant: boolean;
  aiERPCopilot: boolean;

  lastExecutedAt?: string;

  createdAt: string;
  updatedAt: string;
}

// =====================================================
// FEATURE LIST
// =====================================================

const ENTERPRISE_FEATURES = [
  "Voice Recognition",
  "Live AI Chat",
  "GPT Voice Command",
  "Multi Language Voice",
  "Real-time Analytics",
  "Voice Authentication",
  "AI Assistant Avatar",
  "WebSocket Live Updates",
  "MongoDB Persistent Storage",
  "Role Permission System",
  "AI Automation Workflow",
  "Voice Payroll Control",
  "Voice Inventory Control",
  "AI Meeting Assistant",
  "AI ERP Copilot",
];

// =====================================================
// DEMO DATABASE
// =====================================================

let commands: VoiceCommand[] = [
  {
    _id: "1",

    command: "Open Dashboard",

    response:
      "Opening ERP Dashboard",

    module: "Dashboard",

    aiModel: "GPT-5 Turbo",

    status: "Active",

    accuracy: 98,

    executions: 1520,

    tags: [
      "dashboard",
      "voice",
      "erp",
    ],

    features: [
      "Voice Recognition",
      "Live AI Chat",
      "GPT Voice Command",
      "AI ERP Copilot",
      "Real-time Analytics",
    ],

    voiceRecognition: true,
    liveAIChat: true,
    gptVoiceCommand: true,
    multiLanguageVoice: true,
    realtimeAnalytics: true,
    voiceAuthentication: true,
    aiAssistantAvatar: true,
    websocketLiveUpdates: true,
    mongodbStorage: true,
    rolePermissionSystem: true,
    aiAutomationWorkflow: true,
    voicePayrollControl: false,
    voiceInventoryControl: false,
    aiMeetingAssistant: true,
    aiERPCopilot: true,

    lastExecutedAt:
      new Date().toISOString(),

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),
  },

  {
    _id: "2",

    command:
      "Generate Payroll",

    response:
      "Payroll Generated Successfully",

    module: "Payroll",

    aiModel: "GPT-5",

    status: "Training",

    accuracy: 92,

    executions: 620,

    tags: [
      "payroll",
      "finance",
      "automation",
    ],

    features: [
      "Voice Payroll Control",
      "Voice Recognition",
      "AI Automation Workflow",
      "AI ERP Copilot",
    ],

    voiceRecognition: true,
    liveAIChat: false,
    gptVoiceCommand: true,
    multiLanguageVoice: true,
    realtimeAnalytics: true,
    voiceAuthentication: true,
    aiAssistantAvatar: false,
    websocketLiveUpdates: true,
    mongodbStorage: true,
    rolePermissionSystem: true,
    aiAutomationWorkflow: true,
    voicePayrollControl: true,
    voiceInventoryControl: false,
    aiMeetingAssistant: false,
    aiERPCopilot: true,

    lastExecutedAt:
      new Date().toISOString(),

    createdAt:
      new Date().toISOString(),

    updatedAt:
      new Date().toISOString(),
  },
];

// =====================================================
// HELPERS
// =====================================================

function successResponse(
  data: unknown,
  message = "Success",
  status = 200
) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
      serverTime:
        new Date().toISOString(),
    },
    { status }
  );
}

function errorResponse(
  message = "Something Went Wrong",
  status = 500
) {
  return NextResponse.json(
    {
      success: false,
      message,
      serverTime:
        new Date().toISOString(),
    },
    { status }
  );
}

// =====================================================
// GET
// =====================================================

export async function GET(
  request: NextRequest
) {
  try {
    const searchParams =
      request.nextUrl.searchParams;

    const search =
      searchParams.get(
        "search"
      );

    const status =
      searchParams.get(
        "status"
      );

    let filtered =
      [...commands];

    // SEARCH

    if (search) {
      filtered =
        filtered.filter(
          (item) =>
            item.command
              .toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            item.module
              .toLowerCase()
              .includes(
                search.toLowerCase()
              )
        );
    }

    // STATUS FILTER

    if (
      status &&
      status !== "All"
    ) {
      filtered =
        filtered.filter(
          (item) =>
            item.status ===
            status
        );
    }

    // SORT

    filtered.sort(
      (a, b) =>
        b.executions -
        a.executions
    );

    return successResponse(
      {
        total:
          filtered.length,

        active:
          filtered.filter(
            (item) =>
              item.status ===
              "Active"
          ).length,

        training:
          filtered.filter(
            (item) =>
              item.status ===
              "Training"
          ).length,

        disabled:
          filtered.filter(
            (item) =>
              item.status ===
              "Disabled"
          ).length,

        enterpriseFeatures:
          ENTERPRISE_FEATURES,

        commands:
          filtered,
      },
      "Commands Loaded"
    );
  } catch (error) {
    console.error(
      "GET ERROR:",
      error
    );

    return errorResponse(
      "Failed To Fetch Commands"
    );
  }
}

// =====================================================
// POST
// =====================================================

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    // VALIDATION

    if (
      !body.command ||
      !body.response
    ) {
      return errorResponse(
        "Command & Response Required",
        400
      );
    }

    const newCommand: VoiceCommand =
      {
        _id:
          crypto.randomUUID(),

        command:
          body.command,

        response:
          body.response,

        module:
          body.module ||
          "ERP Core",

        aiModel:
          body.aiModel ||
          "GPT-5 Turbo",

        status:
          body.status ||
          "Active",

        accuracy:
          body.accuracy ||
          95,

        executions: 0,

        tags:
          body.tags || [
            "ai",
            "voice",
            "erp",
          ],

        features:
          body.features ||
          ENTERPRISE_FEATURES,

        voiceRecognition:
          body.voiceRecognition ??
          true,

        liveAIChat:
          body.liveAIChat ??
          true,

        gptVoiceCommand:
          body.gptVoiceCommand ??
          true,

        multiLanguageVoice:
          body.multiLanguageVoice ??
          true,

        realtimeAnalytics:
          body.realtimeAnalytics ??
          true,

        voiceAuthentication:
          body.voiceAuthentication ??
          true,

        aiAssistantAvatar:
          body.aiAssistantAvatar ??
          true,

        websocketLiveUpdates:
          body.websocketLiveUpdates ??
          true,

        mongodbStorage:
          body.mongodbStorage ??
          true,

        rolePermissionSystem:
          body.rolePermissionSystem ??
          true,

        aiAutomationWorkflow:
          body.aiAutomationWorkflow ??
          true,

        voicePayrollControl:
          body.voicePayrollControl ??
          true,

        voiceInventoryControl:
          body.voiceInventoryControl ??
          true,

        aiMeetingAssistant:
          body.aiMeetingAssistant ??
          true,

        aiERPCopilot:
          body.aiERPCopilot ??
          true,

        lastExecutedAt:
          new Date().toISOString(),

        createdAt:
          new Date().toISOString(),

        updatedAt:
          new Date().toISOString(),
      };

    commands.unshift(
      newCommand
    );

    return successResponse(
      newCommand,
      "Voice Command Created",
      201
    );
  } catch (error) {
    console.error(
      "POST ERROR:",
      error
    );

    return errorResponse(
      "Failed To Create Command"
    );
  }
}

// =====================================================
// PUT
// =====================================================

export async function PUT(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    if (!body.id) {
      return errorResponse(
        "Command ID Required",
        400
      );
    }

    const index =
      commands.findIndex(
        (item) =>
          item._id ===
          body.id
      );

    if (index === -1) {
      return errorResponse(
        "Command Not Found",
        404
      );
    }

    commands[index] = {
      ...commands[index],

      ...body,

      updatedAt:
        new Date().toISOString(),
    };

    return successResponse(
      commands[index],
      "Command Updated Successfully"
    );
  } catch (error) {
    console.error(
      "PUT ERROR:",
      error
    );

    return errorResponse(
      "Failed To Update Command"
    );
  }
}

// =====================================================
// DELETE
// =====================================================

export async function DELETE(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    if (!body.id) {
      return errorResponse(
        "Command ID Required",
        400
      );
    }

    const exists =
      commands.find(
        (item) =>
          item._id ===
          body.id
      );

    if (!exists) {
      return errorResponse(
        "Command Not Found",
        404
      );
    }

    commands = commands.filter(
      (item) =>
        item._id !==
        body.id
    );

    return successResponse(
      {},
      "Command Deleted Successfully"
    );
  } catch (error) {
    console.error(
      "DELETE ERROR:",
      error
    );

    return errorResponse(
      "Failed To Delete Command"
    );
  }
}