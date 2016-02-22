import {Component, View} from 'angular2/core';

@Component({
  selector: 'pw-header'
})
@View({
  template: `
		<nav>
    <div class="nav-wrapper">
			<a class="title">
				<img src="images/logo.svg" width="48">
				<span href="#">{{title}}</span>
			</a>
			<span>
				<div class="dropdown inline" (click)="toggleDropdown()" [class.open]="dropdownOpen">
					<button class="dropdown-btn">
						<i class="fa fa-home"></i> {{selectedProject}} <i class="fa fa-chevron-down"></i>
					</button>
					<div class="dropdown-menu">
						<button class="dropdown-item" type="button"  *ngFor="#project of projects"
						 (click)="selectProject($event)"><i class="fa fa-home"></i> {{project}}</button>
					   <div class="dropdown-divider"></div>
						 <button class="dropdown-item" type="button"><i class="fa fa-plus"></i> Create</button>
					</div>
				</div>
			</span>
			<span class="right">
				<a class="fa fa-user"></a>
				<a class="fa fa-bell" badge="10"></a>
				<a class="fa fa-cog"></a>
			</span>
    </div>
  </nav>
	`
})
export class HeaderComponent {
  public title = 'Pathway';

  private selectedProject: string = '--select project--';
  private dropdownOpen: boolean = false;
  private projects: Array<string>;

  constructor() {
    this.projects = ['Mobile in web', 'Angular 2', 'TCS SwaS', 'dreamUP', 'TCS data Tootle'];
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  selectProject(event: any) {
    this.selectedProject = event.target.innerText;
  }
}
