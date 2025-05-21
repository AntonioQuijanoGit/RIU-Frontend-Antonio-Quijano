import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { switchMap } from 'rxjs/operators';
import { HeroService } from '../../core/services/hero.service';
import { Hero } from '../../core/models/hero.model';
import { HeroFormComponent } from '../hero-form/hero-form.component';
import { HeroDeleteDialogComponent } from '../hero-delete-dialog/hero-delete-dialog.component';

@Component({
  selector: 'app-hero-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatDialogModule,
  ],
  templateUrl: './hero-detail.component.html',
  styleUrls: ['./hero-detail.component.scss'],
})
export class HeroDetailComponent implements OnInit {
  hero: Hero | undefined;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private heroService: HeroService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = Number(params.get('id'));
          return this.heroService.getHeroById(id);
        })
      )
      .subscribe((hero) => {
        this.hero = hero;
        if (!hero) {
          this.router.navigate(['/heroes']);
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/heroes']);
  }

  editHero(): void {
    if (this.hero) {
      const dialogRef = this.dialog.open(HeroFormComponent, {
        width: '600px',
        data: { hero: this.hero },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.heroService.updateHero(result).subscribe((updatedHero) => {
            // Actualizar el héroe actual
            this.hero = updatedHero;
          });
        }
      });
    }
  }

  deleteHero(): void {
    if (this.hero) {
      const dialogRef = this.dialog.open(HeroDeleteDialogComponent, {
        width: '400px',
        data: { hero: this.hero },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.heroService.deleteHero(this.hero!.id).subscribe((success) => {
            if (success) {
              this.router.navigate(['/heroes']);
            }
          });
        }
      });
    }
  }

  getHeroColor(heroToUse?: Hero): string {
    // Si no se pasa un héroe específico, usar el héroe actual
    const hero = heroToUse || this.hero;

    if (!hero) return '#777777';

    // Colores predefinidos para editoriales conocidas
    if (hero.publisher === 'DC Comics') return '#0476F2';
    if (hero.publisher === 'Marvel Comics') return '#EC1D24';

    // Para otros héroes, genera un color basado en el nombre
    let hash = 0;
    for (let i = 0; i < hero.name.length; i++) {
      hash = hero.name.charCodeAt(i) + ((hash << 5) - hash);
    }

    const hue = Math.abs(hash % 360);
    return `hsl(${hue}, 70%, 60%)`;
  }
}
