import {Action} from './dispatcher';

export interface Auth {
    token_type: String;
    access_token: String;
    expires_in: String;
    refresh_token: String;
}

export interface User {
    id: String;
    name: String;
    userId: String;
    profilePic?: String;
    auth: Auth;
}

export interface LoginPayload {
    userId: String;
    password: String;
}

export class LoginAction extends Action {
    constructor(public user: LoginPayload) {
        super();
    }
}

export class LogoutAction extends Action { }