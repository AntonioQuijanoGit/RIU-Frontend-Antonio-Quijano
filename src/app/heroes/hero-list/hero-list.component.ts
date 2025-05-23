import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  effect,
} from '@angular/core';
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
import { PaginationService } from '../../core/services/pagination.service';
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
  heroes = signal<Hero[]>([]);
  searchTerm = signal('');
  publisherFilter = signal<string | null>(null);
  viewMode = signal<'grid' | 'list'>('grid');

  filteredHeroes = computed(() => {
    let filtered = this.heroes();

    const searchValue = this.searchTerm().toLowerCase();
    if (searchValue) {
      filtered = filtered.filter((hero) =>
        hero.name.toLowerCase().includes(searchValue)
      );
    }

    const publisher = this.publisherFilter();
    if (publisher) {
      filtered = filtered.filter((hero) => hero.publisher === publisher);
    }

    return filtered;
  });

  totalHeroes = computed(() => this.heroes().length);
  filteredCount = computed(() => this.filteredHeroes().length);
  hasFilter = computed(() => !!this.searchTerm() || !!this.publisherFilter());

  availablePublishers = computed(() => {
    const publishers = this.heroes().map((hero) => hero.publisher);
    return [...new Set(publishers)].filter(Boolean).sort();
  });

  displayedHeroes!: any;
  currentPage!: any;
  pageSize!: any;
  totalPages!: any;
  hasNextPage!: any;
  hasPreviousPage!: any;

  searchControl = new FormControl('');
  private searchSubscription!: Subscription;

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
  ) {
    effect(() => {
      const filteredCount = this.filteredHeroes().length;
      this.paginationService.setTotalItems(filteredCount);
    });

    effect(() => {
      localStorage.setItem('heroViewMode', this.viewMode());
    });
  }

  ngOnInit(): void {
    this.paginationService.initialize({
      pageSize: 5,
      pageSizeOptions: [5, 10, 25],
      pageIndex: 0,
      totalItems: 0,
    });

    this.initializeComputedSignals();

    this.heroService.getHeroes().subscribe((heroes: Hero[]) => {
      this.heroes.set(heroes);
    });

    this.searchSubscription = this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value: string | null) => {
        this.searchTerm.set(value || '');
        this.paginationService.resetToFirstPage();
      });

    const savedViewMode = localStorage.getItem('heroViewMode');
    if (savedViewMode === 'grid' || savedViewMode === 'list') {
      this.viewMode.set(savedViewMode as 'grid' | 'list');
    }
  }

  private initializeComputedSignals(): void {
    this.displayedHeroes = computed(() =>
      this.paginationService.getPagedItems(this.filteredHeroes())
    );

    this.currentPage = this.paginationService.currentPage;
    this.pageSize = this.paginationService.pageSize;
    this.totalPages = this.paginationService.totalPages;
    this.hasNextPage = this.paginationService.hasNextPage;
    this.hasPreviousPage = this.paginationService.hasPreviousPage;
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  filterByPublisher(publisher: string): void {
    if (this.publisherFilter() === publisher) {
      this.publisherFilter.set(null);
    } else {
      this.publisherFilter.set(publisher);
    }
    this.paginationService.resetToFirstPage();
  }

  clearPublisherFilter(): void {
    this.publisherFilter.set(null);
  }

  clearSearchFilter(): void {
    this.searchTerm.set('');
    this.searchControl.setValue('');
  }

  clearAllFilters(): void {
    this.publisherFilter.set(null);
    this.searchTerm.set('');
    this.searchControl.setValue('');
  }

  onPageChange(event: PageEvent): void {
    this.paginationService.onPageChange(event);
  }

  switchView(mode: 'grid' | 'list'): void {
    this.viewMode.set(mode);
  }

  getHeroColor(hero: Hero): string {
    if (hero.publisher === 'DC Comics') return '#0476F2';
    if (hero.publisher === 'Marvel Comics') return '#EC1D24';

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

    dialogRef.afterClosed().subscribe((result: Hero | null) => {
      if (result) {
        this.heroService.addHero(result).subscribe((newHero: Hero) => {
          this.heroService.getHeroes().subscribe((heroes: Hero[]) => {
            this.heroes.set(heroes);
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

    dialogRef.afterClosed().subscribe((result: Hero | null) => {
      if (result) {
        this.heroService.updateHero(result).subscribe((updatedHero: Hero) => {
          this.heroService.getHeroes().subscribe((heroes: Hero[]) => {
            this.heroes.set(heroes);
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

    dialogRef.afterClosed().subscribe((result: boolean) => {
      if (result) {
        this.heroService.deleteHero(hero.id).subscribe((success: boolean) => {
          if (success) {
            this.heroService.getHeroes().subscribe((heroes: Hero[]) => {
              this.heroes.set(heroes);
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
