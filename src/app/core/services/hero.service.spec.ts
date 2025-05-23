import { TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { HeroService } from './hero.service';
import { LoadingService } from './loading.service';
import { Hero } from '../models/hero.model';

describe('HeroService', () => {
  let service: HeroService;
  let loadingService: jasmine.SpyObj<LoadingService>;

  beforeEach(() => {
    const loadingServiceSpy = jasmine.createSpyObj('LoadingService', [
      'show',
      'hide',
    ]);

    TestBed.configureTestingModule({
      providers: [{ provide: LoadingService, useValue: loadingServiceSpy }],
    });

    service = TestBed.inject(HeroService);
    loadingService = TestBed.inject(
      LoadingService
    ) as jasmine.SpyObj<LoadingService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Initial state', () => {
    it('should have 15 heroes initially', () => {
      expect(service.getTotalHeroCount()).toBe(15);
      expect(service.heroCount()).toBe(15);
    });

    it('should have correct DC Comics heroes count', () => {
      expect(service.dcHeroes().length).toBe(7);
    });

    it('should have correct Marvel Comics heroes count', () => {
      expect(service.marvelHeroes().length).toBe(8);
    });

    it('should filter DC heroes correctly', () => {
      const dcHeroes = service.dcHeroes();
      expect(dcHeroes.every((hero) => hero.publisher === 'DC Comics')).toBe(
        true
      );
      expect(dcHeroes.some((hero) => hero.name === 'Superman')).toBe(true);
      expect(dcHeroes.some((hero) => hero.name === 'Batman')).toBe(true);
    });

    it('should filter Marvel heroes correctly', () => {
      const marvelHeroes = service.marvelHeroes();
      expect(
        marvelHeroes.every((hero) => hero.publisher === 'Marvel Comics')
      ).toBe(true);
      expect(marvelHeroes.some((hero) => hero.name === 'Spider-Man')).toBe(
        true
      );
      expect(marvelHeroes.some((hero) => hero.name === 'Iron Man')).toBe(true);
    });
  });

  describe('getHeroes()', () => {
    it('should return all heroes after delay', fakeAsync(() => {
      let result: Hero[] = [];

      service.getHeroes().subscribe((heroes) => {
        result = heroes;
      });

      tick(800);

      expect(result.length).toBe(15);
      expect(result[0].name).toBe('Superman');
    }));

    it('should call loading service show and hide', fakeAsync(() => {
      service.getHeroes().subscribe();

      expect(loadingService.show).toHaveBeenCalled();

      tick(800);

      expect(loadingService.hide).toHaveBeenCalled();
    }));
  });

  describe('getHeroById()', () => {
    it('should return hero when id exists', fakeAsync(() => {
      let result: Hero | undefined;

      service.getHeroById(1).subscribe((hero) => {
        result = hero;
      });

      tick(800);

      expect(result).toBeDefined();
      expect(result!.name).toBe('Superman');
      expect(result!.alterEgo).toBe('Clark Kent');
    }));

    it('should return undefined when id does not exist', fakeAsync(() => {
      let result: Hero | undefined;

      service.getHeroById(999).subscribe((hero) => {
        result = hero;
      });

      tick(800);

      expect(result).toBeUndefined();
    }));

    it('should call loading service show and hide', fakeAsync(() => {
      service.getHeroById(1).subscribe();

      expect(loadingService.show).toHaveBeenCalled();

      tick(800);

      expect(loadingService.hide).toHaveBeenCalled();
    }));
  });

  describe('findHeroesByName()', () => {
    it('should find heroes by exact name match', fakeAsync(() => {
      let result: Hero[] = [];

      service.findHeroesByName('Superman').subscribe((heroes) => {
        result = heroes;
      });

      tick(800);

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Superman');
    }));

    it('should find heroes by partial name match', fakeAsync(() => {
      let result: Hero[] = [];

      service.findHeroesByName('man').subscribe((heroes) => {
        result = heroes;
      });

      tick(800);

      expect(result.length).toBeGreaterThan(1);
      expect(result.some((hero) => hero.name === 'Superman')).toBe(true);
      expect(result.some((hero) => hero.name === 'Batman')).toBe(true);
      expect(result.some((hero) => hero.name === 'Spider-Man')).toBe(true);
    }));

    it('should be case insensitive', fakeAsync(() => {
      let result: Hero[] = [];

      service.findHeroesByName('SUPERMAN').subscribe((heroes) => {
        result = heroes;
      });

      tick(800);

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Superman');
    }));

    it('should return empty array when no matches found', fakeAsync(() => {
      let result: Hero[] = [];

      service.findHeroesByName('NonExistentHero').subscribe((heroes) => {
        result = heroes;
      });

      tick(800);

      expect(result.length).toBe(0);
    }));

    it('should call loading service show and hide', fakeAsync(() => {
      service.findHeroesByName('Superman').subscribe();

      expect(loadingService.show).toHaveBeenCalled();

      tick(800);

      expect(loadingService.hide).toHaveBeenCalled();
    }));
  });

  describe('addHero()', () => {
    const newHeroData: Omit<Hero, 'id'> = {
      name: 'New Hero',
      alterEgo: 'John Doe',
      powers: ['Test Power'],
      publisher: 'Test Comics',
      firstAppearance: new Date(2024, 0, 1),
      description: 'Test Hero',
      imageUrl: 'images/test.jpg',
    };

    it('should add hero with new id', fakeAsync(() => {
      let result: Hero | undefined;

      service.addHero(newHeroData).subscribe((hero) => {
        result = hero;
      });

      tick(1000);

      expect(result!.id).toBe(16);
      expect(result!.name).toBe('New Hero');
      expect(service.getTotalHeroCount()).toBe(16);
    }));

    it('should increment hero count', fakeAsync(() => {
      const initialCount = service.getTotalHeroCount();

      service.addHero(newHeroData).subscribe();

      tick(1000);

      expect(service.getTotalHeroCount()).toBe(initialCount + 1);
    }));

    it('should update computed properties', fakeAsync(() => {
      const dcHeroData = { ...newHeroData, publisher: 'DC Comics' };
      const initialDcCount = service.dcHeroes().length;

      service.addHero(dcHeroData).subscribe();

      tick(1000);

      expect(service.dcHeroes().length).toBe(initialDcCount + 1);
    }));

    it('should call loading service show and hide', fakeAsync(() => {
      service.addHero(newHeroData).subscribe();

      expect(loadingService.show).toHaveBeenCalled();

      tick(1000);

      expect(loadingService.hide).toHaveBeenCalled();
    }));
  });

  describe('updateHero()', () => {
    it('should update existing hero', fakeAsync(() => {
      const updatedHero: Hero = {
        id: 1,
        name: 'Updated Superman',
        alterEgo: 'Clark Kent',
        powers: ['Updated Powers'],
        publisher: 'DC Comics',
        firstAppearance: new Date(1938, 3, 18),
        description: 'Updated description',
        imageUrl: 'images/superman.jpg',
      };

      let result: Hero | undefined;

      service.updateHero(updatedHero).subscribe((hero) => {
        result = hero;
      });

      tick(1000);

      expect(result!.name).toBe('Updated Superman');
      expect(result!.description).toBe('Updated description');

      const heroInService = service.getHeroByIdSync(1);
      expect(heroInService!.name).toBe('Updated Superman');
    }));

    it('should not change hero count when updating', fakeAsync(() => {
      const initialCount = service.getTotalHeroCount();
      const updatedHero: Hero = {
        id: 1,
        name: 'Updated Superman',
        alterEgo: 'Clark Kent',
        powers: ['Updated Powers'],
        publisher: 'DC Comics',
        firstAppearance: new Date(1938, 3, 18),
        description: 'Updated description',
        imageUrl: 'images/superman.jpg',
      };

      service.updateHero(updatedHero).subscribe();

      tick(1000);

      expect(service.getTotalHeroCount()).toBe(initialCount);
    }));

    it('should call loading service show and hide', fakeAsync(() => {
      const updatedHero: Hero = {
        id: 1,
        name: 'Updated Superman',
        alterEgo: 'Clark Kent',
        powers: ['Updated Powers'],
        publisher: 'DC Comics',
        firstAppearance: new Date(1938, 3, 18),
        description: 'Updated description',
        imageUrl: 'images/superman.jpg',
      };

      service.updateHero(updatedHero).subscribe();

      expect(loadingService.show).toHaveBeenCalled();

      tick(1000);

      expect(loadingService.hide).toHaveBeenCalled();
    }));
  });

  describe('deleteHero()', () => {
    it('should delete existing hero and return true', fakeAsync(() => {
      const initialCount = service.getTotalHeroCount();
      let result: boolean | undefined;

      service.deleteHero(1).subscribe((success) => {
        result = success;
      });

      tick(1000);

      expect(result).toBe(true);
      expect(service.getTotalHeroCount()).toBe(initialCount - 1);
      expect(service.getHeroByIdSync(1)).toBeUndefined();
    }));

    it('should return false when hero does not exist', fakeAsync(() => {
      const initialCount = service.getTotalHeroCount();
      let result: boolean | undefined;

      service.deleteHero(999).subscribe((success) => {
        result = success;
      });

      tick(1000);

      expect(result).toBe(false);
      expect(service.getTotalHeroCount()).toBe(initialCount);
    }));

    it('should update computed properties after deletion', fakeAsync(() => {
      const initialDcCount = service.dcHeroes().length;

      service.deleteHero(1).subscribe();

      tick(1000);

      expect(service.dcHeroes().length).toBe(initialDcCount - 1);
    }));

    it('should call loading service show and hide', fakeAsync(() => {
      service.deleteHero(1).subscribe();

      expect(loadingService.show).toHaveBeenCalled();

      tick(1000);

      expect(loadingService.hide).toHaveBeenCalled();
    }));
  });

  describe('Synchronous methods', () => {
    it('getHeroesSync should return all heroes', () => {
      const heroes = service.getHeroesSync();
      expect(heroes.length).toBe(15);
      expect(heroes[0].name).toBe('Superman');
    });

    it('getHeroByIdSync should return hero when exists', () => {
      const hero = service.getHeroByIdSync(1);
      expect(hero).toBeDefined();
      expect(hero!.name).toBe('Superman');
    });

    it('getHeroByIdSync should return undefined when not exists', () => {
      const hero = service.getHeroByIdSync(999);
      expect(hero).toBeUndefined();
    });

    it('getTotalHeroCount should return correct count', () => {
      expect(service.getTotalHeroCount()).toBe(15);
    });
  });

  describe('Computed properties reactivity', () => {
    it('should update heroCount when heroes change', fakeAsync(() => {
      const initialCount = service.heroCount();

      service
        .addHero({
          name: 'Test Hero',
          alterEgo: 'Test',
          powers: ['Test'],
          publisher: 'Test Comics',
          firstAppearance: new Date(),
          description: 'Test',
          imageUrl: 'test.jpg',
        })
        .subscribe();

      tick(1000);

      expect(service.heroCount()).toBe(initialCount + 1);
    }));

    it('should update dcHeroes when DC hero is added', fakeAsync(() => {
      const initialDcCount = service.dcHeroes().length;

      service
        .addHero({
          name: 'New DC Hero',
          alterEgo: 'Test',
          powers: ['Test'],
          publisher: 'DC Comics',
          firstAppearance: new Date(),
          description: 'Test',
          imageUrl: 'test.jpg',
        })
        .subscribe();

      tick(1000);

      expect(service.dcHeroes().length).toBe(initialDcCount + 1);
    }));

    it('should update marvelHeroes when Marvel hero is added', fakeAsync(() => {
      const initialMarvelCount = service.marvelHeroes().length;

      service
        .addHero({
          name: 'New Marvel Hero',
          alterEgo: 'Test',
          powers: ['Test'],
          publisher: 'Marvel Comics',
          firstAppearance: new Date(),
          description: 'Test',
          imageUrl: 'test.jpg',
        })
        .subscribe();

      tick(1000);

      expect(service.marvelHeroes().length).toBe(initialMarvelCount + 1);
    }));
  });
});
