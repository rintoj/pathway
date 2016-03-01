import {Component, View} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';

import {HeaderComponent} from './component/header/header.component';
import {ProjectlogComponent} from './component/projectlog/projectlog.component';

import {RestOptions, RestService} from './service/rest.service';

@Component({
  selector: 'pw-app',
  providers: [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    RestOptions,
    RestService
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
@RouteConfig([
  { path: '/', name: 'Projectlog', component: ProjectlogComponent, useAsDefault: true }
])
export class AppComponent {

}
