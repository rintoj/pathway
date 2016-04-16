import {Config} from './state/config';
import {bootstrap} from 'angular2/platform/browser';
import {Dispatcher} from './state/dispatcher';
import {AppComponent} from './app';
import {HTTP_PROVIDERS} from 'angular2/http';
import {ApplicationStateObservable} from './state/application-state';
import {enableProdMode, provide, Inject} from 'angular2/core';
import {LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {RestServiceWithOAuth2} from './util/oauth2-rest.service';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/last';

// @if isProd
enableProdMode();
// @endif

bootstrap(AppComponent, [
  HTTP_PROVIDERS,
  provide('DataServiceOptions', { useValue: Config.DATA_SERVICE_OPTIONS }),
  provide('DataService', { useClass: RestServiceWithOAuth2 }),
  provide(LocationStrategy, { useClass: HashLocationStrategy }),
  provide(Dispatcher, { useValue: new Dispatcher(Config.INITIAL_STATE) }),
  provide(ApplicationStateObservable, { useFactory: Dispatcher.stateFactory, deps: [new Inject(Dispatcher)] })
]);
