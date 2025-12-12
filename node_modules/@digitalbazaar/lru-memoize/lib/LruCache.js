/*!
 * Copyright (c) 2020-2023 Digital Bazaar, Inc. All rights reserved.
 */
import LRU from 'lru-cache';

/**
 * LruCache uses the npm module `lru-cache` to memoize promises.
 *
 * @see https://www.npmjs.com/package/lru-cache
 * @see https://en.wikipedia.org/wiki/Memoization
 * @param {object} cacheOptions - Options for `lru-cache`.
 *   See the npm docs for more options.
 * @param {number} [cacheOptions.max] - The max size of the cache.
 * @param {number} [cacheOptions.maxAge] - The maxAge of an item in ms.
 * @param {boolean} [cacheOptions.updateAgeOnGet=false] - When using
 *   time-expiring entries with maxAge, setting this to true will make
 *   each entry's effective time update to the current time whenever it is
 *   retrieved from cache, thereby extending the expiration date of the entry.
  * @param {boolean} [cacheOptions.disposeOnSettle=false] - When set to true
 *   entries will be removed from cache once they've settled. This is to only
 *   be used when one needs a promise queue.
 *
 * @returns {LruCache} The class.
*/
export class LruCache {
  constructor(cacheOptions = {}) {
    this.options = cacheOptions;
    this.cache = new LRU(cacheOptions);
  }

  /**
   * Deletes a key from the LRU cache.
   *
   * @param {string} key - A key for the cache.
   *
   * @returns {undefined}
  */
  delete(key) {
    return this.cache.del(key);
  }

  /**
   * Memoizes a promise via an LRU cache.
   *
   * @param {object} options - Options to use.
   * @param {string} options.key - A key for the cache.
   * @param {Function<Promise>} options.fn - A Function that returns a
   *   promise to memoize.
   * @param {object} options.options - The LRU cache options to pass
   *   if setting the value in the cache; note: only those options supported
   *   by the underlying LRU cache instance will be supported.
   *
   * @returns {Promise} - The result of the memoized promise.
  */
  async memoize({key, fn, options = {}} = {}) {
    let promise = this.cache.get(key);
    if(promise) {
      return promise;
    }

    // cache miss
    const cacheOptions = {...this.options, ...options};
    promise = fn();
    // this version only supports `maxAge` and `disposeOnSettle`; a future
    // version will support more cache options
    const {maxAge} = cacheOptions;
    this.cache.set(key, promise, maxAge);

    try {
      await promise;
    } catch(e) {
      // if the promise rejects, delete it if the cache entry hasn't changed
      if(promise === this.cache.get(key)) {
        this.cache.del(key);
      }
      throw e;
    }

    // dispose promise once settled (provided the cache entry hasn't changed)
    if(cacheOptions.disposeOnSettle && promise === this.cache.get(key)) {
      this.cache.del(key);
    }

    return promise;
  }
}
