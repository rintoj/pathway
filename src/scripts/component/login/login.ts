import {Dispatcher} from '../../state/dispatcher';
import {Component, View} from 'angular2/core';
import {LoaderComponent} from '../loader/loader.component';
import {ApplicationState, ApplicationStateObservable} from '../../state/application-state';

@Component({
    selector: 'pw-login'
})
@View({
    directives: [
        LoaderComponent
    ],
    template: `
		<!-- action buttons -->
		<div class="login-container">
			
		</div>
	`
})
export class ProjectlogComponent {

    private state: ApplicationState;

    constructor(
        private dispatcher: Dispatcher,
        private stateObservable: ApplicationStateObservable
    ) {
    }

    ngOnInit() {
        this.stateObservable.subscribe((state: ApplicationState) => this.state = state);
    }

}
