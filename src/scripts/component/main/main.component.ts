// import {Role} from '../../state/user';
// import {authorize} from '../../service/authorization.service';
import {HeaderComponent} from '../header/header.component';
import {Component} from '@angular/core';
import {ProjectlogComponent} from '../projectlog/projectlog.component';
// import {ROUTER_DIRECTIVES, CanActivate, ComponentInstruction} from '@angular/router';

// @CanActivate((next: ComponentInstruction, prev: ComponentInstruction) => authorize(next, prev, [Role.USER]))
@Component({
  selector: 'pw-main',
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