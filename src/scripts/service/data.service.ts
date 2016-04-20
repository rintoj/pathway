
// import Dexie from 'dexie';
import {Inject} from 'angular2/core';
// import {RestService} from './rest.service';

// const Promise = Dexie.Promise; // KEEP! (or loose transaction safety in await calls!)
// const all = Promise.all;

export interface DataServiceOptions {
  database: string;
  stores: {
    [key: string]: string
  };
}

class Dexie { }

export class DataService extends Dexie {

  protected url: string;

  constructor( @Inject('DataServiceOptions') protected options: DataServiceOptions) {

    // Define and open database
    // super(options.database);
    super();

    // Create stores
    // this.version(1).stores(options.stores);

  }


}