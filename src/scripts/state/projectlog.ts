
export interface ProjectlogUIState {
  selected: boolean;
  open: boolean;
}

export interface Projectlog {
  id: string;
	index?: number;
  title: string;
  description?: string;
  status: string;
  uiState?: ProjectlogUIState;
}
