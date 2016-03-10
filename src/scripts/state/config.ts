import {ApplicationState} from './application-state';

export const INITIAL_STATE: ApplicationState = {
	projectlogs: [],

	uiState: {
		projectlogSortOrderAsc: true,
		syncing: false
	}
};