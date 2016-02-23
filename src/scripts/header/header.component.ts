import {Component, View} from 'angular2/core';

@Component({
  selector: 'pw-header'
})
@View({
  template: `
		<div class="nav-wrapper" [class.open]="showMenu">
			<a class="title">
				<img src="images/logo.svg" width="48">
				<span href="#">{{title}}</span>
			</a>

			<span class="right visible-sm">
				<i class="fa fa-bars" (click)="toggleMenu()"></i>
			</span>

			<span class="menu right visible-lg" [class.open]="showMenu">
				<span class="dropdown inline" (click)="toggleDropdown()" [class.open]="showDropdown">
					<button class="dropdown-btn">
						<i class="fa fa-home"></i> {{selectedProject}} <i class="fa fa-chevron-down"></i>
					</button>
					<div class="dropdown-menu">
						<button class="dropdown-item" type="button"  *ngFor="#project of projects"
						 (click)="selectProject($event)"><i class="fa fa-home"></i> {{project}}</button>
					   <div class="dropdown-divider"></div>
						 <button class="dropdown-item" type="button"><i class="fa fa-plus"></i> Create</button>
					</div>
				</span>

				<span class="icons">
					<a class="fa fa-user"></a>
					<a class="fa fa-bell" badge="10"></a>
					<a class="fa fa-cog"></a>
				</span>
			</span>

    </div>
	`
})
export class HeaderComponent {
  public title = 'Pathway';

  private selectedProject: string = '--select project--';
  private showDropdown: boolean = false;
  private showMenu: boolean = false;
  private projects: Array<string>;

  constructor() {
    this.projects = ['Mobile in web', 'Angular 2', 'TCS SwaS', 'dreamUP', 'TCS data Tootle'];
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }

  selectProject(event: any) {
    this.selectedProject = event.target.innerText;
  }
}
