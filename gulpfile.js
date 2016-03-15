/**
 * Usage:
 * `$ NODE_ENV=<development/production> PORT=<port> gulp <task>`
 */

var gulp = require('gulp');
var plugins = require('gulp-load-plugins')();

var del = require('del');
var path = require('path');
var exec = require('child_process').exec;
var gutil = require('gulp-util');
var spawn = require('child_process').spawn;
var karma = require('karma');
var merge = require('merge-stream');
var history = require('connect-history-api-fallback');
var webdriver = require('gulp-protractor').webdriver_update;
var remapIstanbul = require('remap-istanbul/lib/gulpRemapIstanbul');

var paths = require('./gulpfile.paths.js');

process.env.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
process.env.PORT = process.env.PORT ? process.env.PORT : '8080';

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

/**
 * Public Tasks
 */

gulp.task(clean);

gulp.task('build', gulp.series(
  clean,
  gulp.parallel(scss, css, tsSrc),
  assets,
  index
));

gulp.task("builddoc", gulp.series(
  cleandocs,
  typedoc
));

gulp.task('serve', gulp.series(
  gulp.parallel(apiServer, watch, livereload)
));

gulp.task('unit', gulp.series(
  karmaClean,
  karmaTsSrc,
  karmaTsSpec,
  karmaRun,
  karmaRemapCoverage,
  karmaClean
));

gulp.task('e2e', gulp.series(
  protractorClean,
  protractorTsSpec,
  protractorUpdate,
  protractorRun,
  protractorClean
));

gulp.task('index', index);
gulp.task('assets', assets);
gulp.task('apiServer', apiServer);

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

function css() {
  return gulp.src('src/**/*.{css,eot,svg,ttf,woff,woff2}', {
      base: 'src/css'
    })
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

function ts(filesRoot, filesGlob, filesDest, project) {
  var title = arguments.callee.caller.name;

  // var result = gulp.src([...filesGlob, ...paths.typings])
  var filesGlobal = gulp.src([...filesGlob])
    .pipe(plugins.tslint())
    .pipe(plugins.tslint.report('verbose'))


  var result = merge(filesGlobal, gulp.src([...paths.typings]))
    .pipe(plugins.preprocess({
      context: env
    }))
    .pipe(plugins.inlineNg2Template({
      useRelativePaths: true
    }))
    .pipe(plugins.if(env.isDev, plugins.sourcemaps.init()))
    .pipe(plugins.typescript(project));

  return result.js
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

var tsProject = plugins.typescript.createProject('tsconfig.json', {
  typescript: require('typescript'),
  outFile: env.isProd ? 'app.js' : undefined
});

function tsSrc() {
  var filesRoot = 'src/scripts';
  var filesDest = 'build/js';
  var filesGlob = [
    `${filesRoot}/**/*.ts`
  ];

  return ts(filesRoot, filesGlob, filesDest, tsProject);
}

function apiServer(cb) {
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

  // Finally execute your script below - here "ls -lA"
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

function assets() {
  var images = gulp.src('src/images/**/*.{png,jpg,gif,svg}')
    .pipe(plugins.size({
      title: 'images'
    }))
    .pipe(gulp.dest('build/images'));

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

  var libs = gulp.src(env.paths.libs.js, {
      base: '.'
    })
    .pipe(plugins.if(env.isProd, plugins.concat('libs.js')))
    .pipe(plugins.if(env.isProd, plugins.uglify({
      mangle: false
    })))
    .pipe(plugins.size({
      title: 'libs'
    }))
    .pipe(gulp.dest('build/libs'));

  return merge(images, fonts, libs, data);
}

function index() {
  var css = ['./build/css/**/*'];
  var libs = ['./build/libs/*'];

  if (env.isDev) {
    libs = env.paths.libs.js.map(lib => path.join('build/libs/', lib))
  }

  var source = gulp.src([...css, ...libs], {
    read: false
  });

  return gulp.src('src/index.html')
    .pipe(plugins.inject(source, {
      ignorePath: 'build',
      addRootSlash: false
    }))
    .pipe(plugins.preprocess({
      context: env
    }))
    .pipe(gulp.dest('build'))
    .pipe(plugins.connect.reload());
}

function karmaClean() {
  return del(['.karma']);
}

function karmaTs(root) {
  var project = plugins.typescript.createProject('tsconfig.json', {
    typescript: require('typescript')
  });

  var filesRoot = root;
  var filesDest = `.karma/${root}`;
  var filesGlob = [
    `${root}/**/*.ts`
  ];

  return ts(filesRoot, filesGlob, filesDest, project);
}

function karmaTsSrc() {
  return karmaTs('src/scripts');
}

function karmaTsSpec() {
  return karmaTs('test/unit');
}

function karmaRun(done) {
  return new karma.Server({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
}

function karmaRemapCoverage() {
  return gulp.src('coverage/json/coverage-js.json')
    .pipe(remapIstanbul({
      reports: {
        json: 'coverage/json/coverage-ts.json',
        html: 'coverage/html-report'
      }
    }));
}

function protractorClean() {
  return del(['.protractor']);
}

var protractorTsProject = plugins.typescript.createProject('tsconfig.json', {
  typescript: require('typescript'),
  module: 'commonjs'
});

function protractorTsSpec() {
  var filesRoot = 'test/e2e';
  var filesDest = `.protractor/${filesRoot}`;
  var filesGlob = [
    `${filesRoot}/**/*.ts`
  ];

  return ts(filesRoot, filesGlob, filesDest, protractorTsProject);
}

function protractorUpdate(done) {
  webdriver({}, done);
}

function protractorRun() {
  return gulp.src('.protractor/test/e2e/**/*.spec.js')
    .pipe(plugins.protractor.protractor({
      configFile: 'protractor.conf.js'
    }))
    .on('error', e => {
      throw e
    })
}

function watch() {
  gulp.watch('src/scripts/**/*.{ts,css,html}', tsSrc); // gulp.series(tsSrc, 'unit'));
  gulp.watch('src/**/*.scss', scss);
  gulp.watch('src/**/*.css', css);
  gulp.watch('src/index.html', index);
  gulp.watch('src/**/*.{png,jpg,gif,svg,eot,ttf,otf,woff,json,js}', gulp.series(assets, index));
  gulp.watch('test/unit/**/*.ts', gulp.series('unit'));
}

function livereload() {
  return plugins.connect.server({
    root: 'build',
    livereload: env.isDev,
    port: env.PORT,
    middleware: (connect, opt) => [history()]
  });
}