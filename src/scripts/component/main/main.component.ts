import {Component, View} from 'angular2/core';
import {HeaderComponent} from '../header/header.component';
import {ProjectlogComponent} from '../projectlog/projectlog.component';

@Component({
    selector: 'pw-main'
})
@View({
    directives: [HeaderComponent, ProjectlogComponent],
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