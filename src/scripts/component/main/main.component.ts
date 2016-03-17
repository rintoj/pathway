import {Component, View} from 'angular2/core';
import {HeaderComponent} from '../header/header.component';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {ProjectlogComponent} from '../projectlog/projectlog.component';

@Component({
    selector: 'pw-main'
})
@View({
    directives: [HeaderComponent, ProjectlogComponent, ROUTER_DIRECTIVES],
    template: `
		<pw-header></pw-header>
		<main>
			<pw-projectlog></pw-projectlog>
		</main>
		<footer>
			Pathway™ - Powered by Angular 2. © 2016 Copyright rintoj (Rinto Jose).
		</footer>
	`
})
export class MainComponent { }