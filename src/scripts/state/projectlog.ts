import {ImmutableObject} from './immutable';

export interface ProjectlogState {
  open: boolean;
  selected: boolean;
}

export interface IProjectlog {
  id: string;
  index: number;
  title: string;
  description?: string;
  status: string;
  uiState?: ProjectlogState;
}

export class Projectlog extends ImmutableObject<IProjectlog> implements IProjectlog {

  constructor(properties: IProjectlog = undefined) {
    if (properties !== undefined && properties.uiState === undefined) {
      properties.uiState = {
        selected: false,
        open: false
      };
    }
    super(properties);
  }

  create(properties: IProjectlog): Projectlog {
    return new Projectlog(properties);
  }

  protected default(): IProjectlog {
    return {
      id: '',
      index: 0,
      title: '',
      description: '',
      status: '',
      uiState: {
        selected: false,
        open: false
      }
    };
  }

  get id(): string {
    return this.data.get('id');
  }

  setId(value: string): Projectlog {
    return <Projectlog> this.cloneAndSet('id', value);
  }

  get index(): number {
    return this.data.get('index');
  }

  setIndex(value: number): Projectlog {
    return <Projectlog> this.cloneAndSet('index', value);
  }

  get title(): string {
    return this.data.get('title');
  }

  setTitle(value: string): Projectlog {
    return <Projectlog> this.cloneAndSet('title', value);
  }

  get description(): string {
    return this.data.get('description');
  }

  setDescription(value: string): Projectlog {
    return <Projectlog> this.cloneAndSet('description', value);
  }

  get status(): string {
    return this.data.get('status');
  }

  setStatus(value: string): Projectlog {
    return <Projectlog> this.cloneAndSet('status', value);
  }

  get uiState(): ProjectlogState {
    return this.data.get('uiState');
  }

  setUiState(value: ProjectlogState): Projectlog {
    return <Projectlog> this.cloneAndSet('uiState', value);
  }

}
