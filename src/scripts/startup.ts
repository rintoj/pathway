
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

declare var System: any;

// @if isDev
/**
 * The package name `js` matches the folder structure inside `/build`.
 * And the `main` property points to the app entry file - `bootstrap.js`.
 */
System.config({
  packages: {
    'js': {
      main: 'app.js',
    },
    'lib': {
      format: 'register',
      defaultExtension: 'js'
    }
  },
  'map': {
    'dexie': 'libs/libs.js'
  }
});

System.import('js').catch(console.error.bind(console));
// @endif

// @if isProd
/**
 * The bundle name `js/app.js` matches the file under the `/build` folder.
 * It also maps the entry dependecy module - `bootstrap`.
 */
System.config({
  bundles: {
    'js/app.js': ['app']
  }
});

System.import('bootstrap').catch(console.error.bind(console));
// @endif
