/**
 * @author rintoj (Rinto Jose)
 * @license The MIT License (MIT)
 *
 * Copyright (c) 2016 rintoj
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the " Software "), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED " AS IS ", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import {Router} from 'angular2/router';
import {Dispatcher} from '../../state/dispatcher';
import {LogoutAction} from '../../state/action';
import {Component, View} from 'angular2/core';
import {Dropdown, DropdownOption} from '../../directive/dropdown/dropdown';
import {ApplicationState, ApplicationStateObservable} from '../../state/application-state';

@Component({
  selector: 'pw-header'
})
@View({
  directives: [Dropdown],
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
                
        <dropdown class="project-list" [options]="projectList"></dropdown>

				<span class="icons">
					<a class="sync-state fa fa-cloud" [class.syncing]="state.ui.syncing"
					   [attr.tooltip]="state.ui.syncing ? 'Syncing...' : 'Synced'" (click)="state.ui.syncing = !state.ui.syncing"></a>
					<a class="fa fa-cog"></a>
            <span class="user-profile" [class.open]="openUserProfile" (click)="toggleUserProfile()">
                <div class="profile-details">
                    <div class="user-name">
                        <span class="name">{{userName}}</span>
                        <span class="email">{{state.user?.userId}}</span>
                    </div>
                    <button class="btn btn-pill btn-primary" (click)="logout()">Logout</button>
                    <button class="btn btn-pill" disabled>Switch User</button>
                </div>
                <a class="avatar small"></a>
            </span>
				</span>
			</span>
        </div>
	`
})
export class HeaderComponent {
  public title = 'Pathway';

  private state: ApplicationState;
  private selectedProject: string = '--select project--';
  private showDropdown: boolean = false;
  private showMenu: boolean = false;
  private openUserProfile: boolean = false;

  projectList: DropdownOption[] = [
    {
      text: 'Mobile in web',
      icon: 'fa fa-home'
    }, {
      text: 'Angular 2',
      icon: 'fa fa-home'
    }, {
      text: 'TCS SwaS',
      icon: 'fa fa-home'
    }, {
      text: 'dreamUP',
      icon: 'fa fa-home'
    }, {
      text: 'TCS data Tootle',
      icon: 'fa fa-home'
    }
  ];

  /**
   * Creates an instance of HeaderComponent.
   * 
   * @param {Router} router (description)
   * @param {Dispatcher} dispatcher (description)
   * @param {ApplicationStateObservable} stateObservable (description)
   */
  constructor(
    private router: Router,
    private dispatcher: Dispatcher,
    private stateObservable: ApplicationStateObservable
  ) { }

  ngOnInit(): void {
    this.stateObservable.subscribe((state: ApplicationState) => this.state = state);
  }

  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
  }

  toggleMenu(): void {
    this.showMenu = !this.showMenu;
  }

  selectProject(event: any): void {
    this.selectedProject = event.target.innerText;
  }

  logout(): void {
    this.dispatcher.next(new LogoutAction()).subscribe(() => this.router.navigate(['/Login']));
  }

  toggleUserProfile(): void {
    this.openUserProfile = !this.openUserProfile;
  }

  get userName(): string {
    return this.state && this.state.user && this.state.user.name && this.state.user.name.split(' ')[0];
  }

}