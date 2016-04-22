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
 **/

/**
 * Usage:
 * `$ NODE_ENV=<development/production> PORT=<port> gulp <task>`
 */

function usage() {
  console.log('');
  console.log('QUICK START: (start mongodb and execute the following command*)');
  console.log('   gulp start');
  console.log('');
  console.log('USAGE: ');
  console.log('   gulp start    - start development (combines  "build", "serve" and "server" tasks)');
  console.log('   gulp build    - create dev/production build (combines  "clean", "compile", "assets" and "index" tasks)');
  console.log('   gulp serve    - startup the server accessible at http://localhost:' + env.PORT);
  console.log('   gulp compile  - compile typescript files');
  console.log('   gulp index    - inject library files and css into index.html');
  console.log('   gulp assets   - sync assets such as images, data, css and library files with build directory');
  console.log('   gulp server   - startup the api server (make sure to start "mongodb" before executing this command)');
  console.log('   gulp clean    - clean build directory');
  console.log('   gulp doc      - generate documentation');
  console.log('   gulp [help]   - show this message');
  console.log('');
  console.log('SWITCH ENVIRONMENT AND PORT: (default NODE_ENV is "development" and PORT is "8081")');
  console.log('   NODE_ENV=<development/production> PORT=<port> gulp <task>');
  console.log('');
}

// imports
var del = require('del');
var gulp = require('gulp');
var path = require('path');
var gutil = require('gulp-util');
var spawn = require('child_process').spawn;
var merge = require('merge-stream');
var config = require('./gulpfile.config.js');
var plugins = require('gulp-load-plugins')();
var history = require('connect-history-api-fallback');

// environment setup
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.PORT = process.env.PORT || '8081';

var env = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  get isDev() {
    return this.NODE_ENV === 'development';
  },
  get isProd() {
    return this.NODE_ENV === 'production';
  },
  get paths() {
    return this.isDev ? config.dev : config.prod;
  }
};

// typescript project setup
var typescriptProject = plugins.typescript.createProject('tsconfig.json', {
  typescript: require('typescript'),
  outFile: env.isProd ? `${config.name}-${config.version}.min.js` : undefined
});

/**
 * Definitions
 */
function clean() {
  return del(['docs', 'coverage', 'build', '.karma', '.protractor']);
}

function cleandocs() {
  return del(['docs']);
}

function scss() {
  return gulp.src('src/**/*.{scss,sass}', {
      base: 'src'
    })
    .pipe(plugins.sassLint({
      config: '.sass-lint.yml'
    }))
    .pipe(plugins.sassLint.format())
    .pipe(plugins.sassLint.failOnError())
    .pipe(plugins.rename({
      dirname: ''
    }))
    .pipe(plugins.if(env.isDev, plugins.sourcemaps.init()))
    .pipe(plugins.sass())
    .pipe(plugins.if(env.isDev, plugins.sourcemaps.write()))
    .pipe(plugins.size({
      title: 'sass'
    }))
    .pipe(plugins.if(env.isProd, plugins.cleanCss()))
    .pipe(plugins.if(env.isProd, plugins.concat(`${config.name}-${config.version}.min.css`)))
    .pipe(gulp.dest('build/css'))
    .pipe(plugins.connect.reload());
}

function typedoc() {
  return gulp.src(['src/scripts/**/*.ts', ...config.typings])
    .pipe(plugins.typedoc({
      module: 'commonjs',
      target: 'es5',
      experimentalDecorators: true,
      out: 'docs'
    }));
}

function preprocessGlobalLibs() {
  return plugins.batchReplace(Object.keys(config.globalLibs).map(function(lib) {
    return [new RegExp('import (.+) from \'(' + lib + ')\'', 'g'), function(match, variableName) {
      return 'declare const ' + variableName;
    }];
  }));
};

function compile() {

  var filesGlobal = gulp.src(['src/scripts/**/*.ts'])
    .pipe(plugins.tslint())
    .pipe(plugins.tslint.report('verbose'))
    .pipe(preprocessGlobalLibs());

  return merge(filesGlobal, gulp.src(config.typings))
    .pipe(plugins.preprocess({
      context: env
    }))
    .pipe(plugins.inlineNg2Template({
      useRelativePaths: true
    }))
    .pipe(plugins.if(env.isDev, plugins.sourcemaps.init()))
    .pipe(plugins.typescript(typescriptProject)).js
    .pipe(plugins.if(env.isProd, plugins.uglify({
      mangle: false
    })))
    .pipe(plugins.if(env.isDev, plugins.sourcemaps.write({
      sourceRoot: path.join(__dirname, '/', 'src/scripts')
    })))
    .pipe(plugins.size({
      title: 'typescript'
    }))
    .pipe(gulp.dest('build/js'))
    .pipe(plugins.connect.reload());
}

function server(cb) {
  execute('node', ['app.js'], '/server');
}

function execute(command, arguments, dir) {

  var child = spawn(command, arguments || [], {
    cwd: process.cwd() + dir
  });

  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');

  child.stdout.on('data', function(data) {
    gutil.log(gutil.colors.green(data));
  });

  child.stderr.on('data', function(data) {
    gutil.log(gutil.colors.red(data));
    gutil.beep();
  });

  child.on('close', function(code) {
    gutil.log("Done with exit code", code);
  });
}

function libraryFiles() {
  return env.paths.libs.js.concat(Object.keys(config.globalLibs).map(function(key) {
    return config.globalLibs[key];
  }));
}

function libs() {
  return gulp.src(libraryFiles(), {
      base: '.'
    })
    .pipe(plugins.if(env.isProd, plugins.concat(`${config.name}-lib-${config.version}.min.js`)))
    .pipe(plugins.if(env.isProd, plugins.uglify({
      mangle: false
    })))
    .pipe(plugins.size({
      title: 'libs'
    }))
    .pipe(gulp.dest('build/libs'));
}

function assets() {
  var images = gulp.src('src/images/**/*.{png,jpg,gif,svg}')
    .pipe(plugins.size({
      title: 'images'
    }))
    .pipe(gulp.dest('build/images'));

  var css = gulp.src('src/**/*.{css,eot,svg,ttf,woff,woff2}', {
      base: 'src/css'
    })
    .pipe(gulp.dest('build/css'));

  var fonts = gulp.src('src/fonts/**/*.{eot,ttf,otf,woff}')
    .pipe(plugins.size({
      title: 'fonts'
    }))
    .pipe(gulp.dest('build/fonts'));

  var data = gulp.src('src/data/**/*.json')
    .pipe(plugins.size({
      title: 'data'
    }))
    .pipe(gulp.dest('build/data'));

  return merge(images, css, fonts, data);
}

function index() {
  var css = ['build/css/**/*'];
  var libs = ['build/libs/**/*', 'build/js/**/*'];

  if (env.isDev) {
    libs = libraryFiles().map(lib => path.join('build/libs/', lib)).concat('build/js/startup.js');
  }

  var source = gulp.src([...css, ...libs], {
    read: false
  });

  return gulp.src('src/index.html')
    .pipe(plugins.inject(source, {
      ignorePath: 'build',
      removeTags: true,
      addRootSlash: false
    }))
    .pipe(plugins.inject(gulp.src(['src/app.splash.html']), {
      starttag: '<!-- inject:app-splash:html -->',
      removeTags: true,
      transform: function(filePath, file) {
        return file.contents.toString('utf8')
      }
    }))
    .pipe(plugins.inject(gulp.src(['build/css/splash.css']), {
      starttag: '<!-- inject:app-splash:css -->',
      ignorePath: 'build',
      removeTags: true,
      addRootSlash: false
    }))
    .pipe(plugins.preprocess({
      context: env
    }))
    .pipe(gulp.dest('build'))
    .pipe(plugins.connect.reload());
}

function watch() {
  gulp.watch('src/scripts/**/*.{ts,css,html}', compile);
  gulp.watch('src/**/*.scss', scss);
  gulp.watch('src/index.html', index);
  gulp.watch('src/**/*.{png,jpg,gif,svg,eot,ttf,otf,woff,json,css}', gulp.series(assets, index));
}

function livereload() {
  return plugins.connect.server({
    root: 'build',
    livereload: env.isDev,
    port: env.PORT,
    middleware: (connect, opt) => [history()]
  });
}

// gulp tasks
gulp.task(clean);
gulp.task('build', gulp.series(clean, assets, libs, gulp.parallel(scss, compile), index));
gulp.task('serve', gulp.parallel(watch, livereload));
gulp.task("doc", gulp.series(cleandocs, typedoc));
gulp.task(index);
gulp.task(assets);
gulp.task(compile);
gulp.task(server);
gulp.task('start', gulp.parallel('build', 'serve', 'server'));
gulp.task('help', usage);
gulp.task('default', usage);