#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { type OptionValues, program } from 'commander';
import { LinkupClient } from 'linkup-sdk';
import { ZodError, z } from 'zod';
import { description, name, version } from '../package.json';

const DEFAULT_API_BASE_URL = 'https://api.linkup.so/v1';

const ArgsType = z.object({
  apiKey: z.preprocess(
    value => value ?? process.env.LINKUP_API_KEY,
    z.string({
      message:
        'Linkup API key not provided. Please either pass it as an argument --api-key=$KEY or set the LINKUP_API_KEY environment variable.',
    }),
  ),
  baseUrl: z
    .string()
    .url({ message: 'Base url must be a valid url.' })
    .default(process.env.LINKUP_API_BASE_URL ?? DEFAULT_API_BASE_URL),
});
type Args = z.infer<typeof ArgsType>;

program
  .name(name)
  .description(description)
  .version(version)
  .option('--api-key <key>', 'Your Linkup API key (required unless LINKUP_API_KEY env is set)')
  .option('--base-url <url>', 'Custom API base URL (default: https://api.linkup.so/v1)')
  .option('-h, --help');

export const parseArgs = (args: OptionValues): Args => {
  const result = ArgsType.safeParse(args);
  if (!result.success) {
    throw new Error((result.error as ZodError).errors.map(e => e.message).join('|'));
  }
  return result.data;
};

const bindTool = (server: McpServer, linkupClient: LinkupClient) => {
  server.tool(
    'search-web',
    'Search the web in real time using Linkup. Use this tool whenever the user needs trusted facts, news, or source-backed information. Returns comprehensive content from the most relevant sources.',
    {
      depth: z
        .enum(['standard', 'deep'])
        .describe(
          "The search depth to perform. Use 'standard' for queries with likely direct answers. Use 'deep' for complex queries requiring comprehensive analysis or multi-hop questions",
        ),
      query: z
        .string()
        .describe(
          "Natural language search query. Full questions work best, e.g., 'How does the new EU AI Act affect startups?'",
        ),
    },
    async ({ query, depth }) =>
      await linkupClient
        .search({
          depth,
          outputType: 'searchResults',
          query,
        })
        .then(({ results }) => ({
          content: [{ text: JSON.stringify(results), type: 'text' }],
        })),
  );
};

export const displayHelp = (): void => {
  console.log(`
  Usage: npx -y linkup-mcp [options]

  Options:
    --api-key         Your Linkup API key (required unless LINKUP_API_KEY env is set)
    --base-url        Custom API base URL (default: https://api.linkup.so/v1)
    --help, -h        Show this help text
  `);
  process.exit(0);
};

export const main = async (): Promise<void> => {
  const args = program.parse(process.argv).opts();

  if (args.help) {
    displayHelp();
  }

  const { apiKey, baseUrl } = parseArgs(args);

  const server = new McpServer({
    name,
    version,
  });

  bindTool(
    server,
    new LinkupClient({
      apiKey,
      baseUrl,
    }),
  );

  await server.connect(new StdioServerTransport());
};

if (require.main === module) {
  main().catch(e => {
    console.error(`An error occurred: ${e.message}`);
    process.exit(1);
  });
}
