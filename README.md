# VisionStruct - MCP Server

This project includes a Model Context Protocol (MCP) server that exposes the "Vision-to-JSON" capability.

It is configured to run as a **Web Server** using Server-Sent Events (SSE), making it compatible with platforms like **Shapes.inc**, **Smithery.ai**, and other remote MCP clients.

## Deployment to Render.com

This repository is ready for one-click deployment.

1.  **Create a New Web Service** on Render connected to this repository.
2.  **Environment Variables:** Add `API_KEY` with your Google Gemini API Key.
3.  **Build & Start Settings:**
    *   **Build Command:** `npm install`
    *   **Start Command:** `node mcp-server.js`

## Connecting to Shapes.inc

Once your Render service is live (e.g., `https://vision-struct.onrender.com`), you can connect it to Shapes.

1.  Go to your **Shapes** settings -> **AI Configurations**.
2.  Enable **Shape Skills** -> **Custom Skills**.
3.  In the endpoint URL field, paste your Render URL with `/sse` appended:
    ```
    https://your-app-name.onrender.com/sse
    ```
4.  Save/Add the skill.

Your Shape can now use the `vision_to_json` tool!
