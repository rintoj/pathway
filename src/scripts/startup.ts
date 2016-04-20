
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
