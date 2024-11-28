import { markup } from './format';

export interface RenderOptions {
  /**
   * Level sub objects to render
   */
  maxDepth?: number;
  /**
   * Properties to ignore
   */
  filter?: string[]
  /**
   * Indent spaces
   */
  tabSize?: number;
  /**
   * Colorize object
   */
  isColor?: boolean;
}

export function renderObject(object: any, options: RenderOptions = {}): string {
  const { maxDepth = 5, tabSize = 2, filter = [], isColor = false } = options;
  const tab = ' '.repeat(tabSize);

  const renderFunction = (_object: Function): string => {
    let fnName = `${_object}`.split('\n')[0];
    fnName = fnName.split('{')[0];
    fnName = fnName.replace('function', '').trim();

    let output = 'function';
    output += fnName.startsWith('(') ? fnName : ` ${fnName}`;

    return isColor ? markup(output, { code: 6 }) : output;
  };

  const renderArray = (_object: any[], _indent: number): string => {
    const tabSpace = tab.repeat(_indent + 1);
    if (_object.length === 0) {
      return `[],`;
    }

    let lines = '[\n';
    for (let i = 0; i < _object.length; i++) {
      const item = _object[i];
      lines += tabSpace;
      lines += renderValue(item, _indent + 1);
      lines += '\n';
    }

    lines += tab.repeat(_indent);
    lines += '],'

    return lines;
  };

  const renderObject = (_object: Record<string, any>, _indent: number): string => {
    const keysValues = [];
    for (const property in _object) {
      if (filter.includes(property)) {
        continue;
      }
      keysValues.push([property, _object[property]])
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

      const tabSpace = tab.repeat(_indent + 1);
      let output = '{';
      for (let i = 0; i < keysValues.length; i++) {
        const [property, value] = keysValues[i];

        output += '\n';
        output += tabSpace;
        output += property;
        output += ': ';
        output += renderValue(value, _indent + 1);
      }

      output += `\n${tab.repeat(_indent)}},`;

      return output;
    } else {
      return '{},';
    }
  };

  const renderValue = (_object: any, _indent = 0): string => {
    switch (typeof _object) {
      case 'boolean':
      case 'bigint':
      case 'number':
        return isColor ? (markup(`${_object}`, { code: 3 }) + ',') : `${_object},`;
      case 'string':
      case 'symbol':
        return isColor ? (markup(`"${String(_object)}"`, { code: 2 }) + ',') : `"${String(_object)}",`;
      case 'undefined':
        return isColor ? (markup(`undefined`, { code: 7, format: 2 }) + ',') : `undefined,`;
      case 'object': {
        if (_object === null) {
          return isColor ? (markup(`null`, { code: 7, format: 0, accent: true }) + ',') : 'null,';
        }
        if (_indent >= maxDepth) {
          return Array.isArray(_object) ? `[ ... ],` : `{ ... },`;
        }
        if (Array.isArray(_object)) {
          return renderArray(_object, _indent);
        }

        return renderObject(_object, _indent);
      }
      case 'function': {
        return renderFunction(_object);
      }
    }
  };

  return renderValue(object);
}

