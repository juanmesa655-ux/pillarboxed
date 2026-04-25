import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from '../services/utility.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: false
})
export class LoginComponent {
  private util = inject(UtilityService);
  private router = inject(Router);

  email = '';
  password = '';
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

  onLogin() {
    if (!this.email || !this.password) {
      Swal.fire({ title: 'Completa todos los campos', icon: 'warning' });
      return;
    }

    this.util.Login(this.email, this.password).subscribe(rs => {
      if (rs) {
        this.router.navigate(['/home']);
      } else {
        Swal.fire({ title: 'Correo o contraseña incorrectos', icon: 'error' });
      }
    });
  }

  onRegister() {
    this.router.navigate(['/register']);
  }
}