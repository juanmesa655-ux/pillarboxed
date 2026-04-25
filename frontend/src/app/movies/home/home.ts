import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { Movie, MovieService } from '../../services/movie.service';
import { Router } from '@angular/router';
import { UtilityService } from '../../services/utility.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  movies: Movie[] = [];
  searchText = '';
  loading = true;
  sectionTitle = 'Tendencias';
  currentUsuario: any;

  private searchSubject = new Subject<string>();

  constructor(
    private movieService: MovieService,
    private util: UtilityService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUsuario = this.util.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadPopularMovies();

    this.searchSubject.pipe(
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
    ).subscribe({
      next: (movies) => {
        this.movies = movies;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error en búsqueda:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
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
    this.movieService.getPopularMovies().subscribe({
      next: (movies) => {
        this.movies = movies;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error cargando películas:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  logout(): void {
    this.util.logout();
    this.router.navigate(['/login']);
  }
}