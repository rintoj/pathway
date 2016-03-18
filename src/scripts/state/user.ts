import {Action} from './action';

export interface Auth {
    token_type: string;
    access_token: string;
    expires_in: string;
    refresh_token: string;
}

export interface User {
    id: string;
    name: string;
    userId: string;
    profilePic?: string;
    auth: Auth;
}

export interface LoginPayload {
    userId: string;
    password: string;
}

export class LoginAction extends Action {
    constructor(public user: LoginPayload) {
        super();
    }
}

export class ValidateAuthAction extends Action { }

export class LogoutAction extends Action { }