/**
 * @author rintoj (Rinto Jose)
 * @license The MIT License (MIT)
 *
 * Copyright (c) 2016 rintoj
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the " Software "), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED " AS IS ", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

'use strict';

var baseLibs = [
  "node_modules/es6-shim/es6-shim.min.js",
  "node_modules/zone.js/dist/zone.js",
  "node_modules/reflect-metadata/Reflect.js",
  "node_modules/systemjs/dist/system.src.js"
];

var compileOnly = [
  "node_modules/@angular/**/*.js",
  "node_modules/rxjs/**/*.js"
];

module.exports = {
  name: 'pathway',
  version: 'a0.1',

  typings: [
    // 'node_modules/@angular/typings/browser.d.ts'
    'typings/main.d.ts'
  ],

  globalLibs: {
    lodash: 'node_modules/lodash/index.js',
    immutable: 'node_modules/immutable/dist/immutable.js',
    dexie: 'node_modules/dexie/dist/dexie.js'
  },

  dev: {
    libs: {
      js: [
        ...baseLibs
        // Add dev only libs here - eg 'node_modules/debug-lib/index.js'
      ],
      compileOnly: [
        ...compileOnly
      ]
    }
  },

  prod: {
    libs: {
      js: [
        ...baseLibs
        // Add prod only libs here - eg 'node_modules/analytics-lib/index.js'
      ],
      compileOnly: [
        ...compileOnly
      ]
    }
  }
};