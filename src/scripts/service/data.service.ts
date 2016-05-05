
import {Inject} from '@angular/core';

// const Promise = Dexie.Promise; // KEEP! (or loose transaction safety in await calls!)
// const all = Promise.all;

import Dexie from 'dexie';

export interface DataServiceOptions {
  database: string;
  stores: {
    [key: string]: string
  };
}

export class DataService extends Dexie {

  protected url: string;

  constructor( @Inject('DataServiceOptions') protected options: DataServiceOptions) {

    // Define and open database
    super(options.database, { autoOpen: true });

    // Create stores
    this.version(1).stores(options.stores);
  }

  version(version: number): any {
    return super.version(version);
  }
}