import {Config} from './state/config';
import {bootstrap} from 'angular2/platform/browser';
import {Dispatcher} from './state/dispatcher';
import {AppComponent} from './app';
import {HTTP_PROVIDERS} from 'angular2/http';
import {applicationRef} from './util/application-ref';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {RestServiceWithOAuth2} from './util/oauth2-rest.service';
import {RestService, RestOptions} from './service/rest.service';
import {ApplicationStateObservable} from './state/application-state';
import {LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {enableProdMode, provide, Inject, ComponentRef} from 'angular2/core';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/last';

// @if isProd
enableProdMode();
// @endif

bootstrap(AppComponent, [
  HTTP_PROVIDERS,
  ROUTER_PROVIDERS,
  RestOptions, RestService,
  provide('DataServiceOptions', { useValue: Config.DATA_SERVICE_OPTIONS }),
  provide('DataService', { useClass: RestServiceWithOAuth2 }),
  provide(LocationStrategy, { useClass: HashLocationStrategy }),
  provide(Dispatcher, { useValue: new Dispatcher(Config.INITIAL_STATE) }),
  provide(ApplicationStateObservable, { useFactory: Dispatcher.stateFactory, deps: [new Inject(Dispatcher)] })
]).then((appRef: ComponentRef): void => { applicationRef(appRef); });
