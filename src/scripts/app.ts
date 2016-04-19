import {Dispatcher} from './state/dispatcher';
import {UserStore} from './service/user.store';
import {AppStateStore} from './service/app-state.store';
import {MainComponent} from './component/main/main.component';
import {LoginComponent} from './component/login/login.component';
import {UIStateService} from './service/ui-state.service';
import {Component, View} from 'angular2/core';
import {RegisterComponent} from './component/login/register.component';
import {ProjectlogService} from './service/projectlog.service';
import {ApplicationStatus} from './state/ui-state';
import {RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {SetApplicationStatusAction, RestoreAppStateAction} from './state/action';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';

@Component({
  selector: 'pw-app',
  providers: [
    AppStateStore,
    UserStore,
    UIStateService,
    ProjectlogService
  ]
})
@View({
  directives: [ROUTER_DIRECTIVES],
  template: `<router-outlet></router-outlet>`
})
@RouteConfig([
  { path: '/login', name: 'Login', component: LoginComponent, useAsDefault: true },
  { path: '/register', name: 'Register', component: RegisterComponent },
  { path: '/home', name: 'Home', component: MainComponent },
  { path: '/**', redirectTo: ['Login'] }
])
export class AppComponent {

  constructor(
    private dispatcher: Dispatcher,
    private appStateStore: AppStateStore,
    private userStore: UserStore,
    private uiStateService: UIStateService,
    private projectlogService: ProjectlogService
  ) {
    console.log('Application created!');
    this.dispatcher.next(new SetApplicationStatusAction(ApplicationStatus.STARTED)).subscribe();
    this.dispatcher.next(new RestoreAppStateAction()).subscribe();
  }
}