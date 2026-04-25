import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from '../services/utility.service';
import { USUARIOS_MOCK } from '../data/usuarios-mock';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-register',
  templateUrl: './register.html',
  styleUrl: './register.css',
  standalone: false
})
export class Register {
  private router = inject(Router);
  private util = inject(UtilityService);

  nombre = '';
  email = '';
  password = '';
  confirmPassword = '';
  carrera = '';
  semestre: number | '' = '';

  semestres = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
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

  onRegister() {
    if (!this.nombre || !this.email || !this.password || !this.confirmPassword || !this.carrera || !this.semestre) {
      Swal.fire({ title: 'Completa todos los campos', icon: 'warning' });
      return;
    }

    if (!this.email.endsWith('@pascualbravo.edu.co')) {
      Swal.fire({ title: 'Correo inválido', text: 'Debes usar tu correo institucional @pascualbravo.edu.co', icon: 'error' });
      return;
    }

    if (this.password !== this.confirmPassword) {
      Swal.fire({ title: 'Las contraseñas no coinciden', icon: 'error' });
      return;
    }

    const yaExiste = USUARIOS_MOCK.find(u => u.email === this.email);
    if (yaExiste) {
      Swal.fire({ title: 'Este correo ya está registrado', icon: 'error' });
      return;
    }

    const nuevoUsuario = {
      id: USUARIOS_MOCK.length + 1,
      nombre: this.nombre,
      email: this.email,
      password: this.password,
      carrera: this.carrera,
      semestre: Number(this.semestre),
      fechaRegistro: new Date()
    };

    USUARIOS_MOCK.push(nuevoUsuario);
    this.util.setSession('UsuarioKeySession', nuevoUsuario);

    Swal.fire({
      title: '¡Bienvenido a Pillarboxed!',
      text: `Tu butaca está lista, ${this.nombre.split(' ')[0]}`,
      icon: 'success'
    }).then(() => {
      this.router.navigate(['/home']);
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}