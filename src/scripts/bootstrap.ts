import {Dispatcher} from './state/dispatcher';
import {bootstrap} from 'angular2/platform/browser';
import {AppComponent} from './app';
import {Config} from './state/config';
import {HTTP_PROVIDERS} from 'angular2/http';
import {enableProdMode, provide, Inject} from 'angular2/core';
import {RestOptions, RestService} from './service/rest.service';
import {ApplicationStateObservable} from './state/application-state';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/last';

// @if isProd
enableProdMode();
// @endif

bootstrap(AppComponent, [
    HTTP_PROVIDERS,
    RestOptions,
    RestService,
    provide(Dispatcher, { useValue: new Dispatcher(Config.INITIAL_STATE) }),
    provide(ApplicationStateObservable, { useFactory: Dispatcher.stateFactory, deps: [new Inject(Dispatcher)] })
]);
