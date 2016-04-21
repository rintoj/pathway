import { Directive, ElementRef, Input, Output, EventEmitter } from 'angular2/core';
import { Scroller } from './scroller';

@Directive({
  selector: '[infinite-scroll]'
})
export class InfiniteScroller {

  private scroller: Scroller;
  private _distance: number;

  @Input() set infiniteScrollDistance(distance: number) {
    this._distance = distance;
  }

  @Output() scrolled = new EventEmitter();

  constructor(private element: ElementRef) { }

  ngOnInit(): any {
    this.scroller = new Scroller(window, setInterval, this.element, this.onScroll.bind(this), this._distance, {});
  }

  onScroll(): any {
    this.scrolled.next({});
  }
}
