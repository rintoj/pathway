import {Component, View} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';

import {HeaderComponent} from './component/header/header.component';
import {ProjectlogComponent} from './component/projectlog/projectlog.component';

@Component({
  selector: 'pw-app',
  providers: [
    ROUTER_PROVIDERS
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
