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
      powers: ['Vuelo', 'Super fuerza', 'Visión de rayos X'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1938, 3, 18),
      description: 'El Hombre de Acero',
      imageUrl: 'assets/images/superman.jpg',
    },
    {
      id: 2,
      name: 'Batman',
      alterEgo: 'Bruce Wayne',
      powers: ['Inteligencia', 'Artes marciales', 'Gadgets tecnológicos'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1939, 4, 1),
      description: 'El Caballero Oscuro',
      imageUrl: 'assets/images/batman.jpg',
    },
    {
      id: 3,
      name: 'Spider-Man',
      alterEgo: 'Peter Parker',
      powers: ['Trepar paredes', 'Sentido arácnido', 'Fuerza proporcional'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1962, 7, 10),
      description: 'El Hombre Araña',
      imageUrl: 'assets/images/spiderman.jpg',
    },
    {
      id: 4,
      name: 'Wonder Woman',
      alterEgo: 'Diana Prince',
      powers: ['Super fuerza', 'Vuelo', 'Lazo de la verdad'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1941, 9, 21),
      description: 'La Mujer Maravilla',
      imageUrl: 'assets/images/wonderwoman.jpg',
    },
    {
      id: 5,
      name: 'Iron Man',
      alterEgo: 'Tony Stark',
      powers: ['Armadura tecnológica', 'Vuelo', 'Rayos repulsores'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1963, 2, 1),
      description: 'El Hombre de Hierro',
      imageUrl: 'assets/images/ironman.jpg',
    },
    {
      id: 6,
      name: 'Hulk',
      alterEgo: 'Bruce Banner',
      powers: ['Fuerza sobrehumana', 'Invulnerabilidad', 'Regeneración'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1962, 4, 1),
      description: 'El Hombre Increíble',
      imageUrl: 'assets/images/hulk.jpg',
    },
    {
      id: 7,
      name: 'Thor',
      alterEgo: 'Thor Odinson',
      powers: ['Control del trueno', 'Vuelo', 'Fuerza sobrehumana'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1962, 7, 1),
      description: 'El Dios del Trueno',
      imageUrl: 'assets/images/thor.jpg',
    },
    {
      id: 8,
      name: 'Flash',
      alterEgo: 'Barry Allen',
      powers: ['Super velocidad', 'Reflejos aumentados', 'Regeneración'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1956, 9, 1),
      description: 'El Velocista Escarlata',
      imageUrl: 'assets/images/flash.jpg',
    },
    {
      id: 9,
      name: 'Captain America',
      alterEgo: 'Steve Rogers',
      powers: ['Fuerza aumentada', 'Agilidad', 'Escudo de vibranio'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1941, 2, 1),
      description: 'El Primer Vengador',
      imageUrl: 'assets/images/capitanamerica.jpg',
    },
    {
      id: 10,
      name: 'Wolverine',
      alterEgo: 'Logan',
      powers: ['Garras retráctiles', 'Factor curativo', 'Sentidos aumentados'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1974, 10, 1),
      description: 'El mutante inmortal',
      imageUrl: 'assets/images/wolverine.jpg',
    },
    {
      id: 11,
      name: 'Green Lantern',
      alterEgo: 'Hal Jordan',
      powers: ['Anillo de poder', 'Creación de objetos', 'Vuelo'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1959, 9, 1),
      description: 'El Linterna Verde',
      imageUrl: 'assets/images/greenlantern.jpg',
    },
    {
      id: 12,
      name: 'Black Widow',
      alterEgo: 'Natasha Romanoff',
      powers: ['Espionaje', 'Artes marciales', 'Armamento avanzado'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1964, 3, 1),
      description: 'La espía rusa',
      imageUrl: 'assets/images/blackwidow.jpg',
    },
    {
      id: 13,
      name: 'Aquaman',
      alterEgo: 'Arthur Curry',
      powers: [
        'Comunicación con animales marinos',
        'Respiración acuática',
        'Super fuerza',
      ],
      publisher: 'DC Comics',
      firstAppearance: new Date(1941, 10, 1),
      description: 'El Rey de los Mares',
      imageUrl: 'assets/images/aquaman.jpg',
    },
    {
      id: 14,
      name: 'Hawkeye',
      alterEgo: 'Clint Barton',
      powers: ['Puntería perfecta', 'Arquería', 'Combate táctico'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1964, 8, 1),
      description: 'El mejor arquero del mundo',
      imageUrl: 'assets/images/hawkeye.jpg',
    },
    {
      id: 15,
      name: 'Robin',
      alterEgo: 'Dick Grayson',
      powers: ['Acrobacia', 'Artes marciales', 'Inteligencia táctica'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1940, 3, 1),
      description: 'El chico maravilla',
      imageUrl: 'assets/images/robin.jpg',
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
