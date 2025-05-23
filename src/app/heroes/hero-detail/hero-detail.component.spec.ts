import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { HeroDetailComponent } from './hero-detail.component';
import { HeroService } from '../../core/services/hero.service';
import { Hero } from '../../core/models/hero.model';

describe('HeroDetailComponent', () => {
  let component: HeroDetailComponent;
  let fixture: ComponentFixture<HeroDetailComponent>;
  let heroService: jasmine.SpyObj<HeroService>;
  let router: jasmine.SpyObj<Router>;
  let activatedRouteMock: any;
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

    const heroServiceSpy = jasmine.createSpyObj('HeroService', [
      'getHeroById',
      'updateHero',
      'deleteHero',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    activatedRouteMock = {
      paramMap: of({
        get: jasmine.createSpy('get').and.returnValue('1'),
      }),
    };

    await TestBed.configureTestingModule({
      imports: [HeroDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: HeroService, useValue: heroServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroDetailComponent);
    component = fixture.componentInstance;
    heroService = TestBed.inject(HeroService) as jasmine.SpyObj<HeroService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    activatedRouteMock = TestBed.inject(ActivatedRoute);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load hero on init when hero exists', fakeAsync(() => {
      heroService.getHeroById.and.returnValue(of(mockHero));

      component.ngOnInit();
      tick(800);

      expect(heroService.getHeroById).toHaveBeenCalledWith(1);
      expect(component.hero()).toEqual(mockHero);
      expect(router.navigate).not.toHaveBeenCalled();
    }));

    it('should navigate to heroes list when hero not found', fakeAsync(() => {
      heroService.getHeroById.and.returnValue(of(undefined));

      component.ngOnInit();
      tick(800);

      expect(heroService.getHeroById).toHaveBeenCalledWith(1);
      expect(component.hero()).toBeUndefined();
      expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
    }));

    it('should handle invalid id parameter', fakeAsync(() => {
      activatedRouteMock.paramMap = of({
        get: jasmine.createSpy('get').and.returnValue('invalid'),
      });
      heroService.getHeroById.and.returnValue(of(undefined));

      component.ngOnInit();
      tick(800);

      expect(heroService.getHeroById).toHaveBeenCalledWith(NaN);
    }));

    it('should handle null id parameter', fakeAsync(() => {
      activatedRouteMock.paramMap = of({
        get: jasmine.createSpy('get').and.returnValue(null),
      });
      heroService.getHeroById.and.returnValue(of(undefined));

      component.ngOnInit();
      tick(800);

      expect(heroService.getHeroById).toHaveBeenCalledWith(0);
    }));
  });

  describe('Computed properties', () => {
    beforeEach(() => {
      component.hero.set(mockHero);
    });

    it('should compute heroExists correctly', () => {
      expect(component.heroExists()).toBe(true);

      component.hero.set(undefined);
      expect(component.heroExists()).toBe(false);
    });

    it('should compute heroPublisher correctly', () => {
      expect(component.heroPublisher()).toBe('DC Comics');

      component.hero.set(undefined);
      expect(component.heroPublisher()).toBe('');
    });

    it('should compute heroPowers correctly', () => {
      expect(component.heroPowers()).toEqual([
        'Vuelo',
        'Super fuerza',
        'Visión de rayos X',
      ]);

      component.hero.set(undefined);
      expect(component.heroPowers()).toEqual([]);
    });

    it('should compute heroColor for DC Comics', () => {
      expect(component.heroColor()).toBe('#0476F2');
    });

    it('should compute heroColor for Marvel Comics', () => {
      const marvelHero = { ...mockHero, publisher: 'Marvel Comics' };
      component.hero.set(marvelHero);
      expect(component.heroColor()).toBe('#EC1D24');
    });

    it('should compute heroColor for unknown publisher', () => {
      const unknownHero = { ...mockHero, publisher: 'Other Comics' };
      component.hero.set(unknownHero);
      const color = component.heroColor();
      expect(color).toMatch(/^hsl\(\d+, 70%, 60%\)$/);
    });

    it('should compute heroColor when no hero', () => {
      component.hero.set(undefined);
      expect(component.heroColor()).toBe('#777777');
    });

    it('should generate consistent color for same hero name', () => {
      const hero1 = { ...mockHero, name: 'TestHero', publisher: 'Other' };
      const hero2 = { ...mockHero, name: 'TestHero', publisher: 'Different' };

      component.hero.set(hero1);
      const color1 = component.heroColor();

      component.hero.set(hero2);
      const color2 = component.heroColor();

      expect(color1).toBe(color2);
    });
  });

  describe('goBack', () => {
    it('should navigate to heroes list', () => {
      component.goBack();
      expect(router.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });

  describe('editHero', () => {
    it('should not open dialog when no hero', () => {
      component.hero.set(undefined);

      spyOn(component['dialog'], 'open');
      component.editHero();

      expect(component['dialog'].open).not.toHaveBeenCalled();
    });

    it('should check if hero exists before editing', () => {
      component.hero.set(undefined);

      spyOn(component, 'editHero').and.callThrough();
      component.editHero();

      expect(component.hero()).toBeUndefined();
    });
  });

  describe('deleteHero', () => {
    it('should not open dialog when no hero', () => {
      component.hero.set(undefined);

      spyOn(component['dialog'], 'open');
      component.deleteHero();

      expect(component['dialog'].open).not.toHaveBeenCalled();
    });

    it('should check if hero exists before deleting', () => {
      component.hero.set(undefined);

      spyOn(component, 'deleteHero').and.callThrough();
      component.deleteHero();

      expect(component.hero()).toBeUndefined();
    });
  });

  describe('getHeroColor private method', () => {
    it('should return correct color for DC Comics', () => {
      const dcHero = { ...mockHero, publisher: 'DC Comics' };
      const color = (component as any).getHeroColor(dcHero);
      expect(color).toBe('#0476F2');
    });

    it('should return correct color for Marvel Comics', () => {
      const marvelHero = { ...mockHero, publisher: 'Marvel Comics' };
      const color = (component as any).getHeroColor(marvelHero);
      expect(color).toBe('#EC1D24');
    });

    it('should return default color when no hero', () => {
      const color = (component as any).getHeroColor(undefined);
      expect(color).toBe('#777777');
    });

    it('should generate HSL color for unknown publisher', () => {
      const unknownHero = {
        ...mockHero,
        publisher: 'Unknown Comics',
        name: 'TestHero',
      };
      const color = (component as any).getHeroColor(unknownHero);
      expect(color).toMatch(/^hsl\(\d+, 70%, 60%\)$/);
    });

    it('should generate different colors for different names', () => {
      const hero1 = { ...mockHero, name: 'Hero1', publisher: 'Other' };
      const hero2 = { ...mockHero, name: 'Hero2', publisher: 'Other' };

      const color1 = (component as any).getHeroColor(hero1);
      const color2 = (component as any).getHeroColor(hero2);

      expect(color1).not.toBe(color2);
    });

    it('should handle empty string name', () => {
      const heroWithEmptyName = { ...mockHero, name: '', publisher: 'Other' };
      const color = (component as any).getHeroColor(heroWithEmptyName);
      expect(color).toMatch(/^hsl\(\d+, 70%, 60%\)$/);
    });
  });

  describe('Hero signal reactivity', () => {
    it('should update all computed properties when hero changes', () => {
      expect(component.heroExists()).toBe(false);
      expect(component.heroPublisher()).toBe('');
      expect(component.heroPowers()).toEqual([]);

      component.hero.set(mockHero);

      expect(component.heroExists()).toBe(true);
      expect(component.heroPublisher()).toBe('DC Comics');
      expect(component.heroPowers()).toEqual([
        'Vuelo',
        'Super fuerza',
        'Visión de rayos X',
      ]);

      const marvelHero = {
        ...mockHero,
        publisher: 'Marvel Comics',
        powers: ['Flying'],
      };
      component.hero.set(marvelHero);

      expect(component.heroPublisher()).toBe('Marvel Comics');
      expect(component.heroPowers()).toEqual(['Flying']);
    });

    it('should maintain computed property consistency', () => {
      component.hero.set(mockHero);

      const publisher1 = component.heroPublisher();
      const powers1 = component.heroPowers();
      const exists1 = component.heroExists();

      const publisher2 = component.heroPublisher();
      const powers2 = component.heroPowers();
      const exists2 = component.heroExists();

      expect(publisher1).toBe(publisher2);
      expect(powers1).toEqual(powers2);
      expect(exists1).toBe(exists2);
    });
  });

  describe('Component initialization', () => {
    it('should start with undefined hero', () => {
      const newComponent = new HeroDetailComponent(
        activatedRouteMock,
        router,
        heroService,
        null as any
      );

      expect(newComponent.hero()).toBeUndefined();
      expect(newComponent.heroExists()).toBe(false);
    });

    it('should handle route parameter changes', fakeAsync(() => {
      heroService.getHeroById.and.returnValue(of(mockHero));

      activatedRouteMock.paramMap = of({
        get: jasmine.createSpy('get').and.returnValue('2'),
      });

      component.ngOnInit();
      tick(800);

      expect(heroService.getHeroById).toHaveBeenCalledWith(2);
    }));
  });
});
