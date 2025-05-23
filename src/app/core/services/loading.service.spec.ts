import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should start with loading false', () => {
      expect(service.isLoading()).toBe(false);
      expect(service.isCurrentlyLoading()).toBe(false);
    });
  });

  describe('show() method', () => {
    it('should set loading to true when called', () => {
      service.show();

      expect(service.isLoading()).toBe(true);
      expect(service.isCurrentlyLoading()).toBe(true);
    });

    it('should automatically hide loading after 2000ms', () => {
      service.show();
      expect(service.isLoading()).toBe(true);

      jasmine.clock().tick(2000);

      expect(service.isLoading()).toBe(false);
      expect(service.isCurrentlyLoading()).toBe(false);
    });

    it('should not hide loading before 2000ms', () => {
      service.show();
      expect(service.isLoading()).toBe(true);

      jasmine.clock().tick(1999);

      expect(service.isLoading()).toBe(true);
    });

    it('should clear previous timeout when called multiple times', () => {
      service.show();
      expect(service.isLoading()).toBe(true);

      jasmine.clock().tick(1000);
      expect(service.isLoading()).toBe(true);

      service.show();
      expect(service.isLoading()).toBe(true);

      jasmine.clock().tick(1000);
      expect(service.isLoading()).toBe(true);

      jasmine.clock().tick(1000);
      expect(service.isLoading()).toBe(false);
    });
  });

  describe('hide() method', () => {
    it('should set loading to false when called', () => {
      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();

      expect(service.isLoading()).toBe(false);
      expect(service.isCurrentlyLoading()).toBe(false);
    });

    it('should clear the timeout when called', () => {
      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);

      jasmine.clock().tick(2000);
      expect(service.isLoading()).toBe(false);
    });

    it('should work correctly when called without previous show()', () => {
      expect(service.isLoading()).toBe(false);

      service.hide();

      expect(service.isLoading()).toBe(false);
      expect(service.isCurrentlyLoading()).toBe(false);
    });

    it('should work correctly when called multiple times', () => {
      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();
      service.hide();
      service.hide();

      expect(service.isLoading()).toBe(false);
      expect(service.isCurrentlyLoading()).toBe(false);
    });
  });

  describe('isCurrentlyLoading() method', () => {
    it('should return same value as isLoading signal', () => {
      expect(service.isCurrentlyLoading()).toBe(service.isLoading());

      service.show();
      expect(service.isCurrentlyLoading()).toBe(service.isLoading());
      expect(service.isCurrentlyLoading()).toBe(true);

      service.hide();
      expect(service.isCurrentlyLoading()).toBe(service.isLoading());
      expect(service.isCurrentlyLoading()).toBe(false);
    });
  });

  describe('Complex scenarios', () => {
    it('should handle show() -> hide() -> show() sequence correctly', () => {
      service.show();
      expect(service.isLoading()).toBe(true);

      service.hide();
      expect(service.isLoading()).toBe(false);

      service.show();
      expect(service.isLoading()).toBe(true);

      jasmine.clock().tick(2000);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle rapid show() calls correctly', () => {
      service.show();
      service.show();
      service.show();

      expect(service.isLoading()).toBe(true);

      jasmine.clock().tick(1999);
      expect(service.isLoading()).toBe(true);

      jasmine.clock().tick(1);
      expect(service.isLoading()).toBe(false);
    });

    it('should handle show() followed by immediate hide()', () => {
      service.show();
      service.hide();

      expect(service.isLoading()).toBe(false);

      jasmine.clock().tick(2000);
      expect(service.isLoading()).toBe(false);
    });
  });
});
