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

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';

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
    private dispatcher: Dispatcher,
    private appStateStore: AppStateStore,
    private userStore: UserStore,
    private projectlogStore: ProjectlogStore
  ) {
    console.log('Application created!');
    this.dispatcher.next(new RestoreAppStateAction()).subscribe();
  }
}