import { Transform, TransformCallback } from 'stream';
import { StringDecoder } from 'string_decoder';

const kLast = Symbol('last');
const kDecoder = Symbol('decoder');

export class StreamSplitter extends Transform {
  matcher = /\r?\n/;

  overflow = false;

  skipOverflow = false;

  maxLength = 300;

  [kLast] = '';

  [kDecoder] = new StringDecoder('utf8');

  private _onLineCallback?: (line: string) => void;

  constructor() {
    super({
      autoDestroy: true,
      readableObjectMode: true,
    });
  }

  addLineHandler(callback: (line: string) => void) {
    this._onLineCallback = callback;
  }

  mapper(incoming: string): any {
    this._onLineCallback?.(incoming);
  }

  _transform(chunk: any, enc: BufferEncoding, cb: TransformCallback) {
    let list: any;
    if (this.overflow) {
      // Line buffer is full. Skip to start of next line.
      const buf = this[kDecoder].write(chunk);
      list = buf.split(this.matcher);

      if (list.length === 1) return cb(); // Line ending not found. Discard entire chunk.

      // Line ending found. Discard trailing fragment of previous line and reset overflow state.
      list.shift();
      this.overflow = false;
    } else {
      this[kLast] += this[kDecoder].write(chunk);
      list = this[kLast].split(this.matcher);
    }

    this[kLast] = list.pop();

    for (let i = 0; i < list.length; i++) {
      try {
        this._push(this.mapper(list[i]));
      } catch (error: any) {
        return cb(error);
      }
    }

    this.overflow = this[kLast].length > this.maxLength;
    if (this.overflow && !this.skipOverflow) {
      cb(new Error('maximum buffer reached'));
      return;
    }

    cb();
  }

  _flush(callback: TransformCallback) {
    // forward any gibberish left in there
    this[kLast] += this[kDecoder].end();

    if (this[kLast]) {
      try {
        this._push(this.mapper(this[kLast]));
      } catch (error: any) {
        return callback(error);
      }
    }

    callback();
  }

  private _push(val?: any) {
    if (val !== undefined) {
      super.push(val);
    }
  }
}