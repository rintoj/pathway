import {Dispatcher} from './state/dispatcher';
import {UserStore} from './store/user.store';
import {AppStateStore} from './store/app-state.store';
import {MainComponent} from './component/main/main.component';
import {LoginComponent} from './component/login/login.component';
import {Component, View} from 'angular2/core';
import {ProjectlogStore} from './store/projectlog.store';
import {RegisterComponent} from './component/login/register.component';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {RestoreAppStateAction} from './state/action';

import {Config} from './state/config';
import {bootstrap} from 'angular2/platform/browser';
// import {DataService} from './service/data.service';
import {HTTP_PROVIDERS} from 'angular2/http';
import {applicationRef} from './util/application-ref';
import {ROUTER_PROVIDERS} from 'angular2/router';
import {RestServiceWithOAuth2} from './service/oauth2-rest.service';
import {ApplicationStateObservable} from './state/application-state';
import {LocationStrategy, HashLocationStrategy} from 'angular2/router';
import {enableProdMode, provide, Inject, ComponentRef} from 'angular2/core';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';

// @if isProd
enableProdMode();
// @endif


@Component({
  selector: 'pw-app',
  providers: [
    AppStateStore,
    UserStore,
    ProjectlogStore
  ]
})
@View({
  directives: [ROUTER_DIRECTIVES],
  template: `<router-outlet></router-outlet>`
})
@RouteConfig([
  { path: '/home', name: 'Home', component: MainComponent, useAsDefault: true },
  { path: '/login', name: 'Login', component: LoginComponent },
  { path: '/register', name: 'Register', component: RegisterComponent },
  { path: '/**', redirectTo: ['Home'] }
])
export class AppComponent {

  constructor(
    // instantiate dispatcher
    private dispatcher: Dispatcher,

    // instantiate all stores
    private appStateStore: AppStateStore,
    private userStore: UserStore,
    private projectlogStore: ProjectlogStore
  ) {
    console.log('Application created!');
    this.dispatcher.next(new RestoreAppStateAction()).subscribe();
  }
}

bootstrap(AppComponent, [
  HTTP_PROVIDERS,
  ROUTER_PROVIDERS,
  provide('RestServiceOptions', { useValue: Config.REST_SERVICE_OPTIONS }),
  provide('DataServiceOptions', { useValue: Config.DATA_SERVICE_OPTIONS }),
  provide('DataService', { useClass: RestServiceWithOAuth2 }),
  // provide('OfflineDataService', { useClass: DataService }),
  provide(LocationStrategy, { useClass: HashLocationStrategy }),
  provide(Dispatcher, { useValue: new Dispatcher(Config.INITIAL_STATE) }),
  provide(ApplicationStateObservable, { useFactory: Dispatcher.stateFactory, deps: [new Inject(Dispatcher)] })
]).then((appRef: ComponentRef): void => { applicationRef(appRef); });

