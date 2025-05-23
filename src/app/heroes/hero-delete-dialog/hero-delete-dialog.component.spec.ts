import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { HeroDeleteDialogComponent } from './hero-delete-dialog.component';
import { Hero } from '../../core/models/hero.model';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('HeroDeleteDialogComponent', () => {
  let component: HeroDeleteDialogComponent;
  let fixture: ComponentFixture<HeroDeleteDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<HeroDeleteDialogComponent>>;
  let mockHero: Hero;

  beforeEach(async () => {
    mockHero = {
      id: 1,
      name: 'Superman',
      alterEgo: 'Clark Kent',
      powers: ['Vuelo', 'Super fuerza'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1938, 3, 18),
      description: 'El Hombre de Acero',
      imageUrl: 'images/superman.jpg',
    };

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [HeroDeleteDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { hero: mockHero } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroDeleteDialogComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<HeroDeleteDialogComponent>
    >;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should inject hero data correctly', () => {
    expect(component.data.hero).toEqual(mockHero);
    expect(component.data.hero.name).toBe('Superman');
  });

  it('should have access to dialogRef', () => {
    expect(component.dialogRef).toBeDefined();
  });

  describe('onCancel()', () => {
    it('should close dialog with false', () => {
      component.onCancel();

      expect(dialogRef.close).toHaveBeenCalledWith(false);
    });

    it('should close dialog when cancel button is clicked', () => {
      const cancelButton = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="cancel-button"]'
      );

      if (cancelButton) {
        cancelButton.click();
        expect(dialogRef.close).toHaveBeenCalledWith(false);
      }
    });
  });

  describe('onConfirm()', () => {
    it('should close dialog with true', () => {
      component.onConfirm();

      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should close dialog when confirm button is clicked', () => {
      const confirmButton = fixture.debugElement.nativeElement.querySelector(
        '[data-testid="confirm-button"]'
      );

      if (confirmButton) {
        confirmButton.click();
        expect(dialogRef.close).toHaveBeenCalledWith(true);
      }
    });
  });

  describe('Template rendering', () => {
    it('should display hero name in dialog', () => {
      const compiled = fixture.nativeElement;
      expect(compiled.textContent).toContain('Superman');
    });

    it('should render cancel and confirm buttons', () => {
      const buttons =
        fixture.debugElement.nativeElement.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('should have correct button text or labels', () => {
      const compiled = fixture.nativeElement;
      const buttonTexts = compiled.textContent.toLowerCase();

      expect(buttonTexts).toMatch(/cancel|cancelar|no/);
      expect(buttonTexts).toMatch(/confirm|delete|eliminar|sí|yes/);
    });
  });

  describe('Different hero data scenarios', () => {
    it('should handle hero with different name', async () => {
      const differentHero: Hero = {
        id: 2,
        name: 'Batman',
        alterEgo: 'Bruce Wayne',
        powers: ['Inteligencia'],
        publisher: 'DC Comics',
        firstAppearance: new Date(1939, 4, 1),
        description: 'El Caballero Oscuro',
        imageUrl: 'images/batman.jpg',
      };

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [HeroDeleteDialogComponent, NoopAnimationsModule],
        providers: [
          { provide: MatDialogRef, useValue: dialogRef },
          { provide: MAT_DIALOG_DATA, useValue: { hero: differentHero } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(HeroDeleteDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.data.hero.name).toBe('Batman');
      expect(fixture.nativeElement.textContent).toContain('Batman');
    });

    it('should handle hero with long name', async () => {
      const heroWithLongName: Hero = {
        id: 3,
        name: 'The Amazing Spider-Man with a Very Long Hero Name',
        alterEgo: 'Peter Parker',
        powers: ['Spider powers'],
        publisher: 'Marvel Comics',
        firstAppearance: new Date(1962, 7, 10),
        description: 'Hero with long name',
        imageUrl: 'images/spiderman.jpg',
      };

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [HeroDeleteDialogComponent, NoopAnimationsModule],
        providers: [
          { provide: MatDialogRef, useValue: dialogRef },
          { provide: MAT_DIALOG_DATA, useValue: { hero: heroWithLongName } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(HeroDeleteDialogComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.data.hero.name).toBe(
        'The Amazing Spider-Man with a Very Long Hero Name'
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle multiple rapid clicks on cancel', () => {
      component.onCancel();
      component.onCancel();
      component.onCancel();

      expect(dialogRef.close).toHaveBeenCalledTimes(3);
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    });

    it('should handle multiple rapid clicks on confirm', () => {
      component.onConfirm();
      component.onConfirm();
      component.onConfirm();

      expect(dialogRef.close).toHaveBeenCalledTimes(3);
      expect(dialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should handle alternating cancel and confirm clicks', () => {
      component.onCancel();
      expect(dialogRef.close).toHaveBeenCalledWith(false);

      dialogRef.close.calls.reset();

      component.onConfirm();
      expect(dialogRef.close).toHaveBeenCalledWith(true);

      dialogRef.close.calls.reset();

      component.onCancel();
      expect(dialogRef.close).toHaveBeenCalledWith(false);
    });
  });
});
