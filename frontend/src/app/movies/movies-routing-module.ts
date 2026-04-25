import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './home/home';
import { MovieDetail } from './movie-detail/movie-detail';

const routes: Routes = [
  { path: '', component: Home },
  { path: 'pelicula/:id', component: MovieDetail },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MoviesRoutingModule {}