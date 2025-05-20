import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Hero } from '../models/hero.model';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  // Mock data for heroes
  private heroes: Hero[] = [
    {
      id: 1,
      name: 'Superman',
      alterEgo: 'Clark Kent',
      powers: ['Flight', 'Super strength', 'X-ray vision'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1938, 3, 18),
      description: 'The Man of Steel from Krypton',
      imageUrl: 'assets/images/superman.jpg',
    },
    {
      id: 2,
      name: 'Spider-Man',
      alterEgo: 'Peter Parker',
      powers: ['Wall-crawling', 'Spider-sense', 'Super strength'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1962, 7, 10),
      description: 'Friendly neighborhood superhero',
      imageUrl: 'assets/images/spiderman.jpg',
    },
    {
      id: 3,
      name: 'Wonder Woman',
      alterEgo: 'Diana Prince',
      powers: ['Super strength', 'Flight', 'Combat skills'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1941, 9, 21),
      description: 'Amazon warrior princess',
      imageUrl: 'assets/images/wonderwoman.jpg',
    },
  ];

  // BehaviorSubject to store and emit heroes
  private heroesSubject = new BehaviorSubject<Hero[]>(this.heroes);

  constructor() {}

  // Get all heroes
  getHeroes(): Observable<Hero[]> {
    return this.heroesSubject.asObservable();
  }

  // Get a single hero by id
  getHeroById(id: number): Observable<Hero | undefined> {
    return this.heroesSubject.pipe(
      map((heroes) => heroes.find((hero) => hero.id === id))
    );
  }

  // Find heroes by name (case insensitive)
  findHeroesByName(term: string): Observable<Hero[]> {
    const lowerCaseTerm = term.toLowerCase();
    return this.heroesSubject.pipe(
      map((heroes) =>
        heroes.filter((hero) => hero.name.toLowerCase().includes(lowerCaseTerm))
      )
    );
  }

  // Add a new hero
  addHero(hero: Omit<Hero, 'id'>): Observable<Hero> {
    // Generate a new ID
    const maxId = this.heroes.reduce((max, h) => (h.id > max ? h.id : max), 0);
    const newHero: Hero = { ...hero, id: maxId + 1 };

    // Update the heroes array
    this.heroes = [...this.heroes, newHero];
    this.heroesSubject.next(this.heroes);

    return of(newHero);
  }

  // Update an existing hero
  updateHero(updatedHero: Hero): Observable<Hero> {
    // Find and update the hero
    this.heroes = this.heroes.map((hero) =>
      hero.id === updatedHero.id ? updatedHero : hero
    );

    this.heroesSubject.next(this.heroes);
    return of(updatedHero);
  }

  // Delete a hero
  deleteHero(id: number): Observable<boolean> {
    const initialLength = this.heroes.length;
    this.heroes = this.heroes.filter((hero) => hero.id !== id);

    // Check if a hero was actually deleted
    const success = initialLength > this.heroes.length;
    this.heroesSubject.next(this.heroes);

    return of(success);
  }
}
