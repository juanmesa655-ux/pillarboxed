import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Movie {
  id: number;
  title: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  release_date?: string;
  vote_average?: number;
  vote_count?: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
  original_language?: string;
  production_countries?: { name: string }[];
}

export interface Credits {
  cast: { name: string }[];
  crew: { name: string; job: string }[];
}

interface MovieResponse {
  results: Movie[];
}

@Injectable({ providedIn: 'root' })
export class MovieService {
  readonly imageUrl = environment.imageUrl;

  constructor(private http: HttpClient) {}

  getPopularMovies(): Observable<Movie[]> {
    return this.http
      .get<MovieResponse>(`${environment.baseUrl}/movie/popular`, { params: this.baseParams() })
      .pipe(
        map((response) => response.results ?? []),
        catchError(() => of([])),
      );
  }

  searchMovies(query: string): Observable<Movie[]> {
    const params = this.baseParams().set('query', query);
    return this.http.get<MovieResponse>(`${environment.baseUrl}/search/movie`, { params }).pipe(
      map((response) => response.results ?? []),
      catchError(() => of([])),
    );
  }

  getMovieDetail(id: string): Observable<Movie | null> {
    return this.http
      .get<Movie>(`${environment.baseUrl}/movie/${id}`, { params: this.baseParams() })
      .pipe(catchError(() => of(null)));
  }

  getSimilarMovies(id: string): Observable<Movie[]> {
    return this.http
      .get<MovieResponse>(`${environment.baseUrl}/movie/${id}/similar`, { params: this.baseParams() })
      .pipe(
        map((response) => (response.results ?? []).slice(0, 6)),
        catchError(() => of([])),
      );
  }

  getCredits(id: string): Observable<Credits | null> {
    const params = new HttpParams().set('api_key', environment.apiKey);
    return this.http
      .get<Credits>(`${environment.baseUrl}/movie/${id}/credits`, { params })
      .pipe(catchError(() => of(null)));
  }

  posterUrl(path?: string | null): string | null {
    return path ? `${environment.imageUrl}${path}` : null;
  }

  private baseParams(): HttpParams {
    return new HttpParams().set('api_key', environment.apiKey).set('language', environment.language);
  }
}
