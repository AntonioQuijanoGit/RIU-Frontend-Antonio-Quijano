import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Hero } from '../../core/models/hero.model';

@Component({
  selector: 'app-hero-delete-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './hero-delete-dialog.component.html',
  styleUrls: ['./hero-delete-dialog.component.scss'],
})
export class HeroDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<HeroDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { hero: Hero }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}
