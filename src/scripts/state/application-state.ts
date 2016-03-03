import {UIState} from './ui-state';
import {Projectlog} from './projectlog';

export interface IApplicationState {
  projectlogs: Projectlog[];
  uiState: UIState;
}

let RApplicationState = Immutable.Record({
  projectlogs: [],
  uiState: {}
});

export class ApplicationState extends RApplicationState implements IApplicationState {
  projectlogs: Projectlog[];
  uiState: UIState;

  constructor(props: IApplicationState) {
    super(props);
  }
}

export const initialState = {
  projectlogs: [],
  uiState: {
    projectlogSortOrderAsc: true,
    sycing: true
  }
};
//
//
// export interface ISample {
//   name: string;
//   role?: string;
// }
//
// export class Sample implements ISample {
//
//   private data: Immutable.Map<string, any>;
//
//   constructor(properties: ISample = undefined) {
//     let data: ISample = properties || { name: '', role: '' };
// 		this.data = Immutable.Map<string, any>(data);
//   }
//
// 	private set(name: string, value: any) {
// 		return new Sample(<ISample> this.data.set(name, value).toObject());
// 	}
//
// 	get name(): string {
// 		return this.data.get('name');
// 	}
//
// 	setName(value: string): Sample {
// 		return this.set('name', value);
// 	}
//
// 	get role(): string {
// 		return this.data.get('role');
// 	}
// }
//
// const list: Immutable.List<Sample> = Immutable.List<Sample>([]);
//
// const s: Sample = new Sample({name: 'test', role: 'test'});
// const s1: Sample = s.setName('sample');
// console.log(s.name,  s1.name, s1 === s);
//
// const list2 = list.push(s);
// console.log(list, list2, list === list2);
//
// for(let s2 of list2.toArray()) {
// 	console.log(s2);
// }
