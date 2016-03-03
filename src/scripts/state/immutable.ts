export abstract class ImmutableObject<R> {

  protected data: Immutable.Map<string, any>;

  constructor(properties: R = undefined) {
    this.data = Immutable.Map<string, any>(properties || this.default());
  }

  protected cloneAndSet(name: string, value: any): ImmutableObject<R> {
    return this.create(<R> this.data.set(name, value).toObject());
  }

  abstract create(values: R): ImmutableObject<R>;

  protected abstract default(): R;

}
