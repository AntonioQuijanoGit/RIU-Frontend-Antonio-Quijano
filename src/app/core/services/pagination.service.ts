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
  // Estado inicial de paginación
  private defaultState: PageState = {
    pageIndex: 0,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25],
    totalItems: 0,
  };

  // BehaviorSubject para controlar el estado
  private stateSubject = new BehaviorSubject<PageState>(this.defaultState);

  constructor() {}

  // Obtener el estado como Observable
  getState(): Observable<PageState> {
    return this.stateSubject.asObservable();
  }

  // Actualizar el estado (al cambiar de página)
  onPageChange(event: PageEvent): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      pageIndex: event.pageIndex,
      pageSize: event.pageSize,
      totalItems: event.length,
    });
  }

  // Actualizar el estado (manualmente)
  updateState(newState: Partial<PageState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      ...newState,
    });
  }

  // Resetear a la primera página
  resetToFirstPage(): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      pageIndex: 0,
    });
  }

  // Paginar un array de elementos
  getPagedItems<T>(items: T[]): T[] {
    const { pageIndex, pageSize } = this.stateSubject.value;
    const startIndex = pageIndex * pageSize;
    return items.slice(startIndex, startIndex + pageSize);
  }

  // Establecer el número total de elementos
  setTotalItems(count: number): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({
      ...currentState,
      totalItems: count,
    });
  }

  // Inicializar con una configuración personalizada
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
