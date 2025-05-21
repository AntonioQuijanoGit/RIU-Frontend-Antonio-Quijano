import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { HeroService } from '../../core/services/hero.service';
import {
  PaginationService,
  PageState,
} from '../../core/services/pagination.service';
import { Hero } from '../../core/models/hero.model';
import { HeroFormComponent } from '../hero-form/hero-form.component';
import { HeroDeleteDialogComponent } from '../hero-delete-dialog/hero-delete-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-hero-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatDialogModule,
    MatCardModule,
    MatTooltipModule,
  ],
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.scss'],
})
export class HeroListComponent implements OnInit, OnDestroy {
  heroes: Hero[] = [];
  filteredHeroes: Hero[] = [];
  displayedHeroes: Hero[] = [];
  paginationState: PageState = {
    pageIndex: 0,
    pageSize: 5,
    pageSizeOptions: [5, 10, 25],
    totalItems: 0,
  };

  // Añadir esta propiedad para controlar el filtro activo
  publisherFilter: string | null = null;

  searchControl = new FormControl('');
  private searchSubscription!: Subscription;
  private paginationSubscription!: Subscription;

  // View mode control
  viewMode: 'grid' | 'list' = 'grid';

  // Table columns
  displayedColumns: string[] = [
    'id',
    'name',
    'alterEgo',
    'publisher',
    'powers',
    'actions',
  ];

  constructor(
    private heroService: HeroService,
    private paginationService: PaginationService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inicializar el servicio de paginación
    this.paginationService.initialize({
      pageSize: 5,
      pageSizeOptions: [5, 10, 25],
      pageIndex: 0,
      totalItems: 0,
    });

    // Suscribirse a cambios en el estado de paginación
    this.paginationSubscription = this.paginationService
      .getState()
      .subscribe((state) => {
        this.paginationState = state;
        if (this.filteredHeroes.length > 0) {
          this.updateDisplayedHeroes();
        }
      });

    // Get all heroes
    this.heroService.getHeroes().subscribe((heroes) => {
      this.heroes = heroes;
      this.applyFilter();
    });

    // Subscribe to search field changes
    this.searchSubscription = this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.paginationService.resetToFirstPage();
        this.applyFilter();
      });

    // Recuperar modo de vista guardado
    const savedViewMode = localStorage.getItem('heroViewMode');
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      this.viewMode = savedViewMode as 'grid' | 'list';
    }
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
    if (this.paginationSubscription) {
      this.paginationSubscription.unsubscribe();
    }
  }

  applyFilter(): void {
    const filterValue = this.searchControl.value?.toLowerCase() || '';

    // Aplicar filtro por nombre primero
    let filtered = this.heroes;
    if (filterValue) {
      filtered = filtered.filter((hero) =>
        hero.name.toLowerCase().includes(filterValue)
      );
    }

    // Aplicar filtro por editorial si está activo
    if (this.publisherFilter) {
      filtered = filtered.filter(
        (hero) => hero.publisher === this.publisherFilter
      );
    }

    this.filteredHeroes = filtered;

    // Actualizar el total de elementos en el servicio de paginación
    this.paginationService.setTotalItems(this.filteredHeroes.length);
    this.updateDisplayedHeroes();
  }

  // Añadir estos dos nuevos métodos para manejar el filtro de editorial
  filterByPublisher(publisher: string): void {
    // Si ya está seleccionado el mismo publisher, lo deseleccionamos
    if (this.publisherFilter === publisher) {
      this.publisherFilter = null;
    } else {
      this.publisherFilter = publisher;
    }

    // Regresar a la primera página cuando cambiamos el filtro
    this.paginationService.resetToFirstPage();
    this.applyFilter();
  }

  clearPublisherFilter(): void {
    this.publisherFilter = null;
    this.applyFilter();
  }

  updateDisplayedHeroes(): void {
    // Usar el servicio para obtener los elementos paginados
    this.displayedHeroes = this.paginationService.getPagedItems(
      this.filteredHeroes
    );
  }

  onPageChange(event: PageEvent): void {
    // Delegar al servicio
    this.paginationService.onPageChange(event);
  }

  switchView(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
    // Guardar preferencia
    localStorage.setItem('heroViewMode', mode);
  }

  getHeroColor(hero: Hero): string {
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

  addHero(): void {
    const dialogRef = this.dialog.open(HeroFormComponent, {
      width: '600px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.heroService.addHero(result).subscribe((newHero) => {
          // Actualiza la lista de héroes
          this.heroService.getHeroes().subscribe((heroes) => {
            this.heroes = heroes;
            this.applyFilter();
          });
        });
      }
    });
  }

  editHero(hero: Hero): void {
    const dialogRef = this.dialog.open(HeroFormComponent, {
      width: '600px',
      data: { hero },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.heroService.updateHero(result).subscribe((updatedHero) => {
          // Actualiza la lista de héroes
          this.heroService.getHeroes().subscribe((heroes) => {
            this.heroes = heroes;
            this.applyFilter();
          });
        });
      }
    });
  }

  deleteHero(hero: Hero): void {
    const dialogRef = this.dialog.open(HeroDeleteDialogComponent, {
      width: '400px',
      data: { hero },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.heroService.deleteHero(hero.id).subscribe((success) => {
          if (success) {
            // Actualiza la lista de héroes
            this.heroService.getHeroes().subscribe((heroes) => {
              this.heroes = heroes;
              this.applyFilter();
            });
          }
        });
      }
    });
  }

  viewHeroDetail(heroId: number): void {
    this.router.navigate(['/heroes', heroId]);
  }
}
