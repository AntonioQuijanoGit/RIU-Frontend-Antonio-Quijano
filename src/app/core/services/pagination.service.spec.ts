import { TestBed } from '@angular/core/testing';
import { PaginationService, PageState, PageEvent } from './pagination.service';

describe('PaginationService', () => {
  let service: PaginationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaginationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getState', () => {
    it('should return initial state', () => {
      service.getState().subscribe((state) => {
        expect(state.pageIndex).toBe(0);
        expect(state.pageSize).toBe(5);
        expect(state.totalItems).toBe(0);
        expect(state.pageSizeOptions).toEqual([5, 10, 25]);
      });
    });
  });

  describe('onPageChange', () => {
    it('should update state when page changes', () => {
      const pageEvent: PageEvent = {
        pageIndex: 2,
        pageSize: 10,
        length: 100,
      };

      service.onPageChange(pageEvent);

      service.getState().subscribe((state) => {
        expect(state.pageIndex).toBe(2);
        expect(state.pageSize).toBe(10);
        expect(state.totalItems).toBe(100);
      });
    });
  });

  describe('updateState', () => {
    it('should update partial state', () => {
      const partialState: Partial<PageState> = {
        pageSize: 25,
        totalItems: 200,
      };

      service.updateState(partialState);

      service.getState().subscribe((state) => {
        expect(state.pageIndex).toBe(0);
        expect(state.pageSize).toBe(25);
        expect(state.totalItems).toBe(200);
        expect(state.pageSizeOptions).toEqual([5, 10, 25]);
      });
    });
  });

  describe('resetToFirstPage', () => {
    it('should reset pageIndex to 0', () => {
      service.onPageChange({ pageIndex: 3, pageSize: 10, length: 100 });

      service.resetToFirstPage();

      service.getState().subscribe((state) => {
        expect(state.pageIndex).toBe(0);
        expect(state.pageSize).toBe(10);
        expect(state.totalItems).toBe(100);
      });
    });
  });

  describe('getPagedItems', () => {
    it('should return correct page items', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

      let pagedItems = service.getPagedItems(items);
      expect(pagedItems).toEqual([1, 2, 3, 4, 5]);

      service.onPageChange({ pageIndex: 1, pageSize: 5, length: 12 });
      pagedItems = service.getPagedItems(items);
      expect(pagedItems).toEqual([6, 7, 8, 9, 10]);

      service.onPageChange({ pageIndex: 0, pageSize: 3, length: 12 });
      pagedItems = service.getPagedItems(items);
      expect(pagedItems).toEqual([1, 2, 3]);
    });

    it('should handle empty array', () => {
      const items: any[] = [];
      const pagedItems = service.getPagedItems(items);
      expect(pagedItems).toEqual([]);
    });

    it('should handle array smaller than page size', () => {
      const items = [1, 2, 3];
      const pagedItems = service.getPagedItems(items);
      expect(pagedItems).toEqual([1, 2, 3]);
    });
  });

  describe('setTotalItems', () => {
    it('should update total items count', () => {
      service.setTotalItems(150);

      service.getState().subscribe((state) => {
        expect(state.totalItems).toBe(150);
      });
    });
  });

  describe('initialize', () => {
    it('should initialize with custom config', () => {
      const customConfig: Partial<PageState> = {
        pageSize: 20,
        totalItems: 500,
        pageSizeOptions: [10, 20, 50],
      };

      service.initialize(customConfig);

      service.getState().subscribe((state) => {
        expect(state.pageIndex).toBe(0);
        expect(state.pageSize).toBe(20);
        expect(state.totalItems).toBe(500);
        expect(state.pageSizeOptions).toEqual([10, 20, 50]);
      });
    });

    it('should initialize with default config when no config provided', () => {
      service.updateState({ pageIndex: 5, pageSize: 25, totalItems: 100 });

      service.initialize();

      service.getState().subscribe((state) => {
        expect(state.pageIndex).toBe(0);
        expect(state.pageSize).toBe(5);
        expect(state.totalItems).toBe(0);
        expect(state.pageSizeOptions).toEqual([5, 10, 25]);
      });
    });
  });
});
