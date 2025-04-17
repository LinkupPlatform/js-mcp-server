#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { LinkupClient } from 'linkup-sdk';
import { z, ZodError } from 'zod';
import { type OptionValues, program } from 'commander';
import { name, version, description } from '../package.json';

const DEFAULT_API_BASE_URL = 'https://api.linkup.so/v1';

const ArgsType = z.object({
  apiKey: z.preprocess(
    (value) => value ?? process.env.LINKUP_API_KEY,
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
  .option(
    '--api-key <key>',
    'Your Linkup API key (required unless LINKUP_API_KEY env is set)',
  )
  .option(
    '--base-url <url>',
    'Custom API base URL (default: https://api.linkup.so/v1)',
  )
  .option('-h, --help');

export const parseArgs = (args: OptionValues): Args => {
  const result = ArgsType.safeParse(args);
  if (!result.success) {
    throw new Error(
      (result.error as ZodError).errors.map((e) => e.message).join('|'),
    );
  }
  return result.data;
};

const bindTool = (server: McpServer, linkupClient: LinkupClient) => {
  server.tool(
    'search-web',
    'Performs an online search using Linkup search engine and retrieves the top results as a string. This function is useful for accessing real-time information, including news, articles, and other relevant web content.',
    {
      query: z.string().describe('The search query to perform.'),
      depth: z
        .enum(['standard', 'deep'])
        .describe(
          "The search depth to perform. Use 'standard' for straightforward queries with likely direct answers (e.g., facts, definitions, simple explanations). Use 'deep' for: 1) complex queries requiring comprehensive analysis or information synthesis, 2) queries containing uncommon terms, specialized jargon, or abbreviations that may need additional context, or 3) questions likely requiring up-to-date or specialized web search results to answer effectively.",
        ),
    },
    async ({ query, depth }) =>
      await linkupClient
        .search({
          query,
          depth,
          outputType: 'searchResults',
        })
        .then(({ results }) => ({
          content: [{ type: 'text', text: JSON.stringify(results) }],
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
  main().catch((e) => {
    console.error(`An error occurred: ${e.message}`);
    process.exit(1);
  });
}
