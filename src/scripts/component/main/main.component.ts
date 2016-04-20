import {Role} from '../../state/user';
import {authorize} from '../../service/authorization.service';
import {HeaderComponent} from '../header/header.component';
import {Component, View} from 'angular2/core';
import {ProjectlogComponent} from '../projectlog/projectlog.component';
import {ROUTER_DIRECTIVES, CanActivate, ComponentInstruction} from 'angular2/router';

@Component({
  selector: 'pw-main'
})
@CanActivate((next: ComponentInstruction, prev: ComponentInstruction) => authorize(next, prev, [Role.USER]))
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