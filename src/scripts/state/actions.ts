import {Projectlog} from './projectlog';

export class Action {

}

export class CreateProjectlogAction extends Action {
	constructor(projectlog: Projectlog) {
		super();
	}
}

export class DeleteProjectlogAction extends Action {
	constructor(projectlog: Projectlog) {
		super();
	}
}