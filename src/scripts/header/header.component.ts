import {Component, View} from 'angular2/core';

@Component({
  selector: 'pw-header'
  // providers: [
  // 	HTTP_PROVIDERS,
  // 	RestOptions,
  // 	RestService,
  // 	TodoService
  // ]
})
@View({
  template: `
		<nav>
    <div class="nav-wrapper">
			<a class="title">
				<img src="images/logo-512x512.png" width="48">
				<span class="navbar-brand navbar-title" href="#">{{title}}</span>
			</a>
    </div>
  </nav>
	`
})
export class HeaderComponent {
  public title = 'Pathway';
}
