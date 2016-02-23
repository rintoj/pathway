import {Component, View} from 'angular2/core';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';

import {HeaderComponent} from './header/header.component';
import {ProjectlogComponent} from './projectlog/projectlog.component';
import {AboutComponent} from './about/about.component';

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
  { path: '/log', name: 'Projectlog', component: ProjectlogComponent, useAsDefault: true },
  { path: '/about', name: 'About', component: AboutComponent }
])
export class AppComponent {
	/**
	 * This is a doc comment for `title`.
	 * @example This is a caption.
	 * ```ts
	 * var world: String = 'world';
	 * var hello: String = 'Hello ' + world;
	 * console.log(hello);
	 * ```
	 * @deprecated This is an example of the `deprecated` annotation tag.
	 */
  public title = 'Angular 2 Seed';
}
