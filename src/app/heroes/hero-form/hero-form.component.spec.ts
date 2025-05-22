import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from '@angular/material/core';
import { HeroFormComponent } from './hero-form.component';
import { Hero } from '../../core/models/hero.model';

describe('HeroFormComponent', () => {
  let component: HeroFormComponent;
  let fixture: ComponentFixture<HeroFormComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<HeroFormComponent>>;
  let mockHero: Hero;

  beforeEach(async () => {
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockHero = {
      id: 1,
      name: 'Test Hero',
      alterEgo: 'Test Alter',
      powers: ['Test Power 1', 'Test Power 2'],
      publisher: 'DC Comics',
      firstAppearance: new Date('2023-01-01'),
      description: 'Test description',
      imageUrl: 'test.jpg',
    };

    await TestBed.configureTestingModule({
      imports: [
        HeroFormComponent,
        ReactiveFormsModule,
        NoopAnimationsModule,
        MatNativeDateModule,
      ],
      providers: [
        FormBuilder,
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: null },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form initialization', () => {
    it('should initialize form with empty values in add mode', () => {
      expect(component.isEditMode).toBe(false);
      expect(component.title).toBe('Añadir Superhéroe');
      expect(component.heroForm.get('name')?.value).toBe('');
    });

    it('should initialize form with hero data in edit mode', () => {
      component.data = { hero: mockHero };
      component.ngOnInit();

      expect(component.isEditMode).toBe(true);
      expect(component.title).toBe('Editar Superhéroe');
      expect(component.heroForm.get('name')?.value).toBe('Test Hero');
      expect(component.powers).toEqual(['Test Power 1', 'Test Power 2']);
    });
  });

  describe('Form validation', () => {
    it('should require name field', () => {
      const nameControl = component.heroForm.get('name');
      expect(nameControl?.valid).toBeFalsy();

      nameControl?.setValue('Te');
      expect(nameControl?.valid).toBeFalsy();

      nameControl?.setValue('Test Hero');
      expect(nameControl?.valid).toBeTruthy();
    });

    it('should mark form as invalid when name is missing', () => {
      expect(component.heroForm.valid).toBeFalsy();
    });
  });

  describe('File handling', () => {
    it('should handle valid image file selection', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      const event = { target: { files: [file] } } as any;

      spyOn(FileReader.prototype, 'readAsDataURL');
      component.onFileSelected(event);

      expect(component.selectedFile).toBe(file);
    });

    it('should reject oversized files', () => {
      const largeFile = new File(['x'.repeat(3 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });
      const event = { target: { files: [largeFile] } } as any;

      spyOn(window, 'alert');
      component.onFileSelected(event);

      expect(window.alert).toHaveBeenCalledWith(
        'El archivo es demasiado grande. El tamaño máximo es 2MB.'
      );
      expect(component.selectedFile).toBeNull();
    });

    it('should reject non-image files', () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' });
      const event = { target: { files: [textFile] } } as any;

      spyOn(window, 'alert');
      component.onFileSelected(event);

      expect(window.alert).toHaveBeenCalledWith(
        'Solo se permiten archivos de imagen.'
      );
      expect(component.selectedFile).toBeNull();
    });

    it('should remove image when removeImage is called', () => {
      component.selectedFile = new File([''], 'test.jpg', {
        type: 'image/jpeg',
      });
      component.imagePreview = 'data:image/jpeg;base64,test';

      component.removeImage();

      expect(component.selectedFile).toBeNull();
      expect(component.imagePreview).toBeNull();
      expect(component.heroForm.get('imageUrl')?.value).toBe('');
    });
  });

  describe('Powers management', () => {
    it('should add power when addPower is called with valid input', () => {
      component.newPower = 'New Power';
      component.addPower();

      expect(component.powers).toContain('New Power');
      expect(component.newPower).toBe('');
    });

    it('should not add empty power', () => {
      component.newPower = '   ';
      component.addPower();

      expect(component.powers.length).toBe(0);
    });

    it('should remove power when removePower is called', () => {
      component.powers = ['Power 1', 'Power 2'];
      component.removePower('Power 1');

      expect(component.powers).toEqual(['Power 2']);
    });
  });

  describe('Form submission', () => {
    it('should close dialog with form data when form is valid', () => {
      component.heroForm.patchValue({
        name: 'Test Hero',
        alterEgo: 'Test Alter',
      });
      component.powers = ['Test Power'];

      component.onSubmit();

      expect(mockDialogRef.close).toHaveBeenCalledWith(
        jasmine.objectContaining({
          name: 'Test Hero',
          alterEgo: 'Test Alter',
          powers: ['Test Power'],
        })
      );
    });

    it('should not submit when form is invalid', () => {
      component.onSubmit();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });

    it('should close dialog without data when cancelled', () => {
      component.onCancel();
      expect(mockDialogRef.close).toHaveBeenCalledWith();
    });
  });
});
