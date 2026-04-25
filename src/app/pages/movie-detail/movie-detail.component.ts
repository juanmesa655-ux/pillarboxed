import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Movie, Credits, MovieService } from '../../services/movie.service';
import { MovieCardComponent } from '../../components/movie-card/movie-card.component';

@Component({
  selector: 'app-movie-detail',
  standalone: true,
  imports: [RouterLink, MovieCardComponent],
  templateUrl: './movie-detail.component.html',
})
export class MovieDetailComponent implements OnInit {
  movie: Movie | null = null;
  credits: Credits | null = null;
  similarMovies: Movie[] = [];
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private movieService: MovieService,
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigateByUrl('/');
      return;
    }

    forkJoin({
      movie: this.movieService.getMovieDetail(id),
      credits: this.movieService.getCredits(id),
      similarMovies: this.movieService.getSimilarMovies(id),
    }).subscribe(({ movie, credits, similarMovies }) => {
      this.movie = movie;
      this.credits = credits;
      this.similarMovies = similarMovies.filter((similar) => !!similar.release_date);
      this.loading = false;
    });
  }

  posterUrl(path?: string | null): string | null {
    return this.movieService.posterUrl(path);
  }

  get year(): string {
    return this.movie?.release_date?.split('-')[0] ?? 'N/A';
  }

  get duration(): string {
    if (!this.movie?.runtime) return 'N/A';
    return `${Math.floor(this.movie.runtime / 60)}h ${this.movie.runtime % 60}m`;
  }

  get rating(): string {
    return this.movie?.vote_average ? this.movie.vote_average.toFixed(1) : 'N/A';
  }

  get director(): string {
    return this.credits?.crew?.find((person) => person.job === 'Director')?.name ?? 'N/A';
  }

  get cast(): string {
    return this.credits?.cast?.slice(0, 4).map((actor) => actor.name).join(', ') || 'N/A';
  }

  get country(): string {
    return this.movie?.production_countries?.[0]?.name ?? 'N/A';
  }

  get language(): string {
    return this.movie?.original_language?.toUpperCase() ?? 'N/A';
  }

  get votes(): string {
    return this.movie?.vote_count?.toLocaleString() ?? 'N/A';
  }
}
