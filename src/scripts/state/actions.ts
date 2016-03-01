import {Projectlog} from './projectlog';

export class AddProjcetlogAction {
  constructor(public projectlog: Projectlog) { }
}

export type Action = AddProjcetlogAction;
