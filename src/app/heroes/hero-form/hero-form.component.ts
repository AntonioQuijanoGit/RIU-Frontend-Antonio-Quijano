import { Component, OnInit, Inject, Optional } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { Hero } from '../../core/models/hero.model';
import { UppercaseDirective } from '../../core/directives/uppercase.directive';

@Component({
  selector: 'app-hero-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDialogModule,
    MatChipsModule,
    MatIconModule,
    UppercaseDirective,
  ],
  templateUrl: './hero-form.component.html',
  styleUrls: ['./hero-form.component.scss'],
})
export class HeroFormComponent implements OnInit {
  heroForm!: FormGroup;
  isEditMode = false;
  title = 'Añadir Superhéroe';
  publishers = [
    'DC Comics',
    'Marvel Comics',
    'Image Comics',
    'Dark Horse Comics',
    'Otro',
  ];
  powers: string[] = [];
  newPower = '';

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  maxFileSizeMB = 2;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<HeroFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data: { hero: Hero }
  ) {}

  ngOnInit(): void {
    this.createForm();

    if (this.data?.hero) {
      this.isEditMode = true;
      this.title = 'Editar Superhéroe';
      this.heroForm.patchValue(this.data.hero);
      this.powers = [...this.data.hero.powers];

      if (this.data.hero.imageUrl) {
        this.imagePreview = this.data.hero.imageUrl;
      }
    }
  }

  createForm(): void {
    this.heroForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      alterEgo: [''],
      publisher: [''],
      firstAppearance: [null],
      description: [''],
      imageUrl: [''],
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      if (file.size > this.maxFileSizeMB * 1024 * 1024) {
        alert(
          `El archivo es demasiado grande. El tamaño máximo es ${this.maxFileSizeMB}MB.`
        );
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Solo se permiten archivos de imagen.');
        return;
      }

      this.selectedFile = file;

      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    this.heroForm.get('imageUrl')?.setValue('');
  }

  addPower(): void {
    if (this.newPower.trim()) {
      this.powers.push(this.newPower.trim());
      this.newPower = '';
    }
  }

  removePower(power: string): void {
    const index = this.powers.indexOf(power);
    if (index >= 0) {
      this.powers.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.heroForm.valid) {
      const heroData = this.heroForm.value;
      heroData.powers = this.powers;

      if (this.imagePreview) {
        heroData.imageUrl = this.imagePreview;
      }

      this.dialogRef.close(heroData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
