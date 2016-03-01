import {Action} from './state/actions';
import {Subject} from 'rxjs/Subject';
import {bootstrap} from 'angular2/platform/browser';
import {AppComponent} from './app';
import {HTTP_PROVIDERS} from 'angular2/http';
import {enableProdMode, provide} from 'angular2/core';
import {RestOptions, RestService} from './service/rest.service';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';

// @if isProd
enableProdMode();
// @endif

bootstrap(AppComponent, [
  HTTP_PROVIDERS,
  RestOptions,
  RestService,
  provide('dispatcher', { useValue: new Subject<Action>() })
]);
