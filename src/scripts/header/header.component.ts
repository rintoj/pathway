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
			<a class="navbar-brand" href="#"><img src="images/logo-512x512.png" width="48"></a>
			<a class="navbar-brand navbar-title" href="#">{{title}}</a>
      <a href="#" data-activates="mobile-demo" class="button-collapse"><i class="fa fa-times">menu</i></a>
      <ul class="right hide-on-med-and-down">
        <li><a href="#">Sass</a></li>
        <li><a href="#">Components</a></li>
        <li><a href="#">Javascript</a></li>
        <li><a href="#">Mobile</a></li>
      </ul>
      <ul class="side-nav" id="mobile-demo">
        <li><a href="#">Sass</a></li>
        <li><a href="#">Components</a></li>
        <li><a href="#">Javascript</a></li>
        <li><a href="#">Mobile</a></li>
      </ul>
    </div>
  </nav>
	`
})
export class HeaderComponent {
  public title = 'Pathway';
}
