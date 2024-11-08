const { DevLogger } = require('./index');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

const cases = [
  async () => {
    console.log('\x1b[4;97mUsage two instance same time\x1b[0m');

    const serverLogger = new DevLogger({
      prefix: 'server',
      color: 'yellow',
      logLevel: 'debug',
    });

    const clientLogger = new DevLogger({
      prefix: 'client',
      color: 'blue',
      logLevel: 'debug',
    });

    serverLogger.info('Starting Nest application... NestFactory');
    serverLogger.info('PrismaModule dependencies initialized InstanceLoader');
    await sleep(300)
    clientLogger.info('JwtModule dependencies initialized InstanceLoader');
    await sleep(400)
    serverLogger.info('ConfigHostModule dependencies initialized InstanceLoader');
    clientLogger.info('ConfigModule dependencies initialized InstanceLoader');
    await sleep(200)
    serverLogger.info('Starting Nest application... NestFactory');
    await sleep(500)
    serverLogger.info('PrismaModule dependencies initialized InstanceLoader');
    clientLogger.info('JwtModule dependencies initialized InstanceLoader');
    await sleep(300)
    serverLogger.info('ConfigHostModule dependencies initialized InstanceLoader');
    clientLogger.info('ConfigModule dependencies initialized InstanceLoader');
    await sleep(300)
    console.log('\x1b[2;37m' + '─'.repeat(50) + '\x1b[0m\n');
  },
  async () => {
    console.log('\x1b[4;97mTest interpolation\x1b[0m');

    const Logger = new DevLogger({
      prefix: 'server',
      color: 'magenta',
      logLevel: 'debug',
    });

    Logger.info('Test interpolate float - $%f.2', 123.43534);
    await sleep(100)
    Logger.info('Test interpolate integer - %i', 43534);
    await sleep(100)
    Logger.info('Test interpolate hex format - %i.16', 43534);
    Logger.info('Test interpolate octal format - %i.8', 43534);
    await sleep(100)
    Logger.info('Test interpolate bin format - %i.2', 43534);
    Logger.info('Test interpolate string - %s', 'interpolated!');
    await sleep(100)
    console.log('\x1b[2;37m' + '─'.repeat(50) + '\x1b[0m\n');
  },
  async () => {
    console.log('\x1b[4;97mDisplay some objects\x1b[0m');

    const clientLogger = new DevLogger({
      prefix: 'client',
      color: 'cyan',
      logLevel: 'debug',
    });

    clientLogger.info('JavaScript Object:', {
      property1: 'property1',
      property2: 34.001,
      property3: undefined,
      property4: null,
      property5: {
        nested1: 'Nested property',
        nested2: true,
        nested3: true,
      },
    });

    await sleep(500)

    clientLogger.info('JavaScript Array of Strings:', [
      '/home/.nvm/versions/node/v20.17.0/bin/node',
      '/home/projects/package/test.js',
      '/etc/application/script.sh',
    ]);

    await sleep(500)

    clientLogger.info('JavaScript Array of Objects:', [
      {
        property1: 'property1',
        property2: 34.001,
        property3: undefined,
        property4: null,
        property5: function callback(param1, param2) {},
      },
      {
        property1: 'property1',
        property2: 34.001,
        property3: undefined,
        property4: null,
      },
    ]);

    console.log('\x1b[2;37m' + '─'.repeat(50) + '\x1b[0m\n');
  },
  async () => {
    console.log('\x1b[4;97mSet log level\x1b[0m');

    const Logger = new DevLogger({
      prefix: 'client',
      color: 'green',
      logLevel: 'debug',
    });

    console.log('Now log level - debug')
    Logger.debug('Debug should display');
    Logger.info('Info should display');
    Logger.warn('Warn should display');
    Logger.error('Error should display');

    await sleep(300)

    Logger.setLogLevel('warn')
    console.log('Now log level - warn')
    Logger.debug('Debug should display');
    Logger.info('Info should display');
    Logger.warn('Warn should display');
    Logger.error('Error should display');

    await sleep(300)

    Logger.setLogLevel('silence')
    console.log('Now log level - silence')
    Logger.debug('Debug should display');
    Logger.info('Info should display');
    Logger.warn('Warn should display');
    Logger.error('Error should display');

    console.log('\x1b[2;37m' + '─'.repeat(50) + '\x1b[0m\n');
  },
  async () => {
    console.log('\x1b[4;97mDisplay errors\x1b[0m');

    const Logger = new DevLogger({
      prefix: 'server',
      color: 'blue',
      logLevel: 'debug',
    });

    Logger.error(new Error('Error should display'));
    Logger.error(new SyntaxError('Error should display'));
    Logger.error(new URIError('Error should display'));


    console.log('\x1b[2;37m' + '─'.repeat(50) + '\x1b[0m\n');
  },
];

async function start() {
  for (const test of cases) {
    await test();
    await sleep(100);
  }
}

start()
  .then(() => {
    process.exit(0);
  })
  .catch(console.error);