import { Component, inject } from '@angular/core';
import { UtilityService } from '../services/utility.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: false
})
export class LoginComponent {
  private _utilService = inject(UtilityService);
  private router = inject(Router);

  usr: string = "";
  pwd: string = "";

  login() {
    this._utilService.Login(this.usr, this.pwd)
      .subscribe(rs => {
        if (rs) {
          this.router.navigate(['/']);
        } else {
          Swal.fire({
            title: 'Usuario y/o contraseña incorrectos',
            icon: 'error'
          })
        }
      })
  }
}
