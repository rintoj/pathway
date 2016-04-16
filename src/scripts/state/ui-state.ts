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
