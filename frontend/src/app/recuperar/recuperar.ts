import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { USUARIOS_MOCK } from '../data/usuarios-mock';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recuperar',
  templateUrl: './recuperar.html',
  styleUrl: './recuperar.css',
  standalone: false
})
export class Recuperar {
  private router = inject(Router);

  email = '';
  frames = Array(14);

  seatRows = [
    { bottom: 0,  seats: this.generateSeats(26, 'seat-r1') },
    { bottom: 30, seats: this.generateSeats(24, 'seat-r2') },
    { bottom: 58, seats: this.generateSeats(22, 'seat-r3') },
    { bottom: 84, seats: this.generateSeats(20, 'seat-r4') },
  ];

  generateSeats(count: number, cls: string): string[] {
    return Array(count).fill(null).map(() =>
      Math.random() < 0.3 ? 'seat seat-occupied' : `seat ${cls}`
    );
  }

  onEnviar() {
    if (!this.email) {
      Swal.fire({ title: 'Ingresa tu correo', icon: 'warning' });
      return;
    }

    if (!this.email.endsWith('@pascualbravo.edu.co')) {
      Swal.fire({
        title: 'Correo inválido',
        text: 'Debes usar tu correo institucional @pascualbravo.edu.co',
        icon: 'error'
      });
      return;
    }

    const existe = USUARIOS_MOCK.find(u => u.email === this.email);

    if (!existe) {
      Swal.fire({
        title: 'Correo no encontrado',
        text: 'No existe una cuenta asociada a este correo.',
        icon: 'error'
      });
      return;
    }

    Swal.fire({
      title: '¡Correo enviado!',
      html: `Hemos enviado un enlace de restablecimiento a <br><strong>${this.email}</strong><br><br>Revisa tu bandeja de entrada.`,
      icon: 'success',
      confirmButtonText: 'Entendido'
    }).then(() => {
      this.router.navigate(['/login']);
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}