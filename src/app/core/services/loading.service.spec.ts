import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SpinnerComponent } from '../../heroes/spinner/spinner.component';
import { LoadingService } from '../../core/services/loading.service';
import { of } from 'rxjs';

describe('SpinnerComponent', () => {
  let component: SpinnerComponent;
  let fixture: ComponentFixture<SpinnerComponent>;
  let mockLoadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(async () => {
    const loadingServiceSpy = jasmine.createSpyObj(
      'LoadingService',
      ['show', 'hide'],
      {
        isLoading$: of(false),
      }
    );

    await TestBed.configureTestingModule({
      imports: [SpinnerComponent],
      providers: [{ provide: LoadingService, useValue: loadingServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(SpinnerComponent);
    component = fixture.componentInstance;
    mockLoadingService = TestBed.inject(
      LoadingService
    ) as jasmine.SpyObj<LoadingService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject LoadingService', () => {
    expect(component.loadingService).toBe(mockLoadingService);
  });

  it('should have access to isLoading$ observable', () => {
    expect(component.loadingService.isLoading$).toBeDefined();
  });
});
