import {Page} from './pagination';
import {Action} from './action';

export interface ProjectlogState {
    open: boolean;
    selected: boolean;
    editMode: boolean;
}

export interface Projectlog {
    id: string;
    index: number;
    title: string;
    description?: string;
    status: string;
    createdDate?: Date;
    uiState?: ProjectlogState;
}


export class CreateProjectlogAction extends Action {
    constructor(public projectlog: Projectlog) {
        super();
    }
}

export class FetchProjectlogAction extends Action {
    constructor(public page: Page<Projectlog>) {
        super();
    }
}

export class DeleteProjectlogAction extends Action {
    constructor(public projectlog: Projectlog) {
        super();
    }
}