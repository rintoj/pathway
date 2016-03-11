import {Component, View} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';
import {HeaderComponent} from './component/header/header.component';
import {ProjectlogComponent} from './component/projectlog/projectlog.component';

import {ProjectlogService} from './service/projectlog.service';
import {UIStateService} from './service/ui-state.service';

import 'rxjs/add/operator/share';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';

@Component({
    selector: 'pw-app',
    providers: [
        ROUTER_PROVIDERS,
        ProjectlogService,
        UIStateService
    ]
})
@View({
    directives: [HeaderComponent, ROUTER_DIRECTIVES],
    template: `
		<pw-header></pw-header>
		<main>
			<router-outlet></router-outlet>
		</main>
		<footer>
			Pathway™ - Powered by Angular 2. © 2016 Copyright rintoj (Rinto Jose).
		</footer>
	`
})
@RouteConfig([{
    path: '/',
    name: 'Projectlog',
    component: ProjectlogComponent,
    useAsDefault: true
}])
export class AppComponent {

    constructor(
        private projectlogService: ProjectlogService,
        private uiStateService: UIStateService
    ) {
        console.log('Application created!');
    }
}