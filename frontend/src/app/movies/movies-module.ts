import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MoviesRoutingModule } from './movies-routing-module';
import { Home } from './home/home';
import { MovieDetail } from './movie-detail/movie-detail';
import { MovieCard } from './movie-card/movie-card';

@NgModule({
  declarations: [Home, MovieDetail, MovieCard],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MoviesRoutingModule
  ],
})
export class MoviesModule {}