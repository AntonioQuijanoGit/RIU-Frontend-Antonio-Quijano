import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeroDeleteDialogComponent } from './hero-delete-dialog.component';
import { Hero } from '../../core/models/hero.model';

describe('HeroDeleteDialogComponent', () => {
  let component: HeroDeleteDialogComponent;
  let fixture: ComponentFixture<HeroDeleteDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<HeroDeleteDialogComponent>>;
  let mockHero: Hero;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockHero = {
      id: 1,
      name: 'Test Hero',
      alterEgo: 'Test Alter',
      powers: ['Test Power'],
      publisher: 'Test Publisher',
      firstAppearance: new Date(),
      description: 'Test description',
      imageUrl: 'test.jpg',
    };

    await TestBed.configureTestingModule({
      imports: [HeroDeleteDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { hero: mockHero } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroDeleteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have hero data from MAT_DIALOG_DATA', () => {
    expect(component.data.hero).toEqual(mockHero);
  });

  it('should close dialog with false when cancelled', () => {
    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });

  it('should close dialog with true when confirmed', () => {
    component.onConfirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });
});
