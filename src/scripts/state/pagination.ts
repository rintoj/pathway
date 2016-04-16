export class Page<R> {

  private _totalItems: number = 0;
  private _pageSize: number = 10;
  private _currentPage: number = 0;
  private _filters: Object;

  constructor(totalItems: number, pageSize: number = 10, currentPage: number = 0, filters?: Object) {
    this._totalItems = totalItems;
    this._pageSize = pageSize;
    this._currentPage = currentPage;
    this._filters = filters;
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  get filters(): Object {
    return this._filters;
  }

  setFilters(filters: Object): Page<R> {
    let page: Page<R> = this.clone();
    page._filters = filters;
    return page;
  }

  get totalItems(): number {
    return this._totalItems;
  }

  setTotalItems(totalItems: number): Page<R> {
    let page: Page<R> = this.clone();
    page._totalItems = totalItems;
    return page;
  }

  get currentPage(): number {
    return this._currentPage;
  }

  setCurrentPage(currentPage: number): Page<R> {
    let page: Page<R> = this.clone();
    page._currentPage = currentPage;
    return page;
  }

  get pageSize(): number {
    return this._pageSize;
  }

  setPageSize(pageSize: number): Page<R> {
    let page: Page<R> = this.clone();
    page._pageSize = pageSize;
    return page;
  }

  currentIndex(): Object {
    return {
      from: this.currentPage * this.pageSize,
      size: this.pageSize
    };
  }

  next(): Page<R> {
    if (this.currentPage < this.totalPages) {
      return new Page<R>(this.totalItems, this.pageSize, this.currentPage + 1, this.filters);
    }
    return this;
  }

  previous(): Page<R> {
    if (this.currentPage > 0) {
      return new Page<R>(this.totalItems, this.pageSize, this.currentPage - 1, this.filters);
    }
    return this;
  }

  clone(): Page<R> {
    return new Page<R>(this.totalItems, this.pageSize, this.currentPage, this.filters);
  }

  merge(nextPage: Page<R>) {
    if (nextPage.totalItems !== undefined) {
      this.totalItems = nextPage.totalItems;
    }
    if (nextPage.pageSize !== undefined) {
      this.pageSize = nextPage.pageSize;
    }
    if (nextPage.currentPage !== undefined) {
      this.currentPage = nextPage.currentPage;
    }
    if (nextPage.filters !== undefined) {
      this.filters = nextPage.filters;
    }
  }
}

/**
 * Paginated list can be used to store any data with pagination
 * 
 * @export
 * @interface PagenatedList
 * @template R
 */
export interface PaginatableList<R> {
  page: Page<R>;
  list: R[];
}
