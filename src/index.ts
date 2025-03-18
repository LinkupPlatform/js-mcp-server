#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { LinkupClient } from 'linkup-sdk';
import { z } from 'zod';
import { type OptionValues, program } from 'commander';
import { name, version, description } from '../package.json';

type Args = {
  apiKey: string;
  baseUrl?: string;
  help?: boolean;
};

program
  .name(name)
  .description(description)
  .version(version)
  .option(
    '--api-key <key>',
    'Your Linkup API key (required unless LINKUP_API_KEY env is set)',
  )
  .option('--base-url <url>', 'Custom API base URL', 'https://api.linkup.so/v1')
  .option('-h, --help');

export const parseArgs = (args: OptionValues): Args => {
  const options: Args = {
    apiKey: process.env.LINKUP_API_KEY || '',
    baseUrl: process.env.LINKUP_API_BASE_URL || 'https://api.linkup.so/v1',
  };

  if (args.apiKey) {
    if (!z.string().trim().uuid().safeParse(args.apiKey).success) {
      throw new Error('API key must be an uuid.');
    } else {
      options.apiKey = args.apiKey;
    }
  }

  if (args.baseUrl) {
    if (!z.string().trim().url().safeParse(args.baseUrl).success) {
      throw new Error('Base url must be an url.');
    } else {
      options.baseUrl = args.baseUrl;
    }
  }

  // Check if API key is either provided in args or set in environment variables
  if (options.apiKey === '') {
    throw new Error(
      'Linkup API key not provided. Please either pass it as an argument --api-key=$KEY or set the LINKUP_API_KEY environment variable.',
    );
  }

  return options;
};

const instantiateTool = (server: McpServer, linkupClient: LinkupClient) => {
  server.tool(
    'search-web',
    'Performs a search for user input query using Linkup sdk then returns a string of the top search results. Should be used to search real-time data.',
    {
      query: z.string().describe('The search query to perform.'),
      depth: z
        .enum(['standard', 'deep'])
        .describe(
          'The depth of the search. Deep search is time consuming and expensive, use it wisely.',
        ),
    },
    async ({ query, depth }) => {
      const result = await linkupClient.search({
        query,
        depth,
        outputType: 'searchResults',
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result),
          },
        ],
      };
    },
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

  const options = parseArgs(args);
  const transport = new StdioServerTransport();
  const server = new McpServer({
    name,
    version,
  });
  const linkupClient = new LinkupClient({
    apiKey: options.apiKey,
    baseUrl: options.baseUrl,
  });

  instantiateTool(server, linkupClient);

  await server.connect(transport);
};

if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
  });
}
