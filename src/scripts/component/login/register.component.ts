import {Config} from '../../state/config';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {Dispatcher} from '../../state/dispatcher';
import {Component, View} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {ApplicationState, ApplicationStateObservable} from '../../state/application-state';
import {Control, Validators, FormBuilder, ControlGroup} from 'angular2/common';

interface ValidationResult {
    [key: string]: boolean;
}

@Component({
    selector: 'pw-register'
})
@View({
    directives: [
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
			    <i class="fa fa-user-secret"></i> 
                <input type="text" placeholder="Enter your name" ngControl="name">
                <div class="foot-note error-message dynamic-text" 
                    [class.show]="name.touched && name.errors !== null">Valid full name is required.</div>
            </div>
            <div class="input-container">
			    <i class="fa fa-envelope"></i> 
                <input type="text" placeholder="Enter your email" ngControl="userId">
                <div class="foot-note error-message dynamic-text" 
                    [class.show]="userId.touched && userId.errors !== null && !userId.errors.userIdTaken">Valid email is required.</div>
                <div class="foot-note error-message dynamic-text" 
                    [class.show]="userId.touched && userId.errors !== null && userId.errors.userIdTaken">
                    This id is already registered.</div>
            </div>
            <div class="input-container">
                <i class="fa fa-key"></i> 
                <input type="password" placeholder="Enter your password" ngControl="password">
                <div class="foot-note error-message dynamic-text" 
                    [class.show]="password.touched && password.errors !== null">
                    Password Policy: The password's first character must be a letter, it must contain at least 4 characters and no more 
                    than 15 characters and no characters other than letters, numbers and the underscore may be used
                    </div>
            </div>
            <div class="input-container">
                <i class="fa fa-key"></i> 
                <input type="password" placeholder="Confirm your password" ngControl="confirmation">
                <div class="foot-note error-message dynamic-text" 
                    [class.show]="confirmation.touched && confirmation.errors !== null">
                    Passwords don't match!
                    </div>
            </div>
            <div class="input-container">
                <button type="submit" 
                    class="btn btn-primary submit-btn" 
                    [disabled]="!loginForm.valid">Create User</button>
            </div>
            <div class="signup-btn">
                <a [routerLink]="['Login']">Login</a> | <a>Help</a>
            </div>
            <footer>
			    <span>Pathway™ - Powered by Angular 2.</span> <span>© 2016 Copyright rintoj (Rinto Jose).</span>
		    </footer>
		</form>        
	`
})
export class RegisterComponent {

    private state: ApplicationState;

    title: String = Config.APPLICATION_NAME;
    name: Control;
    userId: Control;
    password: Control;
    confirmation: Control;
    loginForm: ControlGroup;

    constructor(
        private builder: FormBuilder,
        private dispatcher: Dispatcher,
        private stateObservable: ApplicationStateObservable
    ) {
    }

    ngOnInit() {
        this.stateObservable.subscribe((state: ApplicationState) => this.state = state);
        this.name = new Control('', Validators.compose([Validators.required, this.validName]));
        this.userId = new Control('', Validators.compose([Validators.required, this.validEmail]), this.userIdTaken);
        this.password = new Control('', Validators.compose([Validators.required, this.validPassword]));
        this.confirmation = new Control('', Validators.compose([Validators.required, this.validPasswordMatch.bind(this)]));

        this.loginForm = this.builder.group({
            name: this.name,
            userId: this.userId,
            password: this.password,
            confirmation: this.confirmation
        });
    }

    onSubmit() {
        console.log('user:', this.userId, 'password:', this.password);
    }

    private validName(control: Control): any {
        if (!Config.NAME_VALIDATE_REGEXP.test(control.value.trim())) {
            return { validEmail: true };
        }
        return null;
    }

    private userIdTaken(control: Control): Observable<ValidationResult> {
        return Observable.create((observer: Observer<any>) => {
            setTimeout(() => {
                if (control.value === 'rintoj@gmail.com') {
                    observer.next({ userIdTaken: true });
                } else {
                    observer.next(null);
                }
                observer.complete();
            }, 5000);
        });
    }

    private validEmail(control: Control): any {
        if (!Config.EMAIL_VALIDATE_REGEXP.test(control.value)) {
            return { validEmail: true };
        }
        return null;
    }

    private validPassword(control: Control): any {
        if (!Config.PASSWORD_VALIDATE_REGEXP.test(control.value)) {
            return { validPassword: true };
        }
        return null;
    }

    private validPasswordMatch(control: Control): any {
        if (this.password && control.value.trim() !== this.password.value.trim()) {
            return { validPasswordMatch: true };
        }
        return null;
    }

}
