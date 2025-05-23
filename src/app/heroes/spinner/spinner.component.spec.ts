import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { signal } from '@angular/core';
import { SpinnerComponent } from './spinner.component';
import { LoadingService } from '../../core/services/loading.service';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let mockIsLoadingSignal: any;

  beforeEach(async () => {
    mockIsLoadingSignal = signal(false);

    const loadingServiceSpy = jasmine.createSpyObj(
      'LoadingService',
      ['show', 'hide'],
      {
        isLoading: mockIsLoadingSignal.asReadonly(),
      }
    );

    await TestBed.configureTestingModule({
      imports: [SpinnerComponent, NoopAnimationsModule],
      providers: [{ provide: LoadingService, useValue: loadingServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    loadingService = TestBed.inject(
      LoadingService
    ) as jasmine.SpyObj<LoadingService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component initialization', () => {
    it('should inject LoadingService correctly', () => {
      expect(component['loadingService']).toBeDefined();
      expect(component['loadingService']).toBe(loadingService);
    });

    it('should assign isLoading signal from LoadingService', () => {
      expect(component.isLoading).toBeDefined();
      expect(component.isLoading).toBe(loadingService.isLoading);
    });

    it('should start with loading false', () => {
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Loading state reactivity', () => {
    it('should reflect loading state changes', () => {
      expect(component.isLoading()).toBe(false);

      mockIsLoadingSignal.set(true);
      expect(component.isLoading()).toBe(true);

      mockIsLoadingSignal.set(false);
      expect(component.isLoading()).toBe(false);
    });

    it('should be reactive to multiple state changes', () => {
      const states = [true, false, true, true, false];

      states.forEach((state) => {
        mockIsLoadingSignal.set(state);
        expect(component.isLoading()).toBe(state);
      });
    });

    it('should maintain reference to the same signal', () => {
      const initialSignal = component.isLoading;

      mockIsLoadingSignal.set(true);

      expect(component.isLoading).toBe(initialSignal);
      expect(component.isLoading()).toBe(true);
    });
  });

  describe('Template integration', () => {
    it('should reflect loading state in template', () => {
      mockIsLoadingSignal.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    });

    it('should be empty when not loading', () => {
      mockIsLoadingSignal.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('mat-spinner')).toBeFalsy();
    });

    it('should show content when loading', () => {
      mockIsLoadingSignal.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.innerHTML).toContain('mat-spinner');
    });

    it('should toggle content visibility correctly', () => {
      const compiled = fixture.nativeElement;

      mockIsLoadingSignal.set(true);
      fixture.detectChanges();
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();

      mockIsLoadingSignal.set(false);
      fixture.detectChanges();
      expect(compiled.querySelector('mat-spinner')).toBeFalsy();

      mockIsLoadingSignal.set(true);
      fixture.detectChanges();
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    });
  });

  describe('Signal readonly behavior', () => {
    it('should use readonly signal from service', () => {
      expect(component.isLoading).toBe(loadingService.isLoading);
    });

    it('should not be able to directly modify isLoading', () => {
      expect(() => {
        (component.isLoading as any).set(true);
      }).toThrow();
    });

    it('should reflect changes made through the service signal', () => {
      expect(component.isLoading()).toBe(false);

      mockIsLoadingSignal.set(true);
      expect(component.isLoading()).toBe(true);
    });
  });

  describe('Component lifecycle', () => {
    it('should maintain loading state across component updates', () => {
      mockIsLoadingSignal.set(true);
      expect(component.isLoading()).toBe(true);

      fixture.detectChanges();
      expect(component.isLoading()).toBe(true);

      // Test multiple change detection cycles
      fixture.detectChanges();
      expect(component.isLoading()).toBe(true);
    });

    it('should handle rapid state changes', () => {
      for (let i = 0; i < 10; i++) {
        mockIsLoadingSignal.set(i % 2 === 0);
        fixture.detectChanges();
        expect(component.isLoading()).toBe(i % 2 === 0);
      }
    });
  });

  describe('Error handling', () => {
    it('should handle undefined service gracefully in tests', () => {
      expect(component.isLoading).toBeDefined();
      expect(typeof component.isLoading).toBe('function');
    });

    it('should maintain signal functionality', () => {
      const currentValue = component.isLoading();
      expect(typeof currentValue).toBe('boolean');
    });
  });

  describe('Integration with LoadingService', () => {
    it('should receive updates when LoadingService state changes', () => {
      expect(component.isLoading()).toBe(false);

      mockIsLoadingSignal.set(true);
      expect(component.isLoading()).toBe(true);

      mockIsLoadingSignal.set(false);
      expect(component.isLoading()).toBe(false);
    });

    it('should be synchronized with LoadingService', () => {
      mockIsLoadingSignal.set(true);
      expect(component.isLoading()).toBe(loadingService.isLoading());

      mockIsLoadingSignal.set(false);
      expect(component.isLoading()).toBe(loadingService.isLoading());
    });

    it('should maintain consistent state with service', () => {
      const states = [true, false, true, false, true];

      states.forEach((state) => {
        mockIsLoadingSignal.set(state);
        expect(component.isLoading()).toBe(loadingService.isLoading());
        expect(component.isLoading()).toBe(state);
      });
    });
  });

  describe('Template conditional rendering', () => {
    it('should render nothing when not loading', () => {
      mockIsLoadingSignal.set(false);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('mat-spinner')).toBeFalsy();
    });

    it('should render spinner content when loading', () => {
      mockIsLoadingSignal.set(true);
      fixture.detectChanges();

      const compiled = fixture.nativeElement;
      expect(compiled.querySelector('mat-spinner')).toBeTruthy();
    });

    it('should handle async loading state changes', async () => {
      mockIsLoadingSignal.set(true);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('mat-spinner')).toBeTruthy();

      mockIsLoadingSignal.set(false);
      fixture.detectChanges();
      await fixture.whenStable();

      expect(fixture.nativeElement.querySelector('mat-spinner')).toBeFalsy();
    });
  });

  describe('Performance considerations', () => {
    it('should not create new signal references', () => {
      const initialReference = component.isLoading;

      fixture.detectChanges();
      mockIsLoadingSignal.set(true);
      fixture.detectChanges();
      mockIsLoadingSignal.set(false);
      fixture.detectChanges();

      expect(component.isLoading).toBe(initialReference);
    });

    it('should handle frequent updates efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 100; i++) {
        mockIsLoadingSignal.set(i % 2 === 0);
        fixture.detectChanges();
      }

      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(1000);
    });
  });
});
