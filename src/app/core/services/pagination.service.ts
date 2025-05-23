import { Injectable, signal, computed } from '@angular/core';

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
  private defaultState: PageState = {
    pageIndex: 0,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25],
    totalItems: 0,
  };

  private state = signal<PageState>(this.defaultState);

  public readonly pageState = this.state.asReadonly();
  public readonly currentPage = computed(() => this.state().pageIndex);
  public readonly pageSize = computed(() => this.state().pageSize);
  public readonly totalItems = computed(() => this.state().totalItems);
  public readonly totalPages = computed(() =>
    Math.ceil(this.state().totalItems / this.state().pageSize)
  );
  public readonly hasNextPage = computed(
    () => this.state().pageIndex < this.totalPages() - 1
  );
  public readonly hasPreviousPage = computed(() => this.state().pageIndex > 0);

  constructor() {}

  onPageChange(event: PageEvent): void {
    this.state.update((current) => ({
      ...current,
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      totalItems: event.length,
    }));
  }

  updateState(newState: Partial<PageState>): void {
    this.state.update((current) => ({
      ...current,
      ...newState,
    }));
  }

  resetToFirstPage(): void {
    this.state.update((current) => ({
      ...current,
      pageIndex: 0,
    }));
  }

  getPagedItems<T>(items: T[]): T[] {
    const { pageIndex, pageSize } = this.state();
    const startIndex = pageIndex * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }

  setTotalItems(count: number): void {
    this.state.update((current) => ({
      ...current,
      totalItems: count,
    }));
  }

  initialize(config?: Partial<PageState>): void {
    if (config) {
      this.state.set({
        ...this.defaultState,
        ...config,
      });
    } else {
      this.state.set(this.defaultState);
    }
  }

  getCurrentState(): PageState {
    return this.state();
  }
}
