import {Page} from './pagination';
import {Projectlog} from './projectlog';
import {ApplicationState} from './application-state';

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
                projectlog: {
                    sortOrderAsc: true,
                    fetching: false
                },
                syncing: false
            }
        };
    }

    static get SERVICE_ACCESS_DELAY(): number {
        return Math.random() * 10;
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
