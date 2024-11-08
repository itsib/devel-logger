/// <reference lib="devel-logger" />

/**
 * Colorize string
 * @param {string} value
 * @param {ColorizeOpts} opts
 */
function colorize(value, opts) {
  const { code, accent = false, format = 0 } = opts || {}
  let output = '\x1b[';
  output += `${format};`
  output += accent ? '9' : '3';
  output += `${code}m`
  output += value;
  output += '\x1b[0m';
  return output;
}

function printObject(object, options) {
  options = options || {};
  const maxDepth = options.maxDepth || 5;
  const filter = options.filter && Array.isArray(options.filter) ? options.filter : [];
  const tabSize = options.tabSize || 2;
  const tab = ' '.repeat(tabSize);

  function renderFunction(object) {
    let fnName = `${object}`.split('\n')[0];
    fnName = fnName.split('{')[0];
    fnName = fnName.replace('function', '').trim();

    let output = 'function';
    output += fnName.startsWith('(') ? fnName : ` ${fnName}`;

    return colorize(output, { code: 6 });
  }

  function renderArray(object, indent) {
    const tabSpace = tab.repeat(indent + 1);
    if (object.length === 0) {
      return `[],`;
    }

    let lines = '[\n';
    for (let i = 0; i < object.length; i++) {
      const item = object[i];
      lines += tabSpace;
      lines += renderValue(item, indent + 1);
      lines += '\n';
    }

    lines += tab.repeat(indent);
    lines += '],'

    return lines;
  }

  function renderObject(object, indent) {
    const keysValues = [];
    for (const property in object) {
      if (filter.includes(property)) {
        continue;
      }
      keysValues.push([property, object[property]])
    }

    if (keysValues.length > 0) {
      keysValues.sort(([n0, v0], [n1, v1]) => {
        if (typeof v0 === 'object' && typeof v1 !== 'object') {
          return 1;
        }
        if (typeof v0 !== 'object' && typeof v1 === 'object') {
          return -1;
        }
        return n1 === n0 ? 0 : (n1 < n0 ? 1 : -1);
      });

      const tabSpace = tab.repeat(indent + 1);
      let output = '{';
      for (let i = 0; i < keysValues.length; i++) {
        const [property, value] = keysValues[i];

        output += '\n';
        output += tabSpace;
        output += property;
        output += ': ';
        output += renderValue(value, indent + 1);
      }

      output += `\n${tab.repeat(indent)}},`;

      return output;
    } else {
      return '{},';
    }
  }

  function renderValue(object, indent = 0) {
    switch (typeof object) {
      case 'boolean':
      case 'bigint':
      case 'number':
        return colorize(`${object}`, { code: 3 }) + ',';
      case 'string':
      case 'symbol':
        return colorize(`"${object}"`, { code: 2 }) + ',';
      case 'undefined':
        return colorize(`undefined`, { code: 7, format: 2 }) + ',';
      case 'object': {
        if (object === null) {
          return colorize(`null`, { code: 7, format: 0, accent: true }) + ',';
        }

        if (indent >= maxDepth) {
          return Array.isArray(object) ? `[ ... ],` : `{ ... },`;
        }

        if (Array.isArray(object)) {
          return renderArray(object, indent);
        }

        return renderObject(object, indent);



      }
      case 'function': {
        return renderFunction(object);
      }
    }
  }

  return renderValue(object);
}

/**
 * Creates logger instance
 *
 * @class DevLogger
 * @param {Config} config
 *
 */
