
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

// // @if isDev
// System.config({
//   packages: {
//     js: {
//       main: 'app.js',
//     },
//     lib: {
//       format: 'register',
//       defaultExtension: 'js'
//     }
//   },
//   map: {
//     // inject:dev-map
//     // endinject
//   }
// });

// System.import('js').catch(console.error.bind(console));
// // @endif

// // @if isProd
// System.config({
//   bundles: {
//     'js/app.js': ['app']
//   },
//   map: {
//     // inject:prod-map
//     // endinject
//   }
// });

// System.import('app').catch(console.error.bind(console));
// // @endif

(function (global: any): any {

  // map tells the System loader where to look for things
  var map: Object = {
    'app': 'app', // 'dist',
    'rxjs': 'libs/node_modules/rxjs',
    'angular2-in-memory-web-api': 'libs/node_modules/angular2-in-memory-web-api',
    '@angular': 'libs/node_modules/@angular'
  };

  // packages tells the System loader how to load when no filename and/or no extension
  var packages: Object = {
    'js': { main: 'app.js', defaultExtension: 'js' },
    'rxjs': { defaultExtension: 'js' },
    'angular2-in-memory-web-api': { defaultExtension: 'js' },
  };

  var packageNames: any[] = [
    '@angular/common',
    '@angular/compiler',
    '@angular/core',
    '@angular/http',
    '@angular/platform-browser',
    '@angular/platform-browser-dynamic',
    '@angular/router',
    '@angular/router-deprecated',
    '@angular/testing',
    '@angular/upgrade',
  ];

  // add package entries for angular packages in the form '@angular/common': { main: 'index.js', defaultExtension: 'js' }
  packageNames.forEach(function (pkgName: any): any {
    packages[pkgName] = { main: 'index.js', defaultExtension: 'js' };
  });

  var config: any = {
    map: map,
    packages: packages
  };

  // filterSystemConfig - index.html's chance to modify config before we register it.
  if (global.filterSystemConfig) { global.filterSystemConfig(config); }

  console.log(config);

  System.config(config);

  System.import('js').catch(console.error.bind(console));

})(this);
