# Linkup Model Context Protocol

This package provides a [Model Context Protocol](https://modelcontextprotocol.com/) server for integrating Linkup's web search functionality with AI models that support function calling through MCP.

## Installation & Usage

You can run the Linkup MCP server directly using npx:

```bash
npx -y linkup-mcp --api-key=YOUR_LINKUP_API_KEY
```

Alternatively, you can set your API key as an environment variable:

```bash
export LINKUP_API_KEY=YOUR_LINKUP_API_KEY
npx -y linkup-mcp
```

# Command Line Options

| Option       | Description                                                       |
| ------------ | ----------------------------------------------------------------- |
| `--api-key`  | Your Linkup API key (required unless `LINKUP_API_KEY` env is set) |
| `--base-url` | Custom API base URL (default: `https://api.linkup.so/v1`)         |
| `--help, -h` | Show help text                                                    |

# Usage with Claude

Add the following to your `claude_desktop_config.json`. See the [MCP documentation](https://modelcontextprotocol.io/quickstart/user) for more details.

To ensure compatibility with Claude, we recommend that `npx` command be accessible within the same environment. A common location for this is `/usr/local/bin/node` (on mac)

```json
{
  "mcpServers": {
    "linkup": {
      "command": "npx",
      "args": ["-y", "linkup-mcp"],
      "env": {
        "LINKUP_API_KEY": "YOUR_LINKUP_API_KEY"
      }
    }
  }
}
```

or

```json
{
  "mcpServers": {
    "linkup": {
      "command": "npx",
      "args": ["-y", "linkup-mcp", "--api-key=YOUR_LINKUP_API_KEY"]
    }
  }
}
```

## Available Tools

| Tool         | Description                             |
| ------------ | --------------------------------------- |
| `search-web` | Perform a web search query using Linkup |

## Development

Clone the repository and install dependencies:

```bash
git clone git@github.com:LinkupPlatform/linkup-js-mcp.git
cd linkup-js-mcp
npm install
```

# Available Scripts

| Script               | Description                  |
| -------------------- | ---------------------------- |
| `npm run build`      | Build the TypeScript project |
| `npm run lint`       | Run ESLint                   |
| `npm run format`     | Format code with Prettier    |
| `npm run test`       | Run tests                    |
| `npm run test:watch` | Run tests in watch mode      |

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
