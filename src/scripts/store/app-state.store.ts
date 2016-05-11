/**
 * @author rintoj (Rinto Jose)
 * @license The MIT License (MIT)
 *
 * Copyright (c) 2016 rintoj
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the " Software "), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED " AS IS ", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {Config} from '../state/config';
import {Observer} from 'rxjs/Rx';
import {Dispatcher} from '../state/dispatcher';
import {Observable} from 'rxjs/Rx';
import {Injectable} from '@angular/core';
import {RestoreAppStateAction} from '../state/action';
import {ApplicationState, ApplicationStateObservable} from '../state/application-state';

/**
 * Manages application state
 * 
 * @export
 * @class AppStateStore
 */
@Injectable()
export class AppStateStore {

  /**
   * Creates an instance of AppStateStore.
   * 
   * @param {Dispatcher} dispatcher Action dispatcher as singleton object
   * @param {ApplicationStateObservable} stateObservable The state observable that emits events as application state changes.
   */
  constructor(dispatcher: Dispatcher, private stateObservable: ApplicationStateObservable) {
    this.subscribeToDispatcher(dispatcher);
    this.stateObservable.subscribe(this.saveApplicationState.bind(this));
  }

  /**
   * Subscribes to dispatcher events
   * 
   * @private
   * @param {Dispatcher} dispatcher The dispatcher
   */
  private subscribeToDispatcher(dispatcher: Dispatcher): void {
    dispatcher.subscribe([new RestoreAppStateAction()], this.restoreAppState.bind(this));
  }

  /**
   * Saves application state into localStorage whenever the state changes 
   * 
   * @protected
   * @param {*} immutableState The state
   */
  protected saveApplicationState(immutableState: any): void {
    let state: ApplicationState = immutableState.toJS ? immutableState.toJS() : immutableState;
    console.log(state);
    if (state.ui.restorePending === false) {
      console.log('Saving application state', state);
      let applicationId: string = btoa(Config.APPLICATION_NAME);
      localStorage.setItem(applicationId, btoa(JSON.stringify(state)));
    }
  }

  /**
   * Restores application state from localStorage
   * 
   * @protected
   * @param {ApplicationState} currentState Current state of the application
   * @param {RestoreAppStateAction} action Restore action emitted by the application
   * @returns {Observable<ApplicationState>} Observable
   */
  protected restoreAppState(currentState: ApplicationState, action: RestoreAppStateAction): Observable<ApplicationState> {
    return Observable.create((observer: Observer<ApplicationState>) => {
      let applicationId: string = btoa(Config.APPLICATION_NAME);
      let applicationState: string = localStorage.getItem(applicationId);

      if (applicationState) {
        let state: ApplicationState = JSON.parse(atob(applicationState));
        state.ui.restorePending = false;
        console.log('Application State restored', state);
        observer.next(state);
      } else {
        currentState.ui.restorePending = false;
        observer.next(currentState);
      }
      observer.complete();
    });
  }
}
