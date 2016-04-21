
// @precompile
import _ from 'lodash';
import Immutable from 'immutable';

if (!_ || !Immutable) {
  throw 'extlibs: Some of the external libraries are not loaded!';
}
// @endprecompile

// @uncomment declare var _: any;
// @uncomment declare var Immutable: any;

export {_};
export {Immutable};