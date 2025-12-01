// Static metadata describing the MCP tools exposed by the server.
// Keep this in sync with the handlers in mcp-server.js (tool name and input schema).
const METADATA = {
  name: 'vision-struct',
  version: '1.0.0',
  tools: [
    {
      name: 'vision_to_json',
      description: 'Visual Analysis Tool. Use this tool when the user asks to analyze, describe, or convert an image into JSON. It provides a deep structural breakdown of the visual elements.',
      inputSchema: {
        type: 'object',
        properties: {
          image: {
            type: 'string',
            description: 'Base64 encoded image data (clean string, no data URI prefix)',
          },
          mimeType: {
            type: 'string',
            description: 'MIME type of the image (e.g., image/jpeg, image/png)',
            default: 'image/jpeg',
          },
        },
        required: ['image'],
      },
    },
  ],
};

// Export a function to mount the routes on an Express app instance
export default function mountMetadataRoutes(app) {
  // Basic health / root redirect (optional)
  app.get('/', (req, res) => {
    res.json({
      status: 'ok',
      info: 'VisionStruct MCP server. Use /sse for SSE or /metadata.json for tool listing.'
    });
  });

  // Standard metadata endpoint some clients expect
  app.get('/metadata.json', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json(METADATA);
  });

  // Alternate /mcp path returning same payload
  app.get('/mcp', (req, res) => {
    res.set('Cache-Control', 'no-store');
    res.json(METADATA);
  });

  // Optional endpoint to return just the tool names
  app.get('/tools', (req, res) => {
    res.json({
      tools: METADATA.tools.map(t => ({
        name: t.name,
        description: t.description
      }))
    });
  });
}