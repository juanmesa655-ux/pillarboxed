import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import { Usuario } from '../models/usuario';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private _http = inject(HttpClient);
  private apiBase = environment.urlApiBase + 'usuario';

  // Vector precargado para simulación
  private mockUsuarios: Usuario[] = [
    { id: 1, nombre: 'Juan Pérez', fechaRegistro: new Date('2024-01-10') },
    { id: 2, nombre: 'María García', fechaRegistro: new Date('2024-02-15') },
    { id: 3, nombre: 'Carlos Rodríguez', fechaRegistro: new Date('2024-03-20') },
    { id: 4, nombre: 'Ana Martínez', fechaRegistro: new Date('2024-04-05') }
  ];

   getUsuarios(): Observable<Usuario[]> {
     //Simulamos la respuesta de la API usando el vector precargado y un pequeño delay
     return of(this.mockUsuarios).pipe(
       delay(1000) // Simula latencia de red
     );
   }

   /* getUsuarios(): Observable<Usuario[]> {
      console.log(this.apiBase);
    return this._http.get<Usuario[]>(this.apiBase + '/');
  }*/
}
