import { TestBed } from '@angular/core/testing';
import { HeroService } from './hero.service';
import { Hero } from '../models/hero.model';

describe('HeroService', () => {
  let service: HeroService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeroService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all heroes', (done) => {
    service.getHeroes().subscribe((heroes) => {
      expect(heroes.length).toBeGreaterThan(0);
      done();
    });
  });

  it('should find a hero by id', (done) => {
    service.getHeroById(1).subscribe((hero) => {
      expect(hero).toBeTruthy();
      expect(hero?.id).toBe(1);
      done();
    });
  });

  it('should return undefined for non-existent hero id', (done) => {
    service.getHeroById(999).subscribe((hero) => {
      expect(hero).toBeUndefined();
      done();
    });
  });

  it('should find heroes by name', (done) => {
    service.findHeroesByName('man').subscribe((heroes) => {
      expect(heroes.length).toBeGreaterThan(0);
      heroes.forEach((hero) => {
        expect(hero.name.toLowerCase()).toContain('man');
      });
      done();
    });
  });

  it('should add a new hero', (done) => {
    const newHero: Omit<Hero, 'id'> = {
      name: 'Test Hero',
      powers: ['Testing'],
      alterEgo: 'Test Alter Ego',
      description: 'Test Description',
    };

    service.addHero(newHero).subscribe((hero) => {
      expect(hero.id).toBeTruthy();
      expect(hero.name).toBe('Test Hero');

      // Verify the hero was added to the list
      service.getHeroes().subscribe((heroes) => {
        const found = heroes.find((h) => h.name === 'Test Hero');
        expect(found).toBeTruthy();
        done();
      });
    });
  });

  it('should update an existing hero', (done) => {
    // First get a hero to update
    service.getHeroById(1).subscribe((hero) => {
      if (hero) {
        const updatedHero: Hero = {
          ...hero,
          name: 'Updated Hero Name',
        };

        service.updateHero(updatedHero).subscribe((result) => {
          expect(result.name).toBe('Updated Hero Name');

          // Verify the hero was updated in the list
          service.getHeroById(1).subscribe((updatedResult) => {
            expect(updatedResult?.name).toBe('Updated Hero Name');
            done();
          });
        });
      } else {
        fail('Hero with id 1 not found');
      }
    });
  });

  it('should delete a hero', (done) => {
    // First get the initial count
    service.getHeroes().subscribe((initialHeroes) => {
      const initialCount = initialHeroes.length;

      service.deleteHero(1).subscribe((success) => {
        expect(success).toBeTrue();

        // Verify the hero was removed from the list
        service.getHeroes().subscribe((updatedHeroes) => {
          expect(updatedHeroes.length).toBe(initialCount - 1);
          const deletedHero = updatedHeroes.find((h) => h.id === 1);
          expect(deletedHero).toBeUndefined();
          done();
        });
      });
    });
  });
});
