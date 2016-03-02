import {Projectlog} from './projectlog';

export class AddProjcetlogAction {
  constructor(public projectlog: Projectlog) { }
}

export class FetchProjectlogAction {

}

export class ChangeSycingAction {
  constructor(public sync: boolean) { }
}

export type Action = AddProjcetlogAction | FetchProjectlogAction;
