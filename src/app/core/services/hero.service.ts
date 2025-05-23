import { Injectable, signal, computed } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, finalize } from 'rxjs/operators';
import { Hero } from '../models/hero.model';
import { LoadingService } from './loading.service';

@Injectable({
  providedIn: 'root',
})
export class HeroService {
  private initialHeroes: Hero[] = [
    {
      id: 1,
      name: 'Superman',
      alterEgo: 'Clark Kent',
      powers: ['Vuelo', 'Super fuerza', 'Visión de rayos X'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1938, 3, 18),
      description: 'El Hombre de Acero',
      imageUrl: 'images/superman.jpg',
    },
    {
      id: 2,
      name: 'Batman',
      alterEgo: 'Bruce Wayne',
      powers: ['Inteligencia', 'Artes marciales', 'Gadgets tecnológicos'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1939, 4, 1),
      description: 'El Caballero Oscuro',
      imageUrl: 'images/batman.jpg',
    },
    {
      id: 3,
      name: 'Spider-Man',
      alterEgo: 'Peter Parker',
      powers: ['Trepar paredes', 'Sentido arácnido', 'Fuerza proporcional'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1962, 7, 10),
      description: 'El Hombre Araña',
      imageUrl: 'images/spiderman.jpg',
    },
    {
      id: 4,
      name: 'Wonder Woman',
      alterEgo: 'Diana Prince',
      powers: ['Super fuerza', 'Vuelo', 'Lazo de la verdad'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1941, 9, 21),
      description: 'La Mujer Maravilla',
      imageUrl: 'images/wonderwoman.jpg',
    },
    {
      id: 5,
      name: 'Iron Man',
      alterEgo: 'Tony Stark',
      powers: ['Armadura tecnológica', 'Vuelo', 'Rayos repulsores'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1963, 2, 1),
      description: 'El Hombre de Hierro',
      imageUrl: 'images/ironman.jpg',
    },
    {
      id: 6,
      name: 'Hulk',
      alterEgo: 'Bruce Banner',
      powers: ['Fuerza sobrehumana', 'Invulnerabilidad', 'Regeneración'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1962, 4, 1),
      description: 'El Hombre Increíble',
      imageUrl: 'images/hulk.jpg',
    },
    {
      id: 7,
      name: 'Thor',
      alterEgo: 'Thor Odinson',
      powers: ['Control del trueno', 'Vuelo', 'Fuerza sobrehumana'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1962, 7, 1),
      description: 'El Dios del Trueno',
      imageUrl: 'images/thor.jpg',
    },
    {
      id: 8,
      name: 'Flash',
      alterEgo: 'Barry Allen',
      powers: ['Super velocidad', 'Reflejos aumentados', 'Regeneración'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1956, 9, 1),
      description: 'El Velocista Escarlata',
      imageUrl: 'images/flash.jpg',
    },
    {
      id: 9,
      name: 'Captain America',
      alterEgo: 'Steve Rogers',
      powers: ['Fuerza aumentada', 'Agilidad', 'Escudo de vibranio'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1941, 2, 1),
      description: 'El Primer Vengador',
      imageUrl: 'images/capitanamerica.jpg',
    },
    {
      id: 10,
      name: 'Wolverine',
      alterEgo: 'Logan',
      powers: ['Garras retráctiles', 'Factor curativo', 'Sentidos aumentados'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1974, 10, 1),
      description: 'El mutante inmortal',
      imageUrl: 'images/wolverine.jpg',
    },
    {
      id: 11,
      name: 'Green Lantern',
      alterEgo: 'Hal Jordan',
      powers: ['Anillo de poder', 'Creación de objetos', 'Vuelo'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1959, 9, 1),
      description: 'El Linterna Verde',
      imageUrl: 'images/greenlantern.jpg',
    },
    {
      id: 12,
      name: 'Black Widow',
      alterEgo: 'Natasha Romanoff',
      powers: ['Espionaje', 'Artes marciales', 'Armamento avanzado'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1964, 3, 1),
      description: 'La espía rusa',
      imageUrl: 'images/blackwidow.jpg',
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
      imageUrl: 'images/aquaman.jpg',
    },
    {
      id: 14,
      name: 'Hawkeye',
      alterEgo: 'Clint Barton',
      powers: ['Puntería perfecta', 'Arquería', 'Combate táctico'],
      publisher: 'Marvel Comics',
      firstAppearance: new Date(1964, 8, 1),
      description: 'El mejor arquero del mundo',
      imageUrl: 'images/hawkeye.jpg',
    },
    {
      id: 15,
      name: 'Robin',
      alterEgo: 'Dick Grayson',
      powers: ['Acrobacia', 'Artes marciales', 'Inteligencia táctica'],
      publisher: 'DC Comics',
      firstAppearance: new Date(1940, 3, 1),
      description: 'El chico maravilla',
      imageUrl: 'images/robin.jpg',
    },
  ];

  private heroes = signal<Hero[]>(this.initialHeroes);

  public heroCount = computed(() => this.heroes().length);
  public dcHeroes = computed(() =>
    this.heroes().filter((hero) => hero.publisher === 'DC Comics')
  );
  public marvelHeroes = computed(() =>
    this.heroes().filter((hero) => hero.publisher === 'Marvel Comics')
  );

  constructor(private loadingService: LoadingService) {}

  getHeroes(): Observable<Hero[]> {
    this.loadingService.show();
    return of(this.heroes()).pipe(
      delay(800),
      finalize(() => this.loadingService.hide())
    );
  }

  getHeroById(id: number): Observable<Hero | undefined> {
    this.loadingService.show();
    const hero = this.heroes().find((h) => h.id === id);
    return of(hero).pipe(
      delay(800),
      finalize(() => this.loadingService.hide())
    );
  }

  findHeroesByName(term: string): Observable<Hero[]> {
    this.loadingService.show();
    const lowerCaseTerm = term.toLowerCase();
    const filteredHeroes = this.heroes().filter((hero) =>
      hero.name.toLowerCase().includes(lowerCaseTerm)
    );

    return of(filteredHeroes).pipe(
      delay(800),
      finalize(() => this.loadingService.hide())
    );
  }

  addHero(hero: Omit<Hero, 'id'>): Observable<Hero> {
    this.loadingService.show();

    const currentHeroes = this.heroes();
    const maxId = currentHeroes.reduce(
      (max, h) => (h.id > max ? h.id : max),
      0
    );
    const newHero: Hero = { ...hero, id: maxId + 1 };

    this.heroes.update((current) => [...current, newHero]);

    return of(newHero).pipe(
      delay(1000),
      finalize(() => this.loadingService.hide())
    );
  }

  updateHero(updatedHero: Hero): Observable<Hero> {
    this.loadingService.show();

    this.heroes.update((current) =>
      current.map((hero) => (hero.id === updatedHero.id ? updatedHero : hero))
    );

    return of(updatedHero).pipe(
      delay(1000),
      finalize(() => this.loadingService.hide())
    );
  }

  deleteHero(id: number): Observable<boolean> {
    this.loadingService.show();

    const initialLength = this.heroes().length;

    this.heroes.update((current) => current.filter((hero) => hero.id !== id));

    const success = initialLength > this.heroes().length;

    return of(success).pipe(
      delay(1000),
      finalize(() => this.loadingService.hide())
    );
  }

  getHeroesSync(): Hero[] {
    return this.heroes();
  }

  getHeroByIdSync(id: number): Hero | undefined {
    return this.heroes().find((h) => h.id === id);
  }

  getTotalHeroCount(): number {
    return this.heroCount();
  }
}
