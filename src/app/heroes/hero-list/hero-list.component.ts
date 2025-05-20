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
import { Subscription, debounceTime, distinctUntilChanged } from 'rxjs';
import { HeroService } from '../../core/services/hero.service';
import { Hero } from '../../core/models/hero.model';

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
  ],
  templateUrl: './hero-list.component.html',
  styleUrls: ['./hero-list.component.scss'],
})
export class HeroListComponent implements OnInit, OnDestroy {
  heroes: Hero[] = [];
  filteredHeroes: Hero[] = [];
  displayedHeroes: Hero[] = [];

  searchControl = new FormControl('');
  private searchSubscription!: Subscription;

  // Pagination
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10, 25];
  pageIndex = 0;

  // Table columns (mantenemos esto por si queremos volver a la vista de tabla)
  displayedColumns: string[] = [
    'id',
    'name',
    'alterEgo',
    'publisher',
    'actions',
  ];

  constructor(private heroService: HeroService, private dialog: MatDialog) {}

  ngOnInit(): void {
    // Get all heroes
    this.heroService.getHeroes().subscribe((heroes) => {
      this.heroes = heroes;
      this.applyFilter();
    });

    // Subscribe to search field changes
    this.searchSubscription = this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.pageIndex = 0;
        this.applyFilter();
      });
  }

  ngOnDestroy(): void {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  applyFilter(): void {
    const filterValue = this.searchControl.value?.toLowerCase() || '';

    if (filterValue) {
      this.filteredHeroes = this.heroes.filter((hero) =>
        hero.name.toLowerCase().includes(filterValue)
      );
    } else {
      this.filteredHeroes = [...this.heroes];
    }

    this.updateDisplayedHeroes();
  }

  updateDisplayedHeroes(): void {
    const startIndex = this.pageIndex * this.pageSize;
    this.displayedHeroes = this.filteredHeroes.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.updateDisplayedHeroes();
  }

  addHero(): void {
    // We'll implement this in the next phase
    console.log('Add hero clicked');
  }

  editHero(hero: Hero): void {
    // We'll implement this in the next phase
    console.log('Edit hero clicked', hero);
  }

  deleteHero(hero: Hero): void {
    // We'll implement this in the next phase
    console.log('Delete hero clicked', hero);
  }

  handleImageError(event: any): void {
    event.target.src = 'assets/placeholder.jpg';
  }
}
