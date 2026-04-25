import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { Movie, MovieService } from '../../services/movie.service';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, MovieCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  movies: Movie[] = [];
  searchText = '';
  loading = true;
  sectionTitle = 'Tendencias';

  private searchSubject = new Subject<string>();

  constructor(private movieService: MovieService) {}

  ngOnInit(): void {
    this.loadPopularMovies();

    this.searchSubject
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((text) => {
          const query = text.trim();
          this.loading = true;
          if (!query) {
            this.sectionTitle = 'Tendencias';
            return this.movieService.getPopularMovies();
          }
          this.sectionTitle = `Resultados para "${query}"`;
          return this.movieService.searchMovies(query);
        }),
      )
      .subscribe((movies) => {
        this.movies = movies;
        this.loading = false;
      });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  clearSearch(): void {
    this.searchText = '';
    this.loadPopularMovies();
  }

  private loadPopularMovies(): void {
    this.loading = true;
    this.sectionTitle = 'Tendencias';
    this.movieService.getPopularMovies().subscribe((movies) => {
      this.movies = movies;
      this.loading = false;
    });
  }
}
