
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
  uiState?: ProjectlogState;
}
