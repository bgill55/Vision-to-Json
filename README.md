# VisionStruct - MCP Server

This project includes a Model Context Protocol (MCP) server that exposes the "Vision-to-JSON" capability.

It is configured to run as a **Web Server** using Server-Sent Events (SSE), making it compatible with platforms like **Shapes.inc**, **Smithery.ai**, and other remote MCP clients.

## Prerequisites

- Node.js (v18 or higher)
- A Google Gemini API Key

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Set Environment Variable:**
    ```bash
    export API_KEY="your_gemini_api_key"
    ```

## How to Connect to Shapes.inc

To use this with Shapes, the server must be accessible via a public URL (https).

### Step 1: Start the Local Server
```bash
node mcp-server.js
```
The server will start on `http://localhost:3000`.

### Step 2: Expose to Internet (using Ngrok)
Since Shapes cannot access your `localhost` directly, you need a tunnel.
1.  Install [ngrok](https://ngrok.com/).
2.  Run the following command in a new terminal:
    ```bash
    ngrok http 3000
    ```
3.  Ngrok will give you a Forwarding URL, e.g., `https://random-id.ngrok-free.app`.

### Step 3: Configure Shapes
1.  Go to your **Shapes** settings -> **AI Configurations**.
2.  Enable **Shape Skills**.
3.  Enable **Custom Skills**.
4.  In the endpoint URL field, paste your ngrok URL with `/sse` appended:
    ```
    https://your-ngrok-url.ngrok-free.app/sse
    ```
5.  Save/Add the skill.

Your Shape can now use the `vision_to_json` tool!

---

## Connecting to Local Clients (Claude Desktop)

If you still want to use this with local clients like Claude Desktop that expect `stdio`:

You will need to revert `mcp-server.js` to use `StdioServerTransport` or create a separate script for local use. The current implementation is optimized for HTTP/SSE.

## API Usage

### `vision_to_json`

-   **Input:**
    -   `image` (string, required): Base64 encoded image data.
    -   `mimeType` (string, optional): Default "image/jpeg".
-   **Output:** The structured JSON string.
