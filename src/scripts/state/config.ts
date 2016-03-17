import {Page} from './pagination';
import {Projectlog} from './projectlog';
import {ApplicationStatus} from './ui-state';
import {ApplicationState} from './application-state';
import {DataServiceOptions} from '../service/data.service';

// default configuration
class DefaultConfig {

    /**
     * The initial state of the application
     */
    static get INITIAL_STATE(): ApplicationState {
        return {
            projectlogs: {
                list: [],
                page: new Page<Projectlog>(0, 10)
            },

            ui: {
                syncing: false,
                projectlog: {
                    sortOrderAsc: true,
                    fetching: false
                },
                restorePending: true,
                applicationStatus: ApplicationStatus.STOPPED,
            }
        };
    }

    static get SERVICE_RETRY_COUNT(): number {
        return 3;
    }

    static get SERVICE_RETRY_DELAY(): number {
        return 1 * 1000; // 1 second; 
    }

    static get DATA_PROJECTLOGS_URL(): string {
        return '/data/projectlogs.json';
    }

    static get APPLICATION_NAME(): string {
        return 'Pathway';
    }

    static get EMAIL_VALIDATE_REGEXP(): any {
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,63}$/;
    }

    static get NAME_VALIDATE_REGEXP(): any {
        return /^[A-Za-z][A-Za-z0-9._-]{2,63}( [A-Za-z][A-Za-z0-9._-]{0,63}){1,2}$/;
    }

    static get PASSWORD_VALIDATE_REGEXP(): any {
        return /^[a-zA-Z]\w{3,14}$/;
    }

    static get LOGIN_AUTH_HEADER(): string {
        return 'Basic N2Q2NWQ5YjYtNWNhZS00ZGI3LWIxOWQtNTZjYmRkMjVlYWFiOmEwYzdiNzQxLWIxOGItNDdlYi1iNmRmLTQ4YTBiZDNjZGUyZQ==';
    }

    static get DATA_SERVICE_OPTIONS(): DataServiceOptions {
        return {
            offline: true
        };
    }
}

// override or add configurations for development environment
class DevConfig extends DefaultConfig {

    static get SERVICE_URL(): string {
        return '//localhost:3000/pathway/api';
    }
}

// override or add configurations for production environment
class ProdConfig extends DefaultConfig {

    static get SERVICE_ACCESS_DELAY(): number {
        return 0;
    }

    static get SERVICE_URL(): string {
        return '//rintoj.github.io/pathway/';
    }
}

// Change 'extends' to 'DevConfig/ProdConfig' to switch between dev and prod configs
export class Config extends DevConfig { };
