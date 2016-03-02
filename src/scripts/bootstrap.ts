import {Dispatcher} from './state/dispatcher';
import {bootstrap} from 'angular2/platform/browser';
import {AppComponent} from './app';
import {HTTP_PROVIDERS} from 'angular2/http';
import {enableProdMode, provide, Inject} from 'angular2/core';
import {RestOptions, RestService} from './service/rest.service';
import {initialState} from './state/application-state';

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
  provide(Dispatcher, { useValue: new Dispatcher(initialState) }),
  provide('state', { useFactory: Dispatcher.stateFactory, deps: [new Inject(Dispatcher)] })
]);
