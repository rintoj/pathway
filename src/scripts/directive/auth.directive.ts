
// import {Observable} from 'rxjs/Observable';
// import {Router, RouterOutlet} from 'angular2/router';
// import {ElementRef, Directive, DynamicComponentLoader} from 'angular2/core';

// // We specify that this outlet will be called when the `loggedin-router-outlet` tag is used.
// @Directive({ selector: 'auth-enabled-router-outlet' })
// // We inherit from the default RouterOutlet
// export class AuthEnabledRouterOutlet extends RouterOutlet {

//   // We call the parent constructor
//   constructor(elementRef: ElementRef, loader: DynamicComponentLoader, private router: Router, nameAttr: string) {
//     super(elementRef, loader, router, nameAttr);
//   }

//   canActivate(instruction: any) {
//     // var url = this.router.lastNavigationAttempt;
//     // // If the user is going to a URL that requires authentication and is not logged in 
//     // // (meaning we don't have the JWT saved in localStorage), we redirect the user to the login page.
//     // if (url !== '/login' && !localStorage.getItem('jwt')) {
//     //   // instruction.component = Login;
//     //   console.error('Login required');
//     // }
//     // return Observable.empty();
//   }
// }