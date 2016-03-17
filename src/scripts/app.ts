import {Component, View} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';
import {LoginComponent} from './component/login/login.component';
import {MainComponent} from './component/main/main.component';
import {RegisterComponent} from './component/login/register.component';
import {ProjectlogService} from './service/projectlog.service';
import {OAuth2Service} from './service/oauth2.service';
import {UIStateService} from './service/ui-state.service';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';

@Component({
    selector: 'pw-app',
    providers: [
        OAuth2Service,
        UIStateService,
        ROUTER_PROVIDERS,
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
        private projectlogService: ProjectlogService,
        private oAuth2Service: OAuth2Service,
        private uiStateService: UIStateService
    ) {
        console.log('Application created!');
    }
}