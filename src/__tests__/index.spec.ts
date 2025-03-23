import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { LinkupClient } from 'linkup-sdk';
import { main, parseArgs, displayHelp } from '../index';

describe('parseArgs', () => {
  describe('success cases', () => {
    const apiKey = '77086fdf-94e4-43f3-b5bf-9246b584a50e';
    const baseUrl = 'https://fake-api.linkup.so/v1';

    it('should parse all options correctly', () => {
      const args = { apiKey, baseUrl };
      const options = parseArgs(args);

      expect(options).toEqual({
        apiKey: apiKey,
        baseUrl: baseUrl,
      });
      expect(true).toBe(true);
    });

    it('if api key is set in env variable, should parse base url argument correctly', () => {
      process.env.LINKUP_API_KEY = apiKey;

      const args = { baseUrl };
      const options = parseArgs(args);

      expect(options).toEqual({
        apiKey: apiKey,
        baseUrl: baseUrl,
      });

      delete process.env.LINKUP_API_KEY;
    });

    it('if api key set in env variable but also passed into args, should prefer args key', () => {
      process.env.LINKUP_API_KEY = apiKey;

      const args = { apiKey, baseUrl };
      const options = parseArgs(args);

      expect(options).toEqual({
        apiKey: apiKey,
        baseUrl: baseUrl,
      });

      delete process.env.LINKUP_API_KEY;
    });

    it('ignore all useless arguments', () => {
      const args = {
        apiKey,
        baseUrl,
        uselessField: 'useless-value',
      };
      const options = parseArgs(args);

      expect(options).toEqual({
        apiKey: apiKey,
        baseUrl: baseUrl,
      });
    });
  });

  describe('error cases', () => {
    const baseUrl = 'wrong-url';

    beforeEach(() => {
      delete process.env.LINKUP_API_KEY;
    });

    it('should throw an error if api-key is not provided', () => {
      const args = { baseUrl: 'https://api.linkup.so/v1' };

      expect(() => parseArgs(args)).toThrow(
        'Linkup API key not provided. Please either pass it as an argument --api-key=$KEY or set the LINKUP_API_KEY environment variable.',
      );
    });

    it('should throw an error if base-url is not an url', () => {
      const args = {
        apiKey: '242e0933-214d-4791-ac87-43bc99f9cc76',
        baseUrl,
      };

      expect(() => parseArgs(args)).toThrow('Base url must be a valid url.');
    });
  });
});

jest.mock('linkup-sdk');
jest.mock('@modelcontextprotocol/sdk/server/stdio.js');

describe('main function', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the server', async () => {
    process.argv = [
      'node',
      'index.ts',
      '--api-key=8fe8b666-8dfc-4b5a-9026-48fcdace6cef',
      '--base-url=https://api.linkup.so/v1',
    ];

    await main();

    expect(LinkupClient).toHaveBeenCalledWith({
      apiKey: '8fe8b666-8dfc-4b5a-9026-48fcdace6cef',
      baseUrl: 'https://api.linkup.so/v1',
    });

    expect(StdioServerTransport).toHaveBeenCalled();
  });
});

describe('displayHelp', () => {
  let logSpy: jest.SpyInstance;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit() was called');
    });
  });

  afterEach(() => {
    logSpy.mockRestore();
    exitSpy.mockRestore();
  });

  it('should display help text and exit', () => {
    expect(() => displayHelp()).toThrow('process.exit() was called');
    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining('Usage: npx -y linkup-mcp [options]'),
    );
    expect(exitSpy).toHaveBeenCalledWith(0);
  });
});
