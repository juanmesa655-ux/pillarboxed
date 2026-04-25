import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { Register } from './register/register';
import { Recuperar } from './recuperar/recuperar';
import { authGuard } from './guards/auth-guard';
import { noAuthGuard } from './guards/no-auth-guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./movies/movies-module').then(m => m.MoviesModule),
    canActivate: [authGuard]
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [noAuthGuard]
  },
  {
    path: 'register',
    component: Register,
    canActivate: [noAuthGuard]
  },
  {
    path: 'recuperar',
    component: Recuperar,
    canActivate: [noAuthGuard]
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }