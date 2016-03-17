import {Action} from './action';

export interface ProjectlogUIState {
    sortOrderAsc: boolean;
    fetching: boolean;
}

export enum ApplicationStatus {
    STARTING, STARTED, STOPPED, TERMINATED
}

export interface UIState {
    syncing: boolean;
    projectlog: ProjectlogUIState;
    restorePending: boolean;
    applicationStatus: ApplicationStatus;
}

export class SetApplicationStatusAction extends Action {
    constructor(public applicationStatus: ApplicationStatus) {
        super();
    }
}


