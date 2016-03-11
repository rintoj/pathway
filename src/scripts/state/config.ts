import {Page} from './pagination';
import {Immutable} from './immutable';
import {Projectlog} from './projectlog';
import {ApplicationState} from './application-state';

export const INITIAL_STATE: ApplicationState = {
	projectlogs: {
		list: Immutable.List([]),
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