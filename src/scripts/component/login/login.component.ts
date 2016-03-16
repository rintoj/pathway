import {Config} from '../../state/config';
import {Dispatcher} from '../../state/dispatcher';
import {Component, View} from 'angular2/core';
import {LoaderComponent} from '../loader/loader.component';
import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';
import {ApplicationState, ApplicationStateObservable} from '../../state/application-state';
import {Control, Validators, FormBuilder, ControlGroup} from 'angular2/common';

interface ValidationResult {
    [key: string]: boolean;
}

@Component({
    selector: 'pw-login',
    providers: [ROUTER_PROVIDERS]
})
@View({
    directives: [
        LoaderComponent,
        ROUTER_DIRECTIVES
    ],
    template: `
		<form class="login-container" (ngSubmit)="onSubmit()" [ngFormModel]="loginForm">
        	<div class="title">
				<i class="avatar"></i>
			</div>
            <div class="input-container error-message" *ngIf="errorMessage">
                {{errorMessage}}
            </div>
            <div class="input-container">
			    <i class="fa fa-envelope"></i> 
                <input type="text" placeholder="Enter your email" ngControl="userId">
                <div class="foot-note error-message" 
                    [class.show]="userId.touched && userId.errors !== null">Valid email is required.</div>
            </div>
            <div class="input-container">
                <i class="fa fa-key"></i> 
                <input type="password" placeholder="Enter your password" ngControl="password">
                <div class="foot-note error-message" 
                    [class.show]="password.touched && password.errors !== null">Password is required!</div>
            </div>
            <div class="input-container">
                <button type="submit" 
                    class="btn btn-primary submit-btn" 
                    [disabled]="!loginForm.valid">Login</button>
            </div>
            <div class="signup-btn">
                <a>Create account</a> | <a>Help</a>
            </div>
            <footer>
			    <span>Pathway™ - Powered by Angular 2.</span> <span>© 2016 Copyright rintoj (Rinto Jose).</span>
		    </footer>
		</form>        
	`
})
export class LoginComponent {

    private state: ApplicationState;

    title: String = Config.APPLICATION_NAME;
    userId: Control;
    password: Control;
    loginForm: ControlGroup;

    constructor(
        private builder: FormBuilder,
        private dispatcher: Dispatcher,
        private stateObservable: ApplicationStateObservable
    ) {
    }

    ngOnInit() {
        this.stateObservable.subscribe((state: ApplicationState) => this.state = state);
        this.userId = new Control('', Validators.compose([Validators.required, this.validEmail]));
        this.password = new Control('', Validators.required);

        this.loginForm = this.builder.group({
            userId: this.userId,
            password: this.password
        });
    }

    onSubmit() {
        console.log('user:', this.userId, 'password:', this.password);
    }

    private validEmail(control: Control): any {
        if (!Config.EMAIL_VALIDATE_REGEXP.test(control.value)) {
            return { validEmail: true };
        }
        return null;
    }
}
