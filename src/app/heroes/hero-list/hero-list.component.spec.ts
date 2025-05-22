import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { HeroListComponent } from './hero-list.component';
import { HeroService } from '../../core/services/hero.service';
import { PaginationService } from '../../core/services/pagination.service';
import { Hero } from '../../core/models/hero.model';

describe('HeroListComponent', () => {
  let component: HeroListComponent;
  let fixture: ComponentFixture<HeroListComponent>;
  let mockHeroService: jasmine.SpyObj<HeroService>;
  let mockPaginationService: jasmine.SpyObj<PaginationService>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockRouter: jasmine.SpyObj<Router>;

  const mockHeroes: Hero[] = [
    {
      id: 1,
      name: 'Superman',
      alterEgo: 'Clark Kent',
      powers: ['Flight'],
      publisher: 'DC Comics',
      firstAppearance: new Date(),
      description: 'Test',
      imageUrl: 'test.jpg',
    },
    {
      id: 2,
      name: 'Batman',
      alterEgo: 'Bruce Wayne',
      powers: ['Intelligence'],
      publisher: 'DC Comics',
      firstAppearance: new Date(),
      description: 'Test',
      imageUrl: 'test.jpg',
    },
    {
      id: 3,
      name: 'Spider-Man',
      alterEgo: 'Peter Parker',
      powers: ['Web-slinging'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(),
      description: 'Test',
      imageUrl: 'test.jpg',
    },
  ];

  beforeEach(async () => {
    const heroServiceSpy = jasmine.createSpyObj('HeroService', [
      'getHeroes',
      'addHero',
      'updateHero',
      'deleteHero',
    ]);
    const paginationServiceSpy = jasmine.createSpyObj('PaginationService', [
      'initialize',
      'getState',
      'resetToFirstPage',
      'setTotalItems',
      'getPagedItems',
      'onPageChange',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    // Create dialog mock with proper structure
    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(null));

    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open'], {
      openDialogs: [],
      afterOpened: new Subject(),
      afterAllClosed: of(),
    });
    dialogSpy.open.and.returnValue(dialogRefSpy);

    await TestBed.configureTestingModule({
      imports: [HeroListComponent, NoopAnimationsModule],
      providers: [
        { provide: HeroService, useValue: heroServiceSpy },
        { provide: PaginationService, useValue: paginationServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroListComponent);
    component = fixture.componentInstance;
    mockHeroService = TestBed.inject(
      HeroService
    ) as jasmine.SpyObj<HeroService>;
    mockPaginationService = TestBed.inject(
      PaginationService
    ) as jasmine.SpyObj<PaginationService>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    mockHeroService.getHeroes.and.returnValue(of(mockHeroes));
    mockPaginationService.getState.and.returnValue(
      of({
        pageIndex: 0,
        pageSize: 5,
        pageSizeOptions: [5, 10, 25],
        totalItems: 0,
      })
    );
    mockPaginationService.getPagedItems.and.returnValue(mockHeroes);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should initialize pagination service and load heroes', () => {
      component.ngOnInit();

      expect(mockPaginationService.initialize).toHaveBeenCalledWith({
        pageSize: 5,
        pageSizeOptions: [5, 10, 25],
        pageIndex: 0,
        totalItems: 0,
      });
      expect(mockHeroService.getHeroes).toHaveBeenCalled();
    });

    it('should setup search subscription', () => {
      spyOn(component.searchControl.valueChanges, 'pipe').and.returnValue(
        of('test')
      );
      component.ngOnInit();
      expect(component.searchControl.valueChanges.pipe).toHaveBeenCalled();
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      component.heroes = mockHeroes;
    });

    it('should filter heroes by name', () => {
      component.heroes = mockHeroes;
      component.searchControl.setValue('Super');
      component.applyFilter();

      expect(component.filteredHeroes.length).toBe(1);
      expect(component.filteredHeroes[0].name).toBe('Superman');
    });

    it('should filter heroes by publisher', () => {
      component.heroes = mockHeroes;
      component.filterByPublisher('Marvel Comics');

      expect(component.filteredHeroes.length).toBe(1);
      expect(component.filteredHeroes[0].publisher).toBe('Marvel Comics');
    });

    it('should clear publisher filter when same publisher is selected twice', () => {
      component.filterByPublisher('DC Comics');
      expect(component.publisherFilter).toBe('DC Comics');

      component.filterByPublisher('DC Comics');
      expect(component.publisherFilter).toBeNull();
    });

    it('should combine name and publisher filters', () => {
      component.heroes = mockHeroes;
      component.searchControl.setValue('man');
      component.filterByPublisher('DC Comics');

      expect(component.filteredHeroes.length).toBe(2); // Superman and Batman
    });
  });

  describe('View mode', () => {
    it('should switch view mode and save to localStorage', () => {
      spyOn(localStorage, 'setItem');

      component.switchView('list');

      expect(component.viewMode).toBe('list');
      expect(localStorage.setItem).toHaveBeenCalledWith('heroViewMode', 'list');
    });

    it('should load saved view mode from localStorage', () => {
      spyOn(localStorage, 'getItem').and.returnValue('list');

      component.ngOnInit();

      expect(component.viewMode).toBe('list');
    });
  });

  describe('Hero color generation', () => {
    it('should return DC Comics color for DC heroes', () => {
      const dcHero = mockHeroes[0]; // Superman
      const color = component.getHeroColor(dcHero);
      expect(color).toBe('#0476F2');
    });

    it('should return Marvel color for Marvel heroes', () => {
      const marvelHero = mockHeroes[2]; // Spider-Man
      const color = component.getHeroColor(marvelHero);
      expect(color).toBe('#EC1D24');
    });

    it('should generate hash-based color for other publishers', () => {
      const customHero: Hero = { ...mockHeroes[0], publisher: 'Custom Comics' };
      const color = component.getHeroColor(customHero);
      expect(color).toMatch(/^hsl\(\d+, 70%, 60%\)$/);
    });
  });

  describe('Hero operations', () => {
    beforeEach(() => {
      // Initialize component
      component.heroes = mockHeroes;
      component.filteredHeroes = mockHeroes;
      component.displayedHeroes = mockHeroes;

      fixture.detectChanges();
      component.ngOnInit();
    });

    it('should navigate to hero detail', () => {
      component.viewHeroDetail(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/heroes', 1]);
    });
  });

  describe('Pagination', () => {
    it('should handle page change events', () => {
      const pageEvent = { pageIndex: 1, pageSize: 10, length: 20 };

      component.onPageChange(pageEvent);

      expect(mockPaginationService.onPageChange).toHaveBeenCalledWith(
        pageEvent
      );
    });
  });

  describe('Cleanup', () => {
    it('should unsubscribe on destroy', () => {
      component.ngOnInit();
      spyOn(component['searchSubscription'], 'unsubscribe');
      spyOn(component['paginationSubscription'], 'unsubscribe');

      component.ngOnDestroy();

      expect(component['searchSubscription'].unsubscribe).toHaveBeenCalled();
      expect(
        component['paginationSubscription'].unsubscribe
      ).toHaveBeenCalled();
    });
  });
});
