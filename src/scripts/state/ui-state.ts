

export interface ProjectlogUIState {
	sortOrderAsc: boolean;
	fetching: boolean;
}

export interface UIState {
  projectlog: ProjectlogUIState;
  syncing: boolean;
}
