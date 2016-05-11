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

import {Role} from '../state/user';
import {Dispatcher} from '../state/dispatcher';
import {Observer} from 'rxjs/Rx';
import {Observable} from 'rxjs/Rx';
import {applicationRef} from '../util/application-ref';
import {AuthorizeAction} from '../state/action';
import {Router, ComponentInstruction} from '@angular/router-deprecated';

export function authorize(next: ComponentInstruction, previous: ComponentInstruction, roles: Role[]): boolean {

  'use strict';

  let dispatcher: Dispatcher = applicationRef().injector.get(Dispatcher);
  let router: Router = applicationRef().injector.get(Router);

  return Observable.create((observer: Observer<boolean>) => {
    dispatcher.next(new AuthorizeAction(roles || [])).subscribe((ok: boolean) => {
      if (!ok) {
        router.navigate(['Login', { authorized: false }]);
      }
      observer.next(ok);
      observer.complete();
    }, (error: Error) => {
      observer.error(error);
      observer.complete();
    }, () => observer.complete());
  }).toPromise();

}
