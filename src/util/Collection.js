/**
 * A utility class to help make it easier to access the data stores
 * @extends {Map}
 */
class Collection extends Map {
  /**
   * Returns an ordered array of the values of this collection.
   * @returns {Array}
   * @example
   * // identical to:
   * Array.from(collection.values());
   */
  array() {
    return Array.from(this.values());
  }

  /**
   * Returns an ordered array of the keys of this collection.
   * @returns {Array}
   * @example
   * // identical to:
   * Array.from(collection.keys());
   */
  keyArray() {
    return Array.from(this.keys());
  }

  /**
   * Returns the first item in this collection.
   * @returns {*}
   */
  first() {
    return this.values().next().value;
  }

  /**
   * Returns the first key in this collection.
   * @returns {*}
   */
  firstKey() {
    return this.keys().next().value;
  }

  /**
   * Returns the last item in this collection. This is a relatively slow operation,
   * since an array copy of the values must be made to find the last element.
   * @returns {*}
   */
  last() {
    const arr = this.array();
    return arr[arr.length - 1];
  }

  /**
   * Returns the last key in this collection. This is a relatively slow operation,
   * since an array copy of the keys must be made to find the last element.
   * @returns {*}
   */
  lastKey() {
    const arr = this.keyArray();
    return arr[arr.length - 1];
  }

  /**
   * Returns a random item from this collection. This is a relatively slow operation,
   * since an array copy of the values must be made to find a random element.
   * @returns {*}
   */
  random() {
    const arr = this.array();
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Returns a random key from this collection. This is a relatively slow operation,
   * since an array copy of the keys must be made to find a random element.
   * @returns {*}
   */
  randomKey() {
    const arr = this.keyArray();
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /**
   * Returns an array of items where `item[prop] === value` or the given function returns `true`.
   * @param {string|function} propOrFn The property to test against, or the function to test with
   * @param {*} [value] The expected value - only applicable and required if using a property for the first argument
   * @returns {array}
   * @example
   * collection.findAll('username', 'Bob');
   * @example
   * collection.findAll(channel => channel.type === 'text');
   */
  findAll(propOrFn, value) {
    const results = [];
    if (typeof propOrFn === 'string') {
      if (typeof value === 'undefined') throw new Error('Value must be specified.');
      for (const item of this.values()) {
        if (item[propOrFn] === value) results.push(item);
      }
      return results;
    } else if (typeof propOrFn === 'function') {
      for (const [key, val] of this) {
        if (propOrFn(val, key, this)) results.push(val);
      }
      return results;
    } else {
      throw new Error('First argument must be a property string or a function.');
    }
  }

  /**
   * Returns a single item where `item[prop] === value`, or the given function returns `true`.
   * In the latter case, this is identical to
   * [Array.find()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find).
   * @param {string|function} propOrFn The property to test against, or the function to test with
   * @param {*} [value] The expected value - only applicable and required if using a property for the first argument
   * @returns {*}
   * @example
   * collection.find('id', '123123...');
   * @example
   * collection.find(val => val.id === '123123...');
   */
  find(propOrFn, value) {
    if (typeof propOrFn === 'string') {
      if (typeof value === 'undefined') throw new Error('Value must be specified.');
      for (const item of this.values()) {
        if (item[propOrFn] === value) return item;
      }
      return null;
    } else if (typeof propOrFn === 'function') {
      for (const [key, val] of this) {
        if (propOrFn(val, key, this)) return val;
      }
      return null;
    } else {
      throw new Error('First argument must be a property string or a function.');
    }
  }

  /* eslint-disable max-len */
  /**
   * Returns the key of the item where `item[prop] === value`, or the given function returns `true`.
   * In the latter case, this is identical to
   * [Array.findIndex()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex).
   * @param {string|function} propOrFn The property to test against, or the function to test with
   * @param {*} [value] The expected value - only applicable and required if using a property for the first argument
   * @returns {*}
   * @example
   * collection.findKey('id', '123123...');
   * @example
   * collection.findKey(val => val.id === '123123...');
   */
  /* eslint-enable max-len */
  findKey(propOrFn, value) {
    if (typeof propOrFn === 'string') {
      if (typeof value === 'undefined') throw new Error('Value must be specified.');
      for (const [key, val] of this) {
        if (val[propOrFn] === value) return key;
      }
      return null;
    } else if (typeof propOrFn === 'function') {
      for (const [key, val] of this) {
        if (propOrFn(val, key, this)) return key;
      }
      return null;
    } else {
      throw new Error('First argument must be a property string or a function.');
    }
  }

  /**
   * Returns true if the collection has an item where `item[prop] === value` or the given function returns `true`.
   * @param {string|function} propOrFn The property to test against, or the function to test with
   * @param {*} [value] The expected value - only applicable and required if using a property for the first argument
   * @returns {boolean}
   * @example
   * if (collection.exists('id', '123123...')) {
   *  console.log('user here!');
   * }
   * @example
   * if (collection.exists(val => val.id === '123123...')) {
   *  console.log('user here!');
   * }
   */
  exists(propOrFn, value) {
    return Boolean(this.find(propOrFn, value));
  }

  /**
   * Identical to
   * [Array.filter()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter),
   * but returns a Collection instead of an Array.
   * @param {function} fn Function used to test (should return a boolean)
   * @param {Object} [thisArg] Value to use as `this` when executing function
   * @returns {Collection}
   */
  filter(fn, thisArg) {
    if (thisArg) fn = fn.bind(thisArg);
    const collection = new Collection();
    for (const [key, val] of this) {
      if (fn(val, key, this)) collection.set(key, val);
    }
    return collection;
  }

  /**
   * Identical to
   * [Array.map()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map).
   * @param {function} fn Function that produces an element of the new array, taking three arguments
   * @param {*} [thisArg] Value to use as `this` when executing function
   * @returns {array}
   */
  map(fn, thisArg) {
    if (thisArg) fn = fn.bind(thisArg);
    const arr = new Array(this.size);
    let i = 0;
    for (const [key, val] of this) {
      arr[i++] = fn(val, key, this);
    }
    return arr;
  }

  /**
   * Identical to
   * [Array.some()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some).
   * @param {function} fn Function used to test (should return a boolean)
   * @param {Object} [thisArg] Value to use as `this` when executing function
   * @returns {Collection}
   */
  some(fn, thisArg) {
    if (thisArg) fn = fn.bind(thisArg);
    for (const [key, val] of this) {
      if (fn(val, key, this)) return true;
    }
    return false;
  }

  /**
   * Identical to
   * [Array.every()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every).
   * @param {function} fn Function used to test (should return a boolean)
   * @param {Object} [thisArg] Value to use as `this` when executing function
   * @returns {Collection}
   */
  every(fn, thisArg) {
    if (thisArg) fn = fn.bind(thisArg);
    for (const [key, val] of this) {
      if (!fn(val, key, this)) return false;
    }
    return true;
  }

  /**
   * Identical to
   * [Array.reduce()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce).
   * @param {function} fn Function used to reduce
   * @param {*} [startVal] The starting value
   * @returns {*}
   */
  reduce(fn, startVal) {
    let currentVal = startVal;
    for (const [key, val] of this) currentVal = fn(currentVal, val, key, this);
    return currentVal;
  }

  /**
   * If the items in this collection have a delete method (e.g. messages), invoke
   * the delete method. Returns an array of promises
   * @returns {Promise[]}
   */
  deleteAll() {
    const returns = [];
    for (const item of this.values()) {
      if (item.delete) returns.push(item.delete());
    }
    return returns;
  }
}

module.exports = Collection;
