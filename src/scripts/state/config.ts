import {Page} from './pagination';
import {Projectlog} from './projectlog';
import {ApplicationState} from './application-state';

export const INITIAL_STATE: ApplicationState = {
	projectlogs: {
		list: [],
		page: new Page<Projectlog>(0, 10)
	},

	ui: {
		projectlog: {
			sortOrderAsc: true,
			fetching: false
		},
		syncing: false
	}
};