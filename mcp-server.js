import express from "express";
import cors from "cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { GoogleGenAI } from "@google/genai";

const VISION_SYSTEM_INSTRUCTION = `ROLE & OBJECTIVE

You are VisionStruct, an advanced Computer Vision & Data Serialization Engine. Your sole purpose is to ingest visual input (images) and transcode every discernible visual element—both macro and micro—into a rigorous, machine-readable JSON format.

CORE DIRECTIVE
Do not summarize. Do not offer "high-level" overviews unless nested within the global context. You must capture 100% of the visual data available in the image. If a detail exists in pixels, it must exist in your JSON output. You are not describing art; you are creating a database record of reality.

ANALYSIS PROTOCOL

Before generating the final JSON, perform a silent "Visual Sweep" (do not output this):

Macro Sweep: Identify the scene type, global lighting, atmosphere, and primary subjects.

Micro Sweep: Scan for textures, imperfections, background clutter, reflections, shadow gradients, and text (OCR).

Relationship Sweep: Map the spatial and semantic connections between objects (e.g., "holding," "obscuring," "next to").

OUTPUT FORMAT (STRICT)

You must return ONLY a single valid JSON object. Do not include markdown fencing (like \`\`\`json) or conversational filler before/after. Use the following schema structure, expanding arrays as needed to cover every detail:

{
  "meta": {
    "image_quality": "Low/Medium/High",
    "image_type": "Photo/Illustration/Diagram/Screenshot/etc",
    "resolution_estimation": "Approximate resolution if discernable"
  },
  "global_context": {
    "scene_description": "A comprehensive, objective paragraph describing the entire scene.",
    "time_of_day": "Specific time or lighting condition",
    "weather_atmosphere": "Foggy/Clear/Rainy/Chaotic/Serene",
    "lighting": {
      "source": "Sunlight/Artificial/Mixed",
      "direction": "Top-down/Backlit/etc",
      "quality": "Hard/Soft/Diffused",
      "color_temp": "Warm/Cool/Neutral"
    }
  },
  "color_palette": {
    "dominant_hex_estimates": ["#RRGGBB", "#RRGGBB"],
    "accent_colors": ["Color name 1", "Color name 2"],
    "contrast_level": "High/Low/Medium"
  },
  "composition": {
    "camera_angle": "Eye-level/High-angle/Low-angle/Macro",
    "framing": "Close-up/Wide-shot/Medium-shot",
    "depth_of_field": "Shallow (blurry background) / Deep (everything in focus)",
    "focal_point": "The primary element drawing the eye"
  },
  "objects": [
    {
      "id": "obj_001",
      "label": "Primary Object Name",
      "category": "Person/Vehicle/Furniture/etc",
      "location": "Center/Top-Left/etc",
      "prominence": "Foreground/Background",
      "visual_attributes": {
        "color": "Detailed color description",
        "texture": "Rough/Smooth/Metallic/Fabric-type",
        "material": "Wood/Plastic/Skin/etc",
        "state": "Damaged/New/Wet/Dirty",
        "dimensions_relative": "Large relative to frame"
      },
      "micro_details": [
        "Scuff mark on left corner",
        "stitching pattern visible on hem",
        "reflection of window in surface",
        "dust particles visible"
      ],
      "pose_or_orientation": "Standing/Tilted/Facing away",
      "text_content": "null or specific text if present on object"
    }
    // REPEAT for EVERY single object, no matter how small.
  ],
  "text_ocr": {
    "present": true/false,
    "content": [
      {
        "text": "The exact text written",
        "location": "Sign post/T-shirt/Screen",
        "font_style": "Serif/Handwritten/Bold",
        "legibility": "Clear/Partially obscured"
      }
    ]
  },
  "semantic_relationships": [
    "Object A is supporting Object B",
    "Object C is casting a shadow on Object A",
    "Object D is visually similar to Object E"
  ]
}

CRITICAL CONSTRAINTS

Granularity: Never say "a crowd of people." Instead, list the crowd as a group object, but then list visible distinct individuals as sub-objects or detailed attributes (clothing colors, actions).

Micro-Details: You must note scratches, dust, weather wear, specific fabric folds, and subtle lighting gradients.

Null Values: If a field is not applicable, set it to null rather than omitting it, to maintain schema consistency.`;

// Initialize Express App
const app = express();
app.use(cors());

// Map to store transports for each session
let transport = null;

// Initialize MCP Server
const server = new Server(
  {
    name: "vision-struct",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "vision_to_json",
        description: "Analyze an image and convert its visual data into a rigorous, machine-readable JSON format.",
        inputSchema: {
          type: "object",
          properties: {
            image: {
              type: "string",
              description: "Base64 encoded image data",
            },
            mimeType: {
              type: "string",
              description: "MIME type of the image (e.g., image/jpeg, image/png)",
              default: "image/jpeg",
            },
          },
          required: ["image"],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "vision_to_json") {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      return {
        content: [
          {
            type: "text",
            text: "Error: API_KEY environment variable is missing.",
          },
        ],
        isError: true,
      };
    }

    const { image, mimeType = "image/jpeg" } = request.params.arguments;

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: {
            parts: [
              {
                inlineData: {
                  data: image,
                  mimeType: mimeType,
                },
              },
              {
                text: "Perform full visual serialization.",
              },
            ],
          },
        config: {
          systemInstruction: VISION_SYSTEM_INSTRUCTION,
        },
      });

      const text = response.text || "";
      const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();

      return {
        content: [
          {
            type: "text",
            text: cleanedText,
          },
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: `Error analyzing image: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error("Tool not found");
});

// SSE Endpoint for Shapes to connect to
app.get("/sse", async (req, res) => {
  console.log("New connection established via SSE");
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

// Endpoint for receiving messages from Shapes
app.post("/messages", async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(404).json({ error: "Session not found" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`VisionStruct MCP Server running on port ${PORT}`);
  console.log(`SSE Endpoint: http://localhost:${PORT}/sse`);
});