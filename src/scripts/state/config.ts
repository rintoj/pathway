import {ApplicationState} from './application-state';

export const INITIAL_STATE: ApplicationState = {
	projectlogs: [],

	ui: {
		projectlog: {
			sortOrderAsc: true,
			fetching: false
		},
		syncing: false
	}
};