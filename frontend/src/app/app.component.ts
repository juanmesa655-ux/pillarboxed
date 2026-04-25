import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: false
})
export class AppComponent {
  constructor(private router: Router) {}

  isLoginRoute(): boolean {
    const rutasSinLayout = ['/login', '/register', '/recuperar'];
    return rutasSinLayout.includes(this.router.url);
  }
}