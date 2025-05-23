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

  describe('Initial state', () => {
    it('should have correct default state', () => {
      const state = service.getCurrentState();
      expect(state.pageIndex).toBe(0);
      expect(state.pageSize).toBe(5);
      expect(state.pageSizeOptions).toEqual([5, 10, 25]);
      expect(state.totalItems).toBe(0);
    });

    it('should have correct computed properties initially', () => {
      expect(service.currentPage()).toBe(0);
      expect(service.pageSize()).toBe(5);
      expect(service.totalItems()).toBe(0);
      expect(service.totalPages()).toBe(0);
      expect(service.hasNextPage()).toBe(false);
      expect(service.hasPreviousPage()).toBe(false);
    });

    it('should expose readonly page state', () => {
      const pageState = service.pageState();
      expect(pageState.pageIndex).toBe(0);
      expect(pageState.pageSize).toBe(5);
      expect(pageState.totalItems).toBe(0);
    });
  });

  describe('onPageChange()', () => {
    it('should update state with page event data', () => {
      const pageEvent: PageEvent = {
        pageIndex: 2,
        pageSize: 10,
        length: 100,
      };

      service.onPageChange(pageEvent);

      expect(service.currentPage()).toBe(2);
      expect(service.pageSize()).toBe(10);
      expect(service.totalItems()).toBe(100);
    });

    it('should update computed properties correctly', () => {
      const pageEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 5,
        length: 25,
      };

      service.onPageChange(pageEvent);

      expect(service.totalPages()).toBe(5);
      expect(service.hasNextPage()).toBe(true);
      expect(service.hasPreviousPage()).toBe(true);
    });

    it('should preserve pageSizeOptions when updating', () => {
      const pageEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 10,
        length: 50,
      };

      service.onPageChange(pageEvent);

      expect(service.pageState().pageSizeOptions).toEqual([5, 10, 25]);
    });
  });

  describe('updateState()', () => {
    it('should update partial state', () => {
      service.updateState({ pageIndex: 3 });

      expect(service.currentPage()).toBe(3);
      expect(service.pageSize()).toBe(5);
      expect(service.totalItems()).toBe(0);
    });

    it('should update multiple properties', () => {
      service.updateState({
        pageIndex: 2,
        pageSize: 10,
        totalItems: 50,
      });

      expect(service.currentPage()).toBe(2);
      expect(service.pageSize()).toBe(10);
      expect(service.totalItems()).toBe(50);
    });

    it('should update pageSizeOptions', () => {
      service.updateState({ pageSizeOptions: [10, 20, 50] });

      expect(service.pageState().pageSizeOptions).toEqual([10, 20, 50]);
    });
  });

  describe('resetToFirstPage()', () => {
    it('should reset pageIndex to 0', () => {
      service.updateState({ pageIndex: 5 });
      expect(service.currentPage()).toBe(5);

      service.resetToFirstPage();
      expect(service.currentPage()).toBe(0);
    });

    it('should preserve other state properties', () => {
      service.updateState({
        pageIndex: 3,
        pageSize: 10,
        totalItems: 100,
      });

      service.resetToFirstPage();

      expect(service.currentPage()).toBe(0);
      expect(service.pageSize()).toBe(10);
      expect(service.totalItems()).toBe(100);
    });
  });

  describe('getPagedItems()', () => {
    const testItems = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

    it('should return correct items for first page', () => {
      service.updateState({ pageIndex: 0, pageSize: 5 });

      const result = service.getPagedItems(testItems);

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return correct items for middle page', () => {
      service.updateState({ pageIndex: 1, pageSize: 5 });

      const result = service.getPagedItems(testItems);

      expect(result).toEqual([6, 7, 8, 9, 10]);
    });

    it('should return correct items for last page', () => {
      service.updateState({ pageIndex: 2, pageSize: 5 });

      const result = service.getPagedItems(testItems);

      expect(result).toEqual([11, 12, 13, 14, 15]);
    });

    it('should handle partial last page', () => {
      const items = [1, 2, 3, 4, 5, 6, 7];
      service.updateState({ pageIndex: 1, pageSize: 5 });

      const result = service.getPagedItems(items);

      expect(result).toEqual([6, 7]);
    });

    it('should return empty array when page index exceeds items', () => {
      service.updateState({ pageIndex: 10, pageSize: 5 });

      const result = service.getPagedItems(testItems);

      expect(result).toEqual([]);
    });

    it('should work with different page sizes', () => {
      service.updateState({ pageIndex: 0, pageSize: 3 });

      const result = service.getPagedItems(testItems);

      expect(result).toEqual([1, 2, 3]);
    });

    it('should work with objects', () => {
      const objectItems = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
        { id: 4, name: 'Item 4' },
      ];

      service.updateState({ pageIndex: 0, pageSize: 2 });

      const result = service.getPagedItems(objectItems);

      expect(result).toEqual([
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ]);
    });
  });

  describe('setTotalItems()', () => {
    it('should update total items count', () => {
      service.setTotalItems(100);

      expect(service.totalItems()).toBe(100);
    });

    it('should update computed properties', () => {
      service.updateState({ pageSize: 10 });
      service.setTotalItems(25);

      expect(service.totalPages()).toBe(3);
    });

    it('should preserve other state properties', () => {
      service.updateState({ pageIndex: 2, pageSize: 10 });
      service.setTotalItems(50);

      expect(service.currentPage()).toBe(2);
      expect(service.pageSize()).toBe(10);
      expect(service.totalItems()).toBe(50);
    });
  });

  describe('initialize()', () => {
    it('should reset to default state without config', () => {
      service.updateState({ pageIndex: 5, pageSize: 25, totalItems: 100 });

      service.initialize();

      expect(service.currentPage()).toBe(0);
      expect(service.pageSize()).toBe(5);
      expect(service.totalItems()).toBe(0);
      expect(service.pageState().pageSizeOptions).toEqual([5, 10, 25]);
    });

    it('should initialize with custom config', () => {
      const config: Partial<PageState> = {
        pageIndex: 2,
        pageSize: 10,
        totalItems: 100,
      };

      service.initialize(config);

      expect(service.currentPage()).toBe(2);
      expect(service.pageSize()).toBe(10);
      expect(service.totalItems()).toBe(100);
      expect(service.pageState().pageSizeOptions).toEqual([5, 10, 25]);
    });

    it('should merge config with defaults', () => {
      const config: Partial<PageState> = {
        pageSize: 20,
        pageSizeOptions: [20, 50, 100],
      };

      service.initialize(config);

      expect(service.currentPage()).toBe(0);
      expect(service.pageSize()).toBe(20);
      expect(service.totalItems()).toBe(0);
      expect(service.pageState().pageSizeOptions).toEqual([20, 50, 100]);
    });
  });

  describe('Computed properties', () => {
    describe('totalPages', () => {
      it('should calculate correct total pages', () => {
        service.updateState({ pageSize: 5, totalItems: 23 });
        expect(service.totalPages()).toBe(5);

        service.updateState({ pageSize: 10, totalItems: 23 });
        expect(service.totalPages()).toBe(3);

        service.updateState({ pageSize: 5, totalItems: 25 });
        expect(service.totalPages()).toBe(5);
      });

      it('should return 0 when totalItems is 0', () => {
        service.updateState({ totalItems: 0 });
        expect(service.totalPages()).toBe(0);
      });
    });

    describe('hasNextPage', () => {
      it('should return true when there are more pages', () => {
        service.updateState({ pageIndex: 0, pageSize: 5, totalItems: 20 });
        expect(service.hasNextPage()).toBe(true);

        service.updateState({ pageIndex: 2, pageSize: 5, totalItems: 20 });
        expect(service.hasNextPage()).toBe(true);
      });

      it('should return false when on last page', () => {
        service.updateState({ pageIndex: 3, pageSize: 5, totalItems: 20 });
        expect(service.hasNextPage()).toBe(false);
      });

      it('should return false when no items', () => {
        service.updateState({ pageIndex: 0, totalItems: 0 });
        expect(service.hasNextPage()).toBe(false);
      });
    });

    describe('hasPreviousPage', () => {
      it('should return true when not on first page', () => {
        service.updateState({ pageIndex: 1 });
        expect(service.hasPreviousPage()).toBe(true);

        service.updateState({ pageIndex: 5 });
        expect(service.hasPreviousPage()).toBe(true);
      });

      it('should return false when on first page', () => {
        service.updateState({ pageIndex: 0 });
        expect(service.hasPreviousPage()).toBe(false);
      });
    });
  });

  describe('Complex scenarios', () => {
    it('should handle complete pagination workflow', () => {
      service.initialize({ totalItems: 100, pageSize: 10 });
      expect(service.totalPages()).toBe(10);
      expect(service.hasNextPage()).toBe(true);
      expect(service.hasPreviousPage()).toBe(false);

      const pageEvent: PageEvent = {
        pageIndex: 5,
        pageSize: 20,
        length: 100,
      };
      service.onPageChange(pageEvent);

      expect(service.currentPage()).toBe(5);
      expect(service.pageSize()).toBe(20);
      expect(service.totalPages()).toBe(5);
      expect(service.hasNextPage()).toBe(false);
      expect(service.hasPreviousPage()).toBe(true);
    });

    it('should maintain consistency when updating total items', () => {
      service.updateState({ pageIndex: 5, pageSize: 10, totalItems: 100 });
      expect(service.hasNextPage()).toBe(true);

      service.setTotalItems(50);
      expect(service.totalPages()).toBe(5);
      expect(service.hasNextPage()).toBe(false);
    });

    it('should handle edge case with single item', () => {
      service.updateState({ pageSize: 5, totalItems: 1 });

      expect(service.totalPages()).toBe(1);
      expect(service.hasNextPage()).toBe(false);
      expect(service.hasPreviousPage()).toBe(false);

      const items = ['single item'];
      const result = service.getPagedItems(items);
      expect(result).toEqual(['single item']);
    });
  });
});
