import {Config} from '../../state/config';
import {Observer} from 'rxjs/Observer';
import {Observable} from 'rxjs/Observable';
import {Dispatcher} from '../../state/dispatcher';
import {LoaderComponent} from '../loader/loader.component';
import {Component, View} from 'angular2/core';
import {CreateUserAction} from '../../state/action';
import {CheckUserAction} from '../../state/action';
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
    ROUTER_DIRECTIVES,
    LoaderComponent
  ],
  template: `
		<form class="login-container" (ngSubmit)="onSubmit()" [ngFormModel]="loginForm">
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
                    [class.show]="userId.errors !== null && userId.errors.userIdTaken">
                    This id is already taken.</div>
            </div>
            <span ngControlGroup="passwordGroup">
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
                      [class.show]="(password.touched || confirmation.touched) && passwordGroup.errors !== null">
                      Passwords don't match!
                      </div>
              </div>
            </span>
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
  passwordGroup: ControlGroup;

  loading: boolean = false;
  errorMessage: string;

  constructor(private builder: FormBuilder, private dispatcher: Dispatcher, private stateObservable: ApplicationStateObservable) { }

  ngOnInit(): void {
    this.stateObservable.subscribe((state: ApplicationState) => this.state = state);
    this.name = new Control('Rinto Jose', Validators.compose([Validators.required, this.isValidName]));
    this.userId = new Control('rintoj@gmail.com', Validators.compose([Validators.required, this.isValidEmail]),
      this.isUserIdTaken.bind(this));

    this.password = new Control('password', Validators.compose([Validators.required, this.isValidPassword.bind(this)]));
    this.confirmation = new Control('password', Validators.compose([Validators.required]));
    this.passwordGroup = this.builder.group({
      password: this.password,
      confirmation: this.confirmation
    }, { validator: this.checkIfEqual.bind(this) });


    this.loginForm = this.builder.group({
      name: this.name,
      userId: this.userId,
      passwordGroup: this.passwordGroup
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.dispatcher.next(new CreateUserAction({
      name: this.name.value,
      userId: this.userId.value,
      password: btoa(this.password.value)
    })).subscribe(
      () => {
        this.loading = false;
        this.errorMessage = 'User created!';
      },
      (error: any) => {
        this.loading = false;
        if (error.status === 409) {
          this.errorMessage = 'User is already registered!';
        } else {
          this.errorMessage = 'Sorry, could not create user!';
        }
      },
      () => {
        this.loading = false;
      }
      );
  }

  private isValidName(control: Control): any {
    if (!Config.NAME_VALIDATE_REGEXP.test(control.value.trim())) {
      return { invalidEmail: true };
    }
    return null;
  }

  private isUserIdTaken(control: Control): Observable<ValidationResult> {
    return Observable.create((observer: Observer<any>) => {
      this.dispatcher.next(new CheckUserAction(control.value)).subscribe(
        (data: any) => {
          observer.next(data.length > 0 ? { userIdTaken: true } : null);
          observer.complete();
        },
        (error: any) => {
          observer.next(null);
          observer.complete();
        },
        () => observer.complete());
    }).share();
  }

  private isValidEmail(control: Control): any {
    if (!Config.EMAIL_VALIDATE_REGEXP.test(control.value)) {
      return { invalidEmail: true };
    }
    return null;
  }

  private isValidPassword(control: Control): any {
    if (!Config.PASSWORD_VALIDATE_REGEXP.test(control.value)) {
      return { invalidPassword: true };
    }
    return null;
  }

  private checkIfEqual(group: ControlGroup): any {
    if (!this.password || !this.confirmation) {
      return null;
    }
    return this.password.value === this.confirmation.value ? null : {
      notEqual: true
    };
  }

}


