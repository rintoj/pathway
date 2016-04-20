import {AuthInfo} from '../service/oauth2-rest.service';

export interface UserBasicInfo {
  name?: String;
  userId: string;
  password?: string;
}

export enum Role {
  ADMIN, USER
}

export interface User extends UserBasicInfo {
  id: string;
  name: string;
  userId: string;
  roles?: Role[];
  profilePic?: string;
  auth?: AuthInfo;
}