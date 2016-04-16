import {Action} from './action';
import {AuthInfo} from '../util/oauth2-rest.service';

export interface UserBasicInfo {
    name?: String;
    userId: string;
    password?: string;
}

export interface User extends UserBasicInfo {
    id: string;
    name: string;
    userId: string;
    profilePic?: string;
    auth?: AuthInfo;
}

export class LoginAction extends Action {
    constructor(public user: UserBasicInfo) {
        super();
    }
}

export class ValidateAuthAction extends Action { }

export class LogoutAction extends Action { }

export class CreateUserAction extends Action {
    constructor(public user: UserBasicInfo) {
        super();
    }
}

export class VerifyUserAction extends Action {
    constructor(public userId: string) {
        super();
    }
}