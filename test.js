const { PrettyLogger } = require('./index');

const testObj = {
  property1: 'property1',
  property2: 34.001,
  property3: undefined,
  property4: null,
  property5: {
    nested1: 'Nested property',
    nested2: true,
    nested3: true,
  },
};

(() => {
  const serverLogger = new PrettyLogger({
    prefix: 'server',
    color: 'yellow',
    logLevel: 'debug',
  });

  const clientLogger = new PrettyLogger({
    prefix: 'client',
    color: 'blue',
    logLevel: 'debug',
  });


  clientLogger.info('Test float $%f.2 asd', 123.43534);
  clientLogger.info('Test int interpolate %i', 43534);
  clientLogger.info('Test int hex interpolate %i.16', 43534);
  clientLogger.info('Test int octal interpolate %i.8', 43534);
  clientLogger.info('Test int bin interpolate %i.2', 43534);
  serverLogger.info('Test string interpolate - %s', 'interpolated!');
  clientLogger.warn('1. Warning message \n2. Warning message');
  serverLogger.info('Test output');
  serverLogger.info('Display object', testObj);
  serverLogger.error('Error message');

  console.log('my array %O', testObj)
})();
