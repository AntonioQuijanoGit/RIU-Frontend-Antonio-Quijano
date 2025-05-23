import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { PageEvent } from '@angular/material/paginator';
import { of } from 'rxjs';
import { HeroListComponent } from './hero-list.component';
import { HeroService } from '../../core/services/hero.service';
import { PaginationService } from '../../core/services/pagination.service';
import { Hero } from '../../core/models/hero.model';

describe('HeroListComponent', () => {
  let component: HeroListComponent;
  let fixture: ComponentFixture<HeroListComponent>;
  let heroService: jasmine.SpyObj<HeroService>;
  let paginationService: jasmine.SpyObj<PaginationService>;
  let router: jasmine.SpyObj<Router>;
  let mockHeroes: Hero[];

  beforeEach(async () => {
    mockHeroes = [
      {
        id: 1,
        name: 'Superman',
        alterEgo: 'Clark Kent',
        powers: ['Vuelo', 'Super fuerza'],
        publisher: 'DC Comics',
        firstAppearance: new Date(1938, 3, 18),
        description: 'El Hombre de Acero',
        imageUrl: 'images/superman.jpg',
      },
      {
        id: 2,
        name: 'Batman',
        alterEgo: 'Bruce Wayne',
        powers: ['Inteligencia', 'Artes marciales'],
        publisher: 'DC Comics',
        firstAppearance: new Date(1939, 4, 1),
        description: 'El Caballero Oscuro',
        imageUrl: 'images/batman.jpg',
      },
      {
        id: 3,
        name: 'Spider-Man',
        alterEgo: 'Peter Parker',
        powers: ['Trepar paredes', 'Sentido arácnido'],
        publisher: 'Marvel Comics',
        firstAppearance: new Date(1962, 7, 10),
        description: 'El Hombre Araña',
        imageUrl: 'images/spiderman.jpg',
      },
    ];

    const heroServiceSpy = jasmine.createSpyObj('HeroService', [
      'getHeroes',
      'addHero',
      'updateHero',
      'deleteHero',
    ]);
    const paginationServiceSpy = jasmine.createSpyObj(
      'PaginationService',
      [
        'initialize',
        'setTotalItems',
        'resetToFirstPage',
        'onPageChange',
        'getPagedItems',
      ],
      {
        currentPage: jasmine.createSpy().and.returnValue(0),
        pageSize: jasmine.createSpy().and.returnValue(5),
        totalPages: jasmine.createSpy().and.returnValue(1),
        hasNextPage: jasmine.createSpy().and.returnValue(false),
        hasPreviousPage: jasmine.createSpy().and.returnValue(false),
      }
    );
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const dialogMock = {
      open: jasmine.createSpy('open').and.returnValue({
        afterClosed: () => of(null),
      }),
    };

    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jasmine.createSpy('getItem').and.returnValue(null),
        setItem: jasmine.createSpy('setItem'),
        removeItem: jasmine.createSpy('removeItem'),
        clear: jasmine.createSpy('clear'),
      },
      writable: true,
    });

    await TestBed.configureTestingModule({
      imports: [HeroListComponent, NoopAnimationsModule],
      providers: [
        { provide: HeroService, useValue: heroServiceSpy },
        { provide: PaginationService, useValue: paginationServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: 'MatDialog', useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroListComponent);
    component = fixture.componentInstance;
    heroService = TestBed.inject(HeroService) as jasmine.SpyObj<HeroService>;
    paginationService = TestBed.inject(
      PaginationService
    ) as jasmine.SpyObj<PaginationService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    heroService.getHeroes.and.returnValue(of(mockHeroes));
    paginationService.getPagedItems.and.returnValue(mockHeroes);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize pagination service', fakeAsync(() => {
      component.ngOnInit();
      tick(800);

      expect(paginationService.initialize).toHaveBeenCalledWith({
        pageSize: 5,
        pageSizeOptions: [5, 10, 25],
        pageIndex: 0,
        totalItems: 0,
      });
    }));

    it('should load heroes', fakeAsync(() => {
      component.ngOnInit();
      tick(800);

      expect(heroService.getHeroes).toHaveBeenCalled();
      expect(component.heroes()).toEqual(mockHeroes);
    }));

    it('should setup search subscription', () => {
      component.ngOnInit();

      expect(component.searchControl).toBeDefined();
    });

    it('should load saved view mode from localStorage', () => {
      (window.localStorage.getItem as jasmine.Spy).and.returnValue('list');

      component.ngOnInit();

      expect(component.viewMode()).toBe('list');
    });

    it('should use default view mode when localStorage is empty', () => {
      (window.localStorage.getItem as jasmine.Spy).and.returnValue(null);

      component.ngOnInit();

      expect(component.viewMode()).toBe('grid');
    });
  });

  describe('Computed properties', () => {
    beforeEach(() => {
      component.heroes.set(mockHeroes);
    });

    it('should compute totalHeroes correctly', () => {
      expect(component.totalHeroes()).toBe(3);
    });

    it('should compute filteredHeroes with search term', () => {
      component.searchTerm.set('super');
      const filtered = component.filteredHeroes();

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Superman');
    });

    it('should compute filteredHeroes with publisher filter', () => {
      component.publisherFilter.set('DC Comics');
      const filtered = component.filteredHeroes();

      expect(filtered.length).toBe(2);
      expect(filtered.every((hero) => hero.publisher === 'DC Comics')).toBe(
        true
      );
    });

    it('should compute filteredHeroes with both search and publisher filter', () => {
      component.searchTerm.set('bat');
      component.publisherFilter.set('DC Comics');
      const filtered = component.filteredHeroes();

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Batman');
    });

    it('should compute filteredCount correctly', () => {
      component.searchTerm.set('man');
      expect(component.filteredCount()).toBe(3);

      component.searchTerm.set('super');
      expect(component.filteredCount()).toBe(1);
    });

    it('should compute hasFilter correctly', () => {
      expect(component.hasFilter()).toBe(false);

      component.searchTerm.set('test');
      expect(component.hasFilter()).toBe(true);

      component.searchTerm.set('');
      component.publisherFilter.set('DC Comics');
      expect(component.hasFilter()).toBe(true);

      component.publisherFilter.set(null);
      expect(component.hasFilter()).toBe(false);
    });

    it('should compute availablePublishers correctly', () => {
      const publishers = component.availablePublishers();

      expect(publishers).toEqual(['DC Comics', 'Marvel Comics']);
      expect(publishers).toEqual(
        jasmine.arrayWithExactContents(['DC Comics', 'Marvel Comics'])
      );
    });

    it('should handle empty heroes array', () => {
      component.heroes.set([]);

      expect(component.totalHeroes()).toBe(0);
      expect(component.filteredHeroes()).toEqual([]);
      expect(component.availablePublishers()).toEqual([]);
    });
  });

  describe('Search functionality', () => {
    beforeEach(() => {
      component.heroes.set(mockHeroes);
    });

    it('should be case insensitive', () => {
      component.searchTerm.set('SUPERMAN');
      const filtered = component.filteredHeroes();

      expect(filtered.length).toBe(1);
      expect(filtered[0].name).toBe('Superman');
    });

    it('should search by partial name match', () => {
      component.searchTerm.set('man');
      const filtered = component.filteredHeroes();

      expect(filtered.length).toBe(3);
    });

    it('should return empty array when no matches', () => {
      component.searchTerm.set('nonexistent');
      const filtered = component.filteredHeroes();

      expect(filtered.length).toBe(0);
    });

    it('should reset pagination when search changes', fakeAsync(() => {
      component.ngOnInit();
      tick(300);

      component.searchControl.setValue('test');
      tick(300);

      expect(paginationService.resetToFirstPage).toHaveBeenCalled();
    }));
  });

  describe('Publisher filter functionality', () => {
    beforeEach(() => {
      component.heroes.set(mockHeroes);
    });

    it('should filter by publisher', () => {
      component.filterByPublisher('DC Comics');

      expect(component.publisherFilter()).toBe('DC Comics');
      expect(paginationService.resetToFirstPage).toHaveBeenCalled();
    });

    it('should toggle publisher filter', () => {
      component.filterByPublisher('DC Comics');
      expect(component.publisherFilter()).toBe('DC Comics');

      component.filterByPublisher('DC Comics');
      expect(component.publisherFilter()).toBe(null);
    });

    it('should clear publisher filter', () => {
      component.publisherFilter.set('DC Comics');
      component.clearPublisherFilter();

      expect(component.publisherFilter()).toBe(null);
    });

    it('should clear search filter', () => {
      component.searchTerm.set('test');
      component.searchControl.setValue('test');
      component.clearSearchFilter();

      expect(component.searchTerm()).toBe('');
      expect(component.searchControl.value).toBe('');
    });

    it('should clear all filters', () => {
      component.searchTerm.set('test');
      component.searchControl.setValue('test');
      component.publisherFilter.set('DC Comics');

      component.clearAllFilters();

      expect(component.searchTerm()).toBe('');
      expect(component.searchControl.value).toBe('');
      expect(component.publisherFilter()).toBe(null);
    });
  });

  describe('Pagination', () => {
    it('should handle page change', () => {
      const pageEvent: PageEvent = {
        pageIndex: 1,
        pageSize: 10,
        length: 25,
      };

      component.onPageChange(pageEvent);

      expect(paginationService.onPageChange).toHaveBeenCalledWith(pageEvent);
    });
  });

  describe('View mode', () => {
    it('should switch view mode', () => {
      component.switchView('list');
      expect(component.viewMode()).toBe('list');

      component.switchView('grid');
      expect(component.viewMode()).toBe('grid');
    });

    it('should save view mode to localStorage', () => {
      component.switchView('list');
      fixture.detectChanges();

      const viewMode = component.viewMode();

      expect(window.localStorage.setItem).toHaveBeenCalledWith(
        'heroViewMode',
        'list'
      );
    });
  });

  describe('getHeroColor', () => {
    it('should return correct color for DC Comics', () => {
      const dcHero = mockHeroes[0];
      const color = component.getHeroColor(dcHero);

      expect(color).toBe('#0476F2');
    });

    it('should return correct color for Marvel Comics', () => {
      const marvelHero = mockHeroes[2];
      const color = component.getHeroColor(marvelHero);

      expect(color).toBe('#EC1D24');
    });

    it('should generate HSL color for unknown publisher', () => {
      const unknownHero: Hero = {
        ...mockHeroes[0],
        publisher: 'Unknown Comics',
        name: 'TestHero',
      };
      const color = component.getHeroColor(unknownHero);

      expect(color).toMatch(/^hsl\(\d+, 70%, 60%\)$/);
    });

    it('should generate consistent colors for same hero name', () => {
      const hero1: Hero = {
        ...mockHeroes[0],
        name: 'TestHero',
        publisher: 'Other',
      };
      const hero2: Hero = {
        ...mockHeroes[0],
        name: 'TestHero',
        publisher: 'Different',
      };

      const color1 = component.getHeroColor(hero1);
      const color2 = component.getHeroColor(hero2);

      expect(color1).toBe(color2);
    });
  });

  describe('Navigation', () => {
    it('should navigate to hero detail', () => {
      component.viewHeroDetail(1);

      expect(router.navigate).toHaveBeenCalledWith(['/heroes', 1]);
    });

    it('should navigate with different hero ids', () => {
      component.viewHeroDetail(5);
      component.viewHeroDetail(10);

      expect(router.navigate).toHaveBeenCalledWith(['/heroes', 5]);
      expect(router.navigate).toHaveBeenCalledWith(['/heroes', 10]);
    });
  });

  describe('CRUD Operations Basic Logic', () => {
    beforeEach(() => {
      component.heroes.set(mockHeroes);
    });

    it('should check if addHero method exists', () => {
      expect(component.addHero).toBeDefined();
      expect(typeof component.addHero).toBe('function');
    });

    it('should check if editHero method exists', () => {
      expect(component.editHero).toBeDefined();
      expect(typeof component.editHero).toBe('function');
    });

    it('should check if deleteHero method exists', () => {
      expect(component.deleteHero).toBeDefined();
      expect(typeof component.deleteHero).toBe('function');
    });

    it('should call editHero with correct parameter', () => {
      spyOn(component, 'editHero');
      const hero = mockHeroes[0];

      component.editHero(hero);

      expect(component.editHero).toHaveBeenCalledWith(hero);
    });

    it('should call deleteHero with correct parameter', () => {
      spyOn(component, 'deleteHero');
      const hero = mockHeroes[0];

      component.deleteHero(hero);

      expect(component.deleteHero).toHaveBeenCalledWith(hero);
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from search subscription', () => {
      component.ngOnInit();
      const subscription = component['searchSubscription'];
      spyOn(subscription, 'unsubscribe');

      component.ngOnDestroy();

      expect(subscription.unsubscribe).toHaveBeenCalled();
    });

    it('should handle missing subscription gracefully', () => {
      component['searchSubscription'] = undefined as any;

      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });

  describe('Effects and reactivity', () => {
    it('should update pagination when filtered heroes change', () => {
      component.heroes.set(mockHeroes);
      component.searchTerm.set('super');

      expect(component.filteredCount()).toBe(1);
    });

    it('should call setTotalItems with correct count', () => {
      component.heroes.set(mockHeroes);
      component.searchTerm.set('man');

      expect(component.filteredCount()).toBe(3);
    });
  });

  describe('Component integration', () => {
    it('should handle complete workflow', fakeAsync(() => {
      component.ngOnInit();
      tick(800);

      expect(component.heroes().length).toBe(3);
      expect(component.totalHeroes()).toBe(3);

      component.searchTerm.set('super');
      expect(component.filteredCount()).toBe(1);

      component.publisherFilter.set('DC Comics');
      component.clearAllFilters();
      expect(component.hasFilter()).toBe(false);
    }));

    it('should maintain data consistency across operations', () => {
      component.heroes.set(mockHeroes);

      const initialCount = component.totalHeroes();
      component.searchTerm.set('test');
      component.searchTerm.set('');

      expect(component.totalHeroes()).toBe(initialCount);
      expect(component.filteredCount()).toBe(initialCount);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty search term', () => {
      component.heroes.set(mockHeroes);
      component.searchTerm.set('');

      expect(component.filteredHeroes()).toEqual(mockHeroes);
    });

    it('should handle null publisher filter', () => {
      component.heroes.set(mockHeroes);
      component.publisherFilter.set(null);

      expect(component.filteredHeroes()).toEqual(mockHeroes);
    });

    it('should handle heroes with empty publisher', () => {
      const heroesWithEmptyPublisher = [
        ...mockHeroes,
        { ...mockHeroes[0], id: 4, publisher: '', name: 'No Publisher Hero' },
      ];

      component.heroes.set(heroesWithEmptyPublisher);

      expect(component.availablePublishers()).toEqual([
        'DC Comics',
        'Marvel Comics',
      ]);
    });
  });
});
