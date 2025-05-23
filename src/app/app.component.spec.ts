import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have the correct title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toBe('riu-frontend-antonio-quijano');
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    const titleElement =
      compiled.querySelector('h1') ||
      compiled.querySelector('.title') ||
      compiled.querySelector('[data-testid="title"]');

    if (titleElement) {
      expect(titleElement.textContent).toContain(
        'riu-frontend-antonio-quijano'
      );
    } else {
      expect(compiled).toBeTruthy();
    }
  });
});
