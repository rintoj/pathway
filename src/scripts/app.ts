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
 */

// import all required libraries
import {Config} from './state/config';
import {bootstrap} from '@angular/platform-browser-dynamic';
import {Dispatcher} from './state/dispatcher';
import {MainComponent} from './component/main/main.component';
import {HTTP_PROVIDERS} from '@angular/http';
import {applicationRef} from './util/application-ref';
import {LoginComponent} from './component/login/login.component';
import {Component} from '@angular/core';
import {RegisterComponent} from './component/login/register.component';
import {RestoreAppStateAction} from './state/action';
import {RestServiceWithOAuth2} from './service/oauth2-rest.service';
import {ApplicationStateObservable} from './state/application-state';
import {Router, Routes, ROUTER_PROVIDERS, ROUTER_DIRECTIVES} from '@angular/router';
// import {LocationStrategy, HashLocationStrategy} from '@angular/router';
import {enableProdMode, provide, Inject, ComponentRef} from '@angular/core';

// import stores
import {AppStateStore} from './store/app-state.store';
import {ProjectlogStore} from './store/projectlog.store';
import {UserStore} from './store/user.store';

import {DataService} from './service/data.service';

// import 'rxjs/add/operator/share';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/merge';

// @if isProd
enableProdMode();
// @endif

// setup router configuration
@Routes([
  { path: '/home', component: MainComponent },
  { path: '/login', component: LoginComponent },
  { path: '/register', component: RegisterComponent },
  { path: '*', component: MainComponent }
])

// setup root level component
@Component({
  directives: [ROUTER_DIRECTIVES],
  selector: 'pw-app',
  template: `<router-outlet></router-outlet>`,
  providers: [
    AppStateStore,
    ProjectlogStore,
    UserStore
  ]
})

// top-level component
export class AppComponent {
  constructor(
    // instantiate dispatcher
    private dispatcher: Dispatcher,

    // router
    private router: Router,

    // instantiate all stores
    private userStore: UserStore,
    private appStateStore: AppStateStore,
    private projectlogStore: ProjectlogStore
  ) {
    console.log('Application created!');
    this.dispatcher.next(new RestoreAppStateAction()).subscribe();
  }

  ngOnInit(): any {
    this.router.navigate(['/login']);
  }
}

// bootstrap angular 2 application with AppComponent as the base component
bootstrap(AppComponent, [
  HTTP_PROVIDERS,
  ROUTER_PROVIDERS,
  provide('RestServiceOptions', { useValue: Config.REST_SERVICE_OPTIONS }),
  provide('DataServiceOptions', { useValue: Config.DATA_SERVICE_OPTIONS }),
  provide('DataService', { useClass: RestServiceWithOAuth2 }),
  provide('OfflineDataService', { useClass: DataService }),
  // provide(LocationStrategy, { useClass: HashLocationStrategy }),
  provide(Dispatcher, { useValue: new Dispatcher(Config.INITIAL_STATE) }),
  provide(ApplicationStateObservable, { useFactory: Dispatcher.stateFactory, deps: [new Inject(Dispatcher)] })
]).then((appRef: ComponentRef<any>): void => { applicationRef(appRef); });

