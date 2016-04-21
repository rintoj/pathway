import {Config} from '../../state/config';
import {Dispatcher} from '../../state/dispatcher';
import {LoginAction, ValidateUserAction} from '../../state/action';
import {Component, View} from 'angular2/core';
import {LoaderComponent} from '../loader/loader.component';
import {Control, Validators, FormBuilder, ControlGroup} from 'angular2/common';
import {ROUTER_DIRECTIVES, Router, RouteParams, OnActivate} from 'angular2/router';

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
export class LoginComponent implements OnActivate {

  title: String = Config.APPLICATION_NAME;
  userId: Control;
  password: Control;
  loginForm: ControlGroup;

  loading: boolean = false;
  validating: boolean = true;
  errorMessage: string;

  constructor(
    private router: Router,
    private routeParams: RouteParams,
    private builder: FormBuilder,
    private dispatcher: Dispatcher
  ) { }

  ngOnInit(): void {
    this.userId = new Control('', Validators.compose([Validators.required, this.validEmail]));
    this.password = new Control('', Validators.required);

    this.loginForm = this.builder.group({
      userId: this.userId,
      password: this.password
    });
  }

  routerOnActivate(): void {
    if (this.routeParams.get('authorized') === 'false') {
      this.errorMessage = 'You are not authorized or session expired! Login again.';
    }

    this.validateAuth(true);
  }

  validateAuth(noError: boolean = false): void {
    this.dispatcher.next(new ValidateUserAction())
      .finally(() => this.validating = false)
      .subscribe((data: any) => {
        this.router.navigate([this.routeParams.get('callback') || '/Home']);
      }, (error: any) => {
        this.loading = false;
        if (!noError) {
          this.errorMessage = 'Invalid user or password!';
        }
      });
  }

  onSubmit(): void {
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
        this.errorMessage = 'Invalid user or password!';
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
