import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HeroFormComponent } from './hero-form.component';
import { Hero } from '../../core/models/hero.model';

describe('HeroFormComponent', () => {
  let component: HeroFormComponent;
  let fixture: ComponentFixture<HeroFormComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<HeroFormComponent>>;
  let mockHero: Hero;

  beforeEach(async () => {
    mockHero = {
      id: 1,
      name: 'Superman',
      alterEgo: 'Clark Kent',
      powers: ['Vuelo', 'Super fuerza', 'Visión de rayos X'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1938, 3, 18),
      description: 'El Hombre de Acero',
      imageUrl: 'images/superman.jpg',
    };

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [HeroFormComponent, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: null },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
    dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<HeroFormComponent>
    >;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component initialization', () => {
    it('should initialize in add mode by default', () => {
      expect(component.isEditMode).toBe(false);
      expect(component.title).toBe('Añadir Superhéroe');
    });

    it('should create form with correct structure', () => {
      expect(component.heroForm).toBeDefined();
      expect(component.heroForm.get('name')).toBeDefined();
      expect(component.heroForm.get('alterEgo')).toBeDefined();
      expect(component.heroForm.get('publisher')).toBeDefined();
      expect(component.heroForm.get('firstAppearance')).toBeDefined();
      expect(component.heroForm.get('description')).toBeDefined();
      expect(component.heroForm.get('imageUrl')).toBeDefined();
    });

    it('should have correct publishers list', () => {
      expect(component.publishers).toEqual([
        'DC Comics',
        'Marvel Comics',
        'Image Comics',
        'Dark Horse Comics',
        'Otro',
      ]);
    });

    it('should initialize with empty powers array', () => {
      expect(component.powers).toEqual([]);
      expect(component.newPower).toBe('');
    });

    it('should initialize file-related properties', () => {
      expect(component.selectedFile).toBe(null);
      expect(component.imagePreview).toBeNull();
      expect(component.maxFileSizeMB).toBe(2);
    });
  });

  describe('Form validation', () => {
    it('should require name field', () => {
      const nameControl = component.heroForm.get('name');

      nameControl?.setValue('');
      expect(nameControl?.hasError('required')).toBe(true);

      nameControl?.setValue('Superman');
      expect(nameControl?.hasError('required')).toBe(false);
    });

    it('should require minimum length for name', () => {
      const nameControl = component.heroForm.get('name');

      nameControl?.setValue('ab');
      expect(nameControl?.hasError('minlength')).toBe(true);

      nameControl?.setValue('abc');
      expect(nameControl?.hasError('minlength')).toBe(false);
    });

    it('should validate form correctly', () => {
      expect(component.heroForm.valid).toBe(false);

      component.heroForm.patchValue({
        name: 'Superman',
        alterEgo: 'Clark Kent',
      });

      expect(component.heroForm.valid).toBe(true);
    });

    it('should handle optional fields', () => {
      component.heroForm.patchValue({
        name: 'Superman',
      });

      expect(component.heroForm.get('alterEgo')?.hasError('required')).toBe(
        false
      );
      expect(component.heroForm.get('publisher')?.hasError('required')).toBe(
        false
      );
      expect(component.heroForm.get('description')?.hasError('required')).toBe(
        false
      );
    });
  });

  describe('Edit mode', () => {
    beforeEach(async () => {
      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [HeroFormComponent, ReactiveFormsModule, NoopAnimationsModule],
        providers: [
          { provide: MatDialogRef, useValue: dialogRef },
          { provide: MAT_DIALOG_DATA, useValue: { hero: mockHero } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(HeroFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should initialize in edit mode when hero data provided', () => {
      expect(component.isEditMode).toBe(true);
      expect(component.title).toBe('Editar Superhéroe');
    });

    it('should populate form with hero data', () => {
      expect(component.heroForm.get('name')?.value).toBe('Superman');
      expect(component.heroForm.get('alterEgo')?.value).toBe('Clark Kent');
      expect(component.heroForm.get('publisher')?.value).toBe('DC Comics');
      expect(component.heroForm.get('description')?.value).toBe(
        'El Hombre de Acero'
      );
    });

    it('should populate powers array', () => {
      expect(component.powers).toEqual([
        'Vuelo',
        'Super fuerza',
        'Visión de rayos X',
      ]);
    });

    it('should set image preview when hero has image', () => {
      expect(component.imagePreview).toBe('images/superman.jpg');
    });
  });

  describe('Powers management', () => {
    it('should add power when valid', () => {
      component.newPower = 'New Power';
      component.addPower();

      expect(component.powers).toContain('New Power');
      expect(component.newPower).toBe('');
    });

    it('should trim power before adding', () => {
      component.newPower = '  Trimmed Power  ';
      component.addPower();

      expect(component.powers).toContain('Trimmed Power');
    });

    it('should not add empty power', () => {
      const initialLength = component.powers.length;

      component.newPower = '';
      component.addPower();

      expect(component.powers.length).toBe(initialLength);

      component.newPower = '   ';
      component.addPower();

      expect(component.powers.length).toBe(initialLength);
    });

    it('should remove power correctly', () => {
      component.powers = ['Power 1', 'Power 2', 'Power 3'];

      component.removePower('Power 2');

      expect(component.powers).toEqual(['Power 1', 'Power 3']);
      expect(component.powers.length).toBe(2);
    });

    it('should handle removing non-existent power', () => {
      component.powers = ['Power 1', 'Power 2'];
      const initialLength = component.powers.length;

      component.removePower('Non-existent Power');

      expect(component.powers.length).toBe(initialLength);
    });

    it('should remove first occurrence when duplicate powers exist', () => {
      component.powers = ['Power 1', 'Power 2', 'Power 1'];

      component.removePower('Power 1');

      expect(component.powers).toEqual(['Power 2', 'Power 1']);
    });
  });

  describe('File handling', () => {
    let mockFile: File;
    let mockEvent: Event;

    beforeEach(() => {
      mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      Object.defineProperty(mockFile, 'size', { value: 1024 * 1024 });
    });

    it('should handle valid file selection', () => {
      const input = document.createElement('input');
      input.type = 'file';
      Object.defineProperty(input, 'files', {
        value: [mockFile],
        writable: false,
      });

      mockEvent = { target: input } as any;

      spyOn(FileReader.prototype, 'readAsDataURL');

      component.onFileSelected(mockEvent);

      expect(component.selectedFile).toEqual(jasmine.any(File));
    });

    it('should reject files larger than max size', () => {
      const largeFile = new File(['test'], 'large.jpg', { type: 'image/jpeg' });
      Object.defineProperty(largeFile, 'size', { value: 3 * 1024 * 1024 });

      const input = document.createElement('input');
      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false,
      });

      mockEvent = { target: input } as any;
      spyOn(window, 'alert');

      component.onFileSelected(mockEvent);

      expect(window.alert).toHaveBeenCalledWith(
        'El archivo es demasiado grande. El tamaño máximo es 2MB.'
      );
      expect(component.selectedFile).toBeNull();
    });

    it('should reject non-image files', () => {
      const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });

      const input = document.createElement('input');
      Object.defineProperty(input, 'files', {
        value: [textFile],
        writable: false,
      });

      mockEvent = { target: input } as any;
      spyOn(window, 'alert');

      component.onFileSelected(mockEvent);

      expect(window.alert).toHaveBeenCalledWith(
        'Solo se permiten archivos de imagen.'
      );
      expect(component.selectedFile).toBeNull();
    });

    it('should handle empty file selection', () => {
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', {
        value: [],
        writable: false,
      });

      mockEvent = { target: input } as any;

      component.onFileSelected(mockEvent);

      expect(component.selectedFile).toBeNull();
    });

    it('should handle null files', () => {
      const input = document.createElement('input');
      Object.defineProperty(input, 'files', {
        value: null,
        writable: false,
      });

      mockEvent = { target: input } as any;

      component.onFileSelected(mockEvent);

      expect(component.selectedFile).toBeNull();
    });
  });

  describe('Image management', () => {
    it('should remove image correctly', () => {
      component.selectedFile = new File(['test'], 'test.jpg', {
        type: 'image/jpeg',
      });
      component.imagePreview = 'data:image/jpeg;base64,test';
      component.heroForm.get('imageUrl')?.setValue('test-url');

      component.removeImage();

      expect(component.selectedFile).toBeNull();
      expect(component.imagePreview).toBeNull();
      expect(component.heroForm.get('imageUrl')?.value).toBe('');
    });

    it('should handle removing image when none selected', () => {
      component.removeImage();

      expect(component.selectedFile).toBeNull();
      expect(component.imagePreview).toBeNull();
    });
  });

  describe('Form submission', () => {
    beforeEach(() => {
      component.heroForm.patchValue({
        name: 'Test Hero',
        alterEgo: 'Test Alter Ego',
        publisher: 'DC Comics',
        description: 'Test Description',
      });
      component.powers = ['Test Power 1', 'Test Power 2'];
    });

    it('should submit valid form', () => {
      component.onSubmit();

      expect(dialogRef.close).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'Test Hero',
          alterEgo: 'Test Alter Ego',
          publisher: 'DC Comics',
          description: 'Test Description',
          powers: ['Test Power 1', 'Test Power 2'],
        })
      );
    });

    it('should include image URL when image preview exists', () => {
      component.imagePreview = 'data:image/jpeg;base64,test';

      component.onSubmit();

      expect(dialogRef.close).toHaveBeenCalledWith(
        jasmine.objectContaining({
          imageUrl: 'data:image/jpeg;base64,test',
        })
      );
    });

    it('should not submit invalid form', () => {
      component.heroForm.get('name')?.setValue('');

      component.onSubmit();

      expect(dialogRef.close).not.toHaveBeenCalled();
    });

    it('should include powers in submitted data', () => {
      component.powers = ['Power A', 'Power B', 'Power C'];

      component.onSubmit();

      const submittedData = (dialogRef.close as jasmine.Spy).calls.mostRecent()
        .args[0];
      expect(submittedData.powers).toEqual(['Power A', 'Power B', 'Power C']);
    });
  });

  describe('Dialog actions', () => {
    it('should close dialog on cancel', () => {
      component.onCancel();

      expect(dialogRef.close).toHaveBeenCalledWith();
    });

    it('should close dialog without data on cancel', () => {
      component.onCancel();

      const args = (dialogRef.close as jasmine.Spy).calls.mostRecent().args;
      expect(args.length).toBe(0);
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle missing data gracefully', () => {
      component.data = null as any;

      expect(() => component.ngOnInit()).not.toThrow();
      expect(component.isEditMode).toBe(false);
    });

    it('should handle hero without powers', async () => {
      const heroWithoutPowers = { ...mockHero, powers: [] };

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [HeroFormComponent, ReactiveFormsModule, NoopAnimationsModule],
        providers: [
          { provide: MatDialogRef, useValue: dialogRef },
          { provide: MAT_DIALOG_DATA, useValue: { hero: heroWithoutPowers } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(HeroFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.powers).toEqual([]);
    });

    it('should handle hero without image URL', async () => {
      const heroWithoutImage = { ...mockHero, imageUrl: '' };

      await TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [HeroFormComponent, ReactiveFormsModule, NoopAnimationsModule],
        providers: [
          { provide: MatDialogRef, useValue: dialogRef },
          { provide: MAT_DIALOG_DATA, useValue: { hero: heroWithoutImage } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(HeroFormComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();

      expect(component.imagePreview).toBe(null);
    });

    it('should handle form submission with empty powers', () => {
      component.heroForm.patchValue({
        name: 'Test Hero',
      });
      component.powers = [];

      component.onSubmit();

      expect(dialogRef.close).toHaveBeenCalled();
      const submittedData = (dialogRef.close as jasmine.Spy).calls.mostRecent()
        .args[0];
      expect(submittedData.powers).toEqual([]);
    });
  });

  describe('Form field accessibility', () => {
    it('should have required validation message capability', () => {
      const nameControl = component.heroForm.get('name');
      nameControl?.setValue('');
      nameControl?.markAsTouched();

      expect(nameControl?.hasError('required')).toBe(true);
      expect(nameControl?.touched).toBe(true);
    });

    it('should have minlength validation message capability', () => {
      const nameControl = component.heroForm.get('name');
      nameControl?.setValue('ab');
      nameControl?.markAsTouched();

      expect(nameControl?.hasError('minlength')).toBe(true);
      expect(nameControl?.touched).toBe(true);
    });
  });
});
