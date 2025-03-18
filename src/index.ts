#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { LinkupClient } from 'linkup-sdk';
import { z } from 'zod';
import { type OptionValues, program } from 'commander';

type Args = {
  apiKey: string;
  baseUrl?: string;
  help?: boolean;
};

program
  .name('linkup-mcp')
  .description('Linkup Model Context Protocol server')
  .version('1.0.0')
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
    `A team member that will search the internet to answer your question. Ask him for all your questions that require browsing the web. 
    Note that this agent is using a powerful language model and it can do the search and analyse the results. 
    You should ask question in a way to let the language model to perform the best, i.e. provide as much context as possible and ask in a clear way.
    Provide him as much context as possible, in particular if you need to search on a specific timeframe!
    And don't hesitate to provide him with a complex search task, like finding a difference between two webpages.
    Your request must be a real sentence, not a google search! Like "Find me this information (...)" rather than a few keywords.`,
    {
      query: z.string().describe('The search query to perform.'),
    },
    async ({ query }) => {
      const result = await linkupClient.search({
        query,
        depth: 'standard',
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
    name: 'linkup-mcp',
    version: '1.0.0',
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
