import {Dispatcher} from '../../state/dispatcher';
import {applicationRef} from '../../util/application-ref';
import {HeaderComponent} from '../header/header.component';
import {Component, View} from 'angular2/core';
import {AuthorizeAction} from '../../state/action';
import {ProjectlogComponent} from '../projectlog/projectlog.component';
import {ROUTER_DIRECTIVES, CanActivate, ComponentInstruction} from 'angular2/router';

@Component({
  selector: 'pw-main'
})
@CanActivate((next: ComponentInstruction, previous: ComponentInstruction): boolean => {
	let dispatcher: Dispatcher = applicationRef().injector.get(Dispatcher);
	return dispatcher.next(new AuthorizeAction(['Admin'])).toPromise();
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