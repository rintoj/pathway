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
import {Page} from './pagination';
import {Projectlog} from './projectlog';
import {Role, UserBasicInfo} from './user';

export class Action { }
export class StatelessAction { }

// User Actions
export class LoginAction extends Action { constructor(public user: UserBasicInfo) { super(); } }
export class LogoutAction extends Action { }
export class ValidateUserAction extends Action { }
export class CreateUserAction extends Action { constructor(public user: UserBasicInfo) { super(); } }
export class CheckUserAction extends StatelessAction { constructor(public userId: string) { super(); } }
export class AuthorizeAction extends StatelessAction { constructor(public roles: Role[]) { super(); } }

// Application-State action
export class RestoreAppStateAction extends Action { }

// Projectlog actions
export class CreateProjectlogAction extends Action { constructor(public projectlog: Projectlog) { super(); } }
export class FetchProjectlogAction extends Action { constructor(public page: Page<Projectlog>) { super(); } }
export class DeleteProjectlogAction extends Action { constructor(public projectlog: Projectlog) { super(); } }

