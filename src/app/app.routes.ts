import { Routes } from '@angular/router';
import { HeroListComponent } from './heroes/hero-list/hero-list.component';
import { HeroDetailComponent } from './heroes/hero-detail/hero-detail.component';
import { HeroFormComponent } from './heroes/hero-form/hero-form.component';

export const routes: Routes = [
  { path: '', redirectTo: 'heroes', pathMatch: 'full' },
  { path: 'heroes', component: HeroListComponent },
  { path: 'heroes/:id', component: HeroDetailComponent },
  { path: 'heroes/new', component: HeroFormComponent },
  { path: 'heroes/:id/edit', component: HeroFormComponent },
];