function DevLogger(config) {
  const _c = (c => {
    if ( `${c}` !== '[object Object]') {
      throw new Error('INVALID_CONFIG');
    }
    const logLevelCodes = {
      silence: 0,
      error: 1,
      warn: 2,
      info: 3,
      debug: 4,
    };
    const colorCodes = {
      red: 1,
      green: 2,
      yellow: 3,
      blue: 4,
      magenta: 5,
      cyan: 6,
    };
    const colorCode = colorCodes[c.color];

    return Object.freeze({
      levelCode: logLevelCodes[c.logLevel || 'info'],
      colorCode,
      esc: '\x1b[',
      prefix: `[${c.prefix.toUpperCase() || 'LOGGER'}]`,
      begin: Date.now(),
      timeFormat: c.timeFormat || 'relative',
      icons: c.icons !== false,
      override: c.override || (line => line),
    });
  })(config);

  const st = '(?:\\u0007|\\u001B\\u005C|\\u009C)';
  const colorsRegEx = new RegExp([
    `[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?${st})`,
    '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))',
  ].join('|'), 'g');
  const formatSymbolsRegex = /(%s)|(%i(?:\.\d{1,2})?)|(%f(?:\.\d)?)/g

  const primitives = {
    'string': true,
    'number': true,
    'bigint': true,
    'boolean': true,
    'symbol': true,
  };
  const icons = {
    'icon-debug': '🏗',
    'icon-warn': '⚠',
    'icon-error': '🞮',
  };

  /**
   * Remove colors from string
   * @param value - source string
   * @returns {string}
   * @private
   */
  function stripColors(value) {
    if (!value) return value;
    return value.replace(colorsRegEx, '');
  }

  /**
   * Returns formatted date time
   * @returns {string}
   * @private
   */
  function datetime() {
    const date = new Date();

    let formatted = '';
    if (_c.timeFormat === 'human-readable') {
      formatted += date.toLocaleDateString('ru-RU') + ' ';
      formatted += date.toLocaleTimeString('ru-RU') + '.';
      formatted += date.getMilliseconds().toString().padStart(3, '0');
    } else if (_c.timeFormat === 'ISO') {
      formatted += date.toISOString();
    } else if (_c.timeFormat === 'relative') {
      let diff = date.getTime() - _c.begin;
      const milliseconds = (diff % 1000);
      diff = Math.floor(diff / 1000);
      const seconds = (diff % 60);
      diff = Math.floor(diff / 60);
      const minutes = (diff % 60);
      const hours = Math.floor(diff / 60);

      formatted += hours.toString().padStart(3, '0');
      formatted += `:${minutes.toString().padStart(2, '0')}`;
      formatted += `:${seconds.toString().padStart(2, '0')}`;
      formatted += `.${milliseconds.toString().padStart(3, '0')}`;
    }

    return formatted;
  }

  /**
   * Format integer digit
   * @param value
   * @param represent
   * @returns {string}
   */
  function parseFormatInteger(value, represent) {
    let parsed;
    if (value.startsWith('0b')) {
      parsed = parseInt(value.replace('0b', ''), 2);
    } else if (value.startsWith('0o')) {
      parsed = parseInt(value.replace('0o', ''), 8);
    } else if (value.startsWith('0x')) {
      parsed = parseInt(value.replace('0x', ''), 16);
    } else {
      parsed = parseInt(value, 10);
    }
    const [, amount] = represent.split('.');
    const radix = amount && parseInt(amount) || 10;

    if (radix === 16) {
      return '0x' + parsed.toString(16).toUpperCase();
    } else if (radix === 8) {
      return '0o' + parsed.toString(8);
    } else if (radix === 2) {
      return '0b' + parsed.toString(2);
    } else {
      return parsed.toString(radix);
    }
  }

  /**
   * Format float digit
   * @param value
   * @param represent
   * @returns {string}
   */
  function parseFormatFloat(value, represent) {
    const [, amount] = represent.split('.');
    let decimals = undefined;
    if (amount) {
      decimals = parseInt(amount, 10);
    }
    const parsed = parseFloat(value);
    if (decimals == null) {
      return parsed.toString();
    } else {
      return parseFloat(parsed.toFixed(decimals)).toString();
    }
  }

  /**
   * Replace symbols like %s, %i, %f to real values, and format it
   * @param {string} message
   * @param {...any[]} args
   * @returns {string}
   */
  function interpolate(message, ...args) {
    const toReplace = message.match(formatSymbolsRegex);
    let position = 0;

    for (let i = 0; i < toReplace.length; i++) {
      const symbol = toReplace[i];
      let value = '';
      if (symbol === '%s') {
        value = `${args[i]}`
      } else if (symbol.startsWith('%i')) {
        value = parseFormatInteger(`${args[i]}`, symbol);
      } else if (symbol.startsWith('%f')) {
        value = parseFormatFloat(`${args[i]}`, symbol);
      }

      const index = message.indexOf(symbol, position);
      message = message.slice(0, index) + value + message.slice(index + symbol.length);

      position = index + 1;
    }

    return message;
  }

  /**
   * Prepare output string. Add prefix, date or time, etc.
   * @param {string} line - format output line
   * @param {string} [iconName] - Log icon
   * @returns {string}
   * @private
   */
  function formatLine(line, iconName) {
    let output = colorize(_c.prefix, { code: _c.colorCode, accent: true, format: 1 });
    output += colorize(` ${datetime()} `, { code: 7, format: 2 });
    if (iconName === 'icon-debug') {
      output += colorize(`${icons[iconName]} `, { code: 7, format: 0, accent: false });
    } else if (iconName === 'icon-warn') {
      output += colorize(`${icons[iconName]} `, { code: 1, format: 2, accent: false });
    } else if (iconName === 'icon-error') {
      output += colorize(`${icons[iconName]} `, { code: 1, format: 1, accent: true });
    }

    const rawLine = stripColors(line);
    output += colorize(_c.override(rawLine), { code: _c.colorCode });

    return output;
  }

  /**
   * Write log
   * @param text
   * @private
   */
  function write(text) {
    console.log(text);

  }

  /**
   * Format error and stack trace
   * @param error
   * @param message
   */
  function writeError(error, message) {
    console.error(error);
  }

  /**
   * Print many lines text log
   * @param {string} message
   * @param {...any[]} args
   */
  this.print = function (message, ...args) {
    let iconName = undefined;
    if (args[0] && args[0] in icons) {
      iconName = args[0];
      args.shift();
    }

    const objects = [];
    if (formatSymbolsRegex.test(message)) {
      message = interpolate(message, ...args);
    } else {
      for (const arg of args) {
        const type = typeof arg;
        if (type in primitives || arg === null || arg === undefined) {
          message += `${arg}`;
        } else if (type === 'function') {
          message += `${arg}`;
        } else if (type === 'object') {
          objects.push(arg);
        }
      }
    }

    const lines = message.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      write(formatLine(line, iconName));
    }

    // render objects
    for (let i = 0; i < objects.length; i++) {
      write(printObject(objects[i]));
    }
  }

  /**
   * Logger debug
   * @param {string} message Log message or some thing
   * @param {...any[]} args
   */
  this.debug = function (message, ...args) {
    if (_c.levelCode >= 4) {
      if (_c.icons) {
        args.unshift('icon-debug');
      }
      this.print(message, ...args);
    }
  }

  /**
   * Logger info
   * @param {string} message Log message or some thing
   * @param {...any[]} args
   */
  this.info = function (message, ...args) {
    if (_c.levelCode >= 3) {
      this.print(message, ...args);
    }
  }

  /**
   * Logger warn
   * @param {string} message Log message or some thing
   * @param {...any[]} args
   */
  this.warn = function (message, ...args) {
    if (_c.levelCode >= 2) {
      if (_c.icons) {
        args.unshift('icon-warn');
      }
      this.print(message, ...args);
    }
  }

  /**
   * Logger error
   * @param {string|Error} error Log message or some thing
   * @param {...any[]} args
   */
  this.error = function (error, ...args) {
    if (_c.levelCode >= 1) {
      if (_c.icons) {
        args.unshift('icon-error');
      }


      if (error instanceof Error) {
        writeError(error);
        return;
      }
      if (typeof error === 'string' && args[0] instanceof Error) {
        this.print(error);
        writeError(args[0]);
        return;
      }
      this.print(error, ...args);
    }
  }
}

exports.DevLogger = DevLogger;
exports.printObject = printObject;

