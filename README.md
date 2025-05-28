# 🌟 Linkup JS MCP Server

A Model Context Protocol (MCP) server that provides web search capabilities through Linkup's advanced search API. This server enables AI assistants and development tools to perform intelligent web searches with natural language queries.

## ✨ Why Linkup?

- 🔍 **Advanced Web Search**: Leverage Linkup's AI-powered search engine for high-quality, relevant results
- 💬 **Natural Language Queries**: Ask questions in plain English or your preferred language - no need for keyword optimization
- 🚀 **Real-time Information**: Access up-to-date web content and current information
- 📚 **Comprehensive Results**: Get detailed search results with source citations
- 🔧 **Easy Integration**: Works with any MCP-compatible client

## 🚀 Installation

The Linkup MCP server can be used with any MCP-compatible client. 

For an integration with Claude Desktop or with Cursor, please follow instruction [here](https://docs.linkup.so/pages/integrations/mcp/mcp).

You can check the NPM page [here](https://www.npmjs.com/package/linkup-mcp-server).

You can run the Linkup MCP server directly using npx:

```bash
npx -y linkup-mcp-server --api-key=YOUR_LINKUP_API_KEY
```

Alternatively, you can set your API key as an environment variable:

```bash
export LINKUP_API_KEY=YOUR_LINKUP_API_KEY
npx -y linkup-mcp-server
```

**Command Line Options**

| Option       | Description                                                       |
| ------------ | ----------------------------------------------------------------- |
| `--api-key`  | Your Linkup API key (required unless `LINKUP_API_KEY` env is set) |
| `--base-url` | Custom API base URL (default: `https://api.linkup.so/v1`)         |
| `--help, -h` | Show help text                                                    |

Consult your MCP client's documentation for specific configuration instructions.

## 💬 Example Queries

The Linkup MCP server excels at answering complex questions and finding specific information:

- "What are the latest developments in quantum computing?"
- "How does the EU AI Act affect startups?"
- "Find recent research on sustainable aviation fuel"
- "What are the current best practices for MCP server development?"

## 🤝 Contributing

Pull requests are welcome! Feel free to open an issue first to discuss what you’d like to see improved.

### Development

Clone the repository and install dependencies:

```bash
git clone git@github.com:LinkupPlatform/js-mcp-server.git
cd js-mcp-server
npm install
```

### Available Scripts

| Script               | Description                  |
| -------------------- | ---------------------------- |
| `npm run build`      | Build the TypeScript project |
| `npm run lint`       | Run ESLint                   |
| `npm run format`     | Format code with Prettier    |
| `npm run test`       | Run tests                    |
| `npm run test:watch` | Run tests in watch mode      |

## 📚 Resources

- [Linkup Documentation](https://docs.linkup.so)
- [MCP Protocol Specification](https://modelcontextprotocol.io)
- [Linkup API Reference](https://docs.linkup.so/api-reference)

## 📣 Community & Support

* Email: [support@linkup.so](mailto:support@linkup.so)
* Discord: [Join our community](https://discord.com/invite/9q9mCYJa86)
* X / Twitter: [@Linkup_platform](https://x.com/Linkup_platform)

## 📄 License

This project is licensed under the MIT License - Innovate freely! 🚀