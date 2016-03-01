
import {List} from 'immutable';
import {Projectlog} from './projectlog';

export class FetchProjectlogsAction {
  constructor(public projectlog: List<Projectlog>) { }
}

export class AddProjectlogAction {
  constructor(public newProjectlog: Projectlog) { }
}

export class ToggleProjectlogAction {
  constructor(public todo: Projectlog) { }
}

export class DeleteProjectlogAction {
  constructor(public todo: Projectlog) { }
}

export type Action = FetchProjectlogsAction | AddProjectlogAction | ToggleProjectlogAction | DeleteProjectlogAction;
