// https://stackoverflow.com/a/1583281

export class RingBuffer {
  /**
   * @private
   * @type {number}
   */
  _pointer;

  /**
   * @private
   * @type {Array<any>}
   */
  _buffer;

  constructor(size) {
    this._buffer = new Array(size);
    this._pointer = 0;
  }

  /**
   *
   * @param {any} value
   */
  push(value) {
    if (this._pointer === this._buffer.length) {
      this._pointer = 0;
    }
    this._buffer[this._pointer] = value;
    this._pointer++;
  }

  /**
   *
   * @param {number} index
   * @returns
   */
  get(index) {
    return this._buffer[index];
  }

  /**
   *
   * @param {(value: any, index: number) => void} callback
   */

  forEach(callback) {
    for (let i = 0; i < this._buffer.length; i++) {
      callback(this._buffer[i], i);
    }
  }
}
