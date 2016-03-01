import {bootstrap} from 'angular2/platform/browser';
import {enableProdMode} from 'angular2/core';

import {RestOptions, RestService} from './service/rest.service';
import {HTTP_PROVIDERS} from 'angular2/http';

import {AppComponent} from './app';

// @if isProd
enableProdMode();
// @endif

bootstrap(AppComponent, [
  HTTP_PROVIDERS,
  RestOptions,
  RestService
]);
