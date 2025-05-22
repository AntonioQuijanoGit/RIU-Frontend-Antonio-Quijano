import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { HeroService } from './hero.service';
import { LoadingService } from './loading.service';
import { Hero } from '../models/hero.model';

describe('HeroService', () => {
  let service: HeroService;
  let loadingServiceSpy: jasmine.SpyObj<LoadingService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('LoadingService', ['show', 'hide']);

    TestBed.configureTestingModule({
      providers: [HeroService, { provide: LoadingService, useValue: spy }],
    });

    service = TestBed.inject(HeroService);
    loadingServiceSpy = TestBed.inject(
      LoadingService
    ) as jasmine.SpyObj<LoadingService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getHeroes', () => {
    it('should return all heroes', fakeAsync(() => {
      let result: Hero[] = [];

      service
        .getHeroes()
        .pipe(take(1))
        .subscribe((heroes) => {
          result = heroes;
        });

      expect(loadingServiceSpy.show).toHaveBeenCalled();

      expect(result.length).toBe(0);

      // After delay completes
      tick(850);

      expect(result.length).toBe(15);
      expect(result[0].name).toBe('Superman');
      expect(loadingServiceSpy.hide).toHaveBeenCalled();
    }));
  });

  describe('getHeroById', () => {
    it('should return hero when id exists', fakeAsync(() => {
      let result: Hero | undefined;
      service
        .getHeroById(1)
        .pipe(take(1))
        .subscribe((hero) => {
          result = hero;
        });

      tick(850);

      expect(result).toBeDefined();
      expect(result?.name).toBe('Superman');
      expect(result?.id).toBe(1);
    }));

    it('should return undefined when id does not exist', fakeAsync(() => {
      let result: Hero | undefined;
      service
        .getHeroById(999)
        .pipe(take(1))
        .subscribe((hero) => {
          result = hero;
        });

      tick(850);

      expect(result).toBeUndefined();
    }));
  });

  describe('findHeroesByName', () => {
    it('should return heroes matching search term', fakeAsync(() => {
      let result: Hero[] = [];
      service
        .findHeroesByName('man')
        .pipe(take(1))
        .subscribe((heroes) => {
          result = heroes;
        });

      tick(850);

      expect(result.length).toBe(6); // Heroes with 'man' in name
      expect(
        result.every((hero) => hero.name.toLowerCase().includes('man'))
      ).toBe(true);
    }));

    it('should return empty array when no matches', fakeAsync(() => {
      let result: Hero[] = [];
      service
        .findHeroesByName('nonexistent')
        .pipe(take(1))
        .subscribe((heroes) => {
          result = heroes;
        });

      tick(850);

      expect(result.length).toBe(0);
    }));

    it('should be case insensitive', fakeAsync(() => {
      let result: Hero[] = [];
      service
        .findHeroesByName('BATMAN')
        .pipe(take(1))
        .subscribe((heroes) => {
          result = heroes;
        });

      tick(850);

      expect(result.length).toBe(1);
      expect(result[0].name).toBe('Batman');
    }));
  });

  describe('addHero', () => {
    it('should add new hero with auto-generated id', fakeAsync(() => {
      const newHero: Omit<Hero, 'id'> = {
        name: 'Test Hero',
        alterEgo: 'Test Alter',
        powers: ['Test Power'],
        publisher: 'Test Publisher',
        firstAppearance: new Date(),
        description: 'Test Description',
        imageUrl: 'test.jpg',
      };

      let result: Hero | undefined;
      let completed = false;

      service.addHero(newHero).subscribe({
        next: (hero) => {
          result = hero;
        },
        complete: () => {
          completed = true;
        },
      });

      expect(loadingServiceSpy.show).toHaveBeenCalled();

      tick(1100);

      expect(result?.id).toBe(16);
      expect(result?.name).toBe('Test Hero');
      expect(completed).toBe(true);
      expect(loadingServiceSpy.hide).toHaveBeenCalled();
    }));
  });

  describe('updateHero', () => {
    it('should update existing hero', fakeAsync(() => {
      const updatedHero: Hero = {
        id: 1,
        name: 'Updated Superman',
        alterEgo: 'Clark Kent',
        powers: ['Updated Powers'],
        publisher: 'DC Comics',
        firstAppearance: new Date(),
        description: 'Updated Description',
        imageUrl: 'updated.jpg',
      };

      let result: Hero | undefined;
      service.updateHero(updatedHero).subscribe((hero) => {
        result = hero;
      });

      tick(1100);

      expect(result?.name).toBe('Updated Superman');
      expect(result?.id).toBe(1);
    }));
  });

  describe('deleteHero', () => {
    it('should delete existing hero and return true', fakeAsync(() => {
      let result: boolean | undefined;
      service.deleteHero(1).subscribe((success) => {
        result = success;
      });

      tick(1100);

      expect(result).toBe(true);
    }));

    it('should return false when hero does not exist', fakeAsync(() => {
      let result: boolean | undefined;
      service.deleteHero(999).subscribe((success) => {
        result = success;
      });

      tick(1100);

      expect(result).toBe(false);
    }));
  });
});
