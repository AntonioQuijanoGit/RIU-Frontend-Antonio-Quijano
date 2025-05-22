import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { HeroDetailComponent } from './hero-detail.component';
import { HeroService } from '../../core/services/hero.service';
import { Hero } from '../../core/models/hero.model';

describe('HeroDetailComponent', () => {
  let component: HeroDetailComponent;
  let fixture: ComponentFixture<HeroDetailComponent>;
  let mockHeroService: jasmine.SpyObj<HeroService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockActivatedRoute: any;

  const mockHero: Hero = {
    id: 1,
    name: 'Test Hero',
    alterEgo: 'Test Alter',
    powers: ['Test Power 1', 'Test Power 2'],
    publisher: 'DC Comics',
    firstAppearance: new Date(),
    description: 'Test description',
    imageUrl: 'test.jpg',
  };

  beforeEach(async () => {
    const heroServiceSpy = jasmine.createSpyObj('HeroService', [
      'getHeroById',
      'updateHero',
      'deleteHero',
    ]);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
    dialogRefSpy.afterClosed.and.returnValue(of(null));

    const dialogSpy = jasmine.createSpyObj('MatDialog', ['open'], {
      openDialogs: [],
      afterOpened: new Subject(),
      afterAllClosed: of(),
    });
    dialogSpy.open.and.returnValue(dialogRefSpy);

    const mockParamMap = new Map();
    mockParamMap.set('id', '1');
    mockParamMap.get = jasmine.createSpy('get').and.returnValue('1');

    mockActivatedRoute = {
      paramMap: of(mockParamMap),
    };

    await TestBed.configureTestingModule({
      imports: [HeroDetailComponent, NoopAnimationsModule],
      providers: [
        { provide: HeroService, useValue: heroServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroDetailComponent);
    component = fixture.componentInstance;
    mockHeroService = TestBed.inject(
      HeroService
    ) as jasmine.SpyObj<HeroService>;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Initialization', () => {
    it('should load hero on init', () => {
      mockHeroService.getHeroById.and.returnValue(of(mockHero));

      component.ngOnInit();

      expect(mockHeroService.getHeroById).toHaveBeenCalledWith(1);
      expect(component.hero).toEqual(mockHero);
    });

    it('should navigate to heroes list when hero not found', () => {
      mockHeroService.getHeroById.and.returnValue(of(undefined));

      component.ngOnInit();

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });

  describe('Navigation', () => {
    it('should navigate back to heroes list', () => {
      component.goBack();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/heroes']);
    });
  });

  describe('Hero operations', () => {
    beforeEach(() => {
      component.hero = mockHero;
      mockHeroService.getHeroById.and.returnValue(of(mockHero));

      fixture.detectChanges();
    });

    it('should not edit when no hero is present', () => {
      component.hero = undefined;

      component.editHero();

      expect(mockDialog.open).not.toHaveBeenCalled();
    });

    it('should not delete when no hero is present', () => {
      component.hero = undefined;

      component.deleteHero();

      expect(mockDialog.open).not.toHaveBeenCalled();
    });
  });

  describe('Color generation', () => {
    it('should return DC Comics color for DC heroes', () => {
      const dcHero = { ...mockHero, publisher: 'DC Comics' };
      const color = component.getHeroColor(dcHero);
      expect(color).toBe('#0476F2');
    });

    it('should return Marvel color for Marvel heroes', () => {
      const marvelHero = { ...mockHero, publisher: 'Marvel Comics' };
      const color = component.getHeroColor(marvelHero);
      expect(color).toBe('#EC1D24');
    });

    it('should use current hero when no hero parameter provided', () => {
      component.hero = { ...mockHero, publisher: 'DC Comics' };
      const color = component.getHeroColor();
      expect(color).toBe('#0476F2');
    });

    it('should return default color when no hero is available', () => {
      component.hero = undefined;
      const color = component.getHeroColor();
      expect(color).toBe('#777777');
    });

    it('should generate hash-based color for other publishers', () => {
      const customHero = { ...mockHero, publisher: 'Custom Comics' };
      const color = component.getHeroColor(customHero);
      expect(color).toMatch(/^hsl\(\d+, 70%, 60%\)$/);
    });
  });
});
