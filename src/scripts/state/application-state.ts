import {UIState} from './ui-state';
import {Projectlog} from './projectlog';

export interface ApplicationState {
  projectlogs: Projectlog[];
  uiState: UIState;
}

export const initialState = {
  projectlogs: [],
  uiState: {
    projectlogSortOrderAsc: true,
    sycing: true
  }
};
