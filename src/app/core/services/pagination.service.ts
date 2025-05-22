import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface PageState {
  pageIndex: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalItems: number;
}

export interface PageEvent {
  pageIndex: number;
  pageSize: number;
  length: number;
}

@Injectable({
  providedIn: 'root',
})
export class PaginationService {
  // default pagination settings
  private defaultState: PageState = {
    pageIndex: 0,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25],
    totalItems: 0,
  };

  private stateSubject = new BehaviorSubject<PageState>(this.defaultState);

  constructor() {}

  // get current pagination state
  getState(): Observable<PageState> {
    return this.stateSubject.asObservable();
  }

  // handle page change event
  onPageChange(event: PageEvent): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      totalItems: event.length,
    });
  }

  updateState(newState: Partial<PageState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      ...newState,
    });
  }

  resetToFirstPage(): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      pageIndex: 0,
    });
  }

  // get items for current page
  getPagedItems<T>(items: T[]): T[] {
    const { pageIndex, pageSize } = this.stateSubject.value;
    const startIndex = pageIndex * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }

  setTotalItems(count: number): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      totalItems: count,
    });
  }

  initialize(config?: Partial<PageState>): void {
    if (config) {
      this.stateSubject.next({
        ...this.defaultState,
        ...config,
      });
    } else {
      this.stateSubject.next(this.defaultState);
    }
  }
}
