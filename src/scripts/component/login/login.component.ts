import {Config} from '../../state/config';
import {Dispatcher} from '../../state/dispatcher';
import {LoginAction, ValidateAuthAction} from '../../state/user';
import {Component, View} from 'angular2/core';
import {LoaderComponent} from '../loader/loader.component';
import {ROUTER_DIRECTIVES, Router} from 'angular2/router';
import {Control, Validators, FormBuilder, ControlGroup} from 'angular2/common';

@Component({
    selector: 'pw-login'
})
@View({
    directives: [
        LoaderComponent,
        ROUTER_DIRECTIVES
    ],
    template: `
		<form class="login-container" [class.validating]="validating" (ngSubmit)="onSubmit()" [ngFormModel]="loginForm">
        	<div class="title">
				<i class="avatar"></i>
			</div>
            <div class="message-container">
                <pw-loader [show]="loading || validating"></pw-loader>
                <div class="error-message dynamic-text login-message" [class.show]="errorMessage">
                    {{errorMessage}}
                </div>
            </div>
            <div class="input-container">
			    <i class="fa fa-envelope"></i> 
                <input type="text" placeholder="Enter your email" ngControl="userId" autofocus [disabled]="loading || validating">
                <div class="foot-note error-message dynamic-text" 
                    [class.show]="userId.touched && userId.errors !== null">Valid email is required.</div>
            </div>
            <div class="input-container">
                <i class="fa fa-key"></i> 
                <input type="password" placeholder="Enter your password" ngControl="password" [disabled]="loading || validating">
                <div class="foot-note error-message dynamic-text" 
                    [class.show]="password.touched && password.errors !== null">Password is required!</div>
            </div>
            <div class="input-container">
                <button type="submit" 
                    class="btn submit-btn" 
                    [disabled]="!loginForm.valid || loading || validating">Login</button>
            </div>
            <div class="signup-btn">
                <a [routerLink]="['Register']">Create account</a> | <a>Help</a>
            </div>
            <footer>
			    <span>Pathway™ - Powered by Angular 2.</span> <span>© 2016 Copyright rintoj (Rinto Jose).</span>
		    </footer>
		</form>        
	`
})
export class LoginComponent {

    title: String = Config.APPLICATION_NAME;
    userId: Control;
    password: Control;
    loginForm: ControlGroup;

    loading: boolean = false;
    validating: boolean = true;
    errorMessage: string;

    constructor(
        private router: Router,
        private builder: FormBuilder,
        private dispatcher: Dispatcher
    ) {
    }

    ngOnInit() {
        this.userId = new Control('superuser@pathway.com', Validators.compose([Validators.required, this.validEmail]));
        this.password = new Control('sysadmin@123', Validators.required);

        this.loginForm = this.builder.group({
            userId: this.userId,
            password: this.password
        });
        this.validateAuth();
    }

    validateAuth() {
        this.dispatcher.next(new ValidateAuthAction())
            .finally(() => this.validating = false)
            .subscribe((data: any) => {
                console.log('Valid user', data, 'Navigating to "/Home"');
                this.router.navigate(['/Home']);
            }, () => this.validating = false);
    }

    onSubmit() {
        this.loading = true;
        this.errorMessage = undefined;
        this.dispatcher.next(new LoginAction({
            userId: this.userId.value,
            password: btoa(this.password.value)
        })).subscribe(
            () => {
                this.loading = false;
                this.validateAuth();
            },
            (error: any) => {
                this.loading = false;
                this.errorMessage = 'Sorry, your are not authorized!';
            },
            () => {
                this.loading = false;
            });
        return null;
    }

    private validEmail(control: Control): any {
        if (!Config.EMAIL_VALIDATE_REGEXP.test(control.value)) {
            return { validEmail: true };
        }
        return null;
    }
}
