
import {Projectlog} from './projectlog';
import {List} from 'immutable';
import {UiState} from './ui-state';

export interface ApplicationState {
    todos: List<Projectlog>;
    uiState: UiState;
}
