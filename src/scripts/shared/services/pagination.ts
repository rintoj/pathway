
export class Page<R> {

  data: R;

  constructor(private totalItems: number, private pageSize: number = 10, private currentPage: number = 0) {

  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  currentIndex(): Object {
    return {
      from: this.currentPage * this.pageSize,
      size: this.pageSize
    };
  }

  next(): Page<R> {
    if (this.currentPage < this.totalPages) {
      return new Page<R>(this.totalItems, this.pageSize, this.currentPage + 1);
    }
    return undefined;
  }

  previous(): Page<R> {
    if (this.currentPage > 0) {
      return new Page<R>(this.totalItems, this.pageSize, this.currentPage - 1);
    }
    return undefined;
  }
}
