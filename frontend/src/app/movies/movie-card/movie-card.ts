import { Component, Input } from '@angular/core';
import { Movie, MovieService } from '../../services/movie.service';

@Component({
  selector: 'app-movie-card',
  standalone: false,
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css'
})
export class MovieCard {
  @Input({ required: true }) movie!: Movie;

  constructor(private movieService: MovieService) {}

  get year(): string {
    return this.movie.release_date?.split('-')[0] ?? 'N/A';
  }

  get rating(): string {
    return this.movie.vote_average ? this.movie.vote_average.toFixed(1) : 'N/A';
  }

  get poster(): string | null {
    return this.movieService.posterUrl(this.movie.poster_path);
  }
}