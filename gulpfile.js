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

// imports
var del = require('del');
var gulp = require('gulp');
var path = require('path');
var exec = require('child_process').exec;
var paths = require('./gulpfile.paths.js');
var gutil = require('gulp-util');
var spawn = require('child_process').spawn;
var merge = require('merge-stream');
var plugins = require('gulp-load-plugins')();
var history = require('connect-history-api-fallback');
var webdriver = require('gulp-protractor').webdriver_update;

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
    return this.isDev ? paths.dev : paths.prod;
  }
};

// typescript project setup
var typescriptProject = plugins.typescript.createProject('tsconfig.json', {
  typescript: require('typescript'),
  outFile: env.isProd ? 'app.js' : undefined
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
    .pipe(plugins.if(env.isProd, plugins.concat('app.css')))
    .pipe(gulp.dest('build/css'))
    .pipe(plugins.connect.reload());
}

function typedoc() {
  return gulp.src(['src/scripts/**/*.ts', ...paths.typings])
    .pipe(plugins.typedoc({
      module: 'commonjs',
      target: 'es5',
      experimentalDecorators: true,
      out: 'docs'
    }));
}

function preprocessGlobalLibs() {
  return plugins.batchReplace(Object.keys(paths.globalLibs).map(function(lib) {
    return [new RegExp('import (.+) from \'(' + lib + ')\'', 'g'), function(match, variableName) {
      return 'declare var ' + variableName;
    }];
  }));
};

function ts(filesRoot, filesGlob, filesDest, project) {
  var title = arguments.callee.caller.name;

  var filesGlobal = gulp.src(filesGlob)
    .pipe(plugins.tslint())
    .pipe(plugins.tslint.report('verbose'))
    .pipe(preprocessGlobalLibs());

  return merge(filesGlobal, gulp.src([...paths.typings]))
    .pipe(plugins.preprocess({
      context: env
    }))
    .pipe(plugins.inlineNg2Template({
      useRelativePaths: true
    }))
    .pipe(plugins.if(env.isDev, plugins.sourcemaps.init()))
    .pipe(plugins.typescript(project)).js
    .pipe(plugins.if(env.isProd, plugins.uglify({
      mangle: false
    })))
    .pipe(plugins.if(env.isDev, plugins.sourcemaps.write({
      sourceRoot: path.join(__dirname, '/', filesRoot)
    })))
    .pipe(plugins.size({
      title
    }))
    .pipe(gulp.dest(filesDest))
    .pipe(plugins.connect.reload());
}

function compile() {
  var filesRoot = 'src/scripts';
  var filesDest = 'build/js';
  var filesGlob = [
    `${filesRoot}/**/*.ts`
  ];

  return ts(filesRoot, filesGlob, filesDest, typescriptProject);
}

function server(cb) {
  execute('npm', ['start'], '/server');
}

function mongoDB(cb) {
  exec('mongod --dbpath ./server/data', function(err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
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
  return env.paths.libs.js.concat(Object.keys(paths.globalLibs).map(function(key) {
    return paths.globalLibs[key];
  }));
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

  var libs = merge(gulp.src([...libraryFiles()], {
      base: '.'
    }))
    .pipe(plugins.if(env.isProd, plugins.concat('libs.js')))
    .pipe(plugins.if(env.isProd, plugins.uglify({
      mangle: false
    })))
    .pipe(plugins.size({
      title: 'libs'
    }))
    .pipe(gulp.dest('build/libs'));

  return merge(images, css, fonts, data, libs);
}

function index() {
  var css = ['./build/css/**/*'];
  var libs = ['./build/libs/**/*'];

  if (env.isDev) {
    libs = libraryFiles().map(lib => path.join('build/libs/', lib));
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
  gulp.watch('src/**/*.{png,jpg,gif,svg,eot,ttf,otf,woff,json,js,css}', gulp.series(assets, index));
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
gulp.task('build', gulp.series(clean, assets, gulp.parallel(scss, compile), index));
gulp.task('serve', gulp.parallel(watch, livereload));
gulp.task("doc", gulp.series(cleandocs, typedoc));
gulp.task(index);
gulp.task(assets);
gulp.task(compile);
gulp.task(server);
gulp.task('default', function() {
    console.log('********* GULP BUILD SYSTEM *********');
    console.log('Usage: ');
    console.log('       gulp build - creates dev/production build');
    console.log('       gulp serve - starts up the server accessible at http://localhost:' + env.PORT);
});