import { Component, input } from '@angular/core';
import { Usuario } from '../../models/usuario';
import { format } from 'date-fns-tz';

@Component({
  selector: 'app-cu-usuario',
  templateUrl: './cu-usuario.component.html',
  styleUrl: './cu-usuario.component.css',
  standalone: false
})
export class CuUsuarioComponent {
  // Input de Signal
  usuario = input<Usuario | undefined>(undefined);

  formatDateTimeLocal(fecha: Date) {
    if (!fecha) return "";
    let fechaFormateada = format(new Date(fecha), "yyyy-MM-dd'T'HH:mm", { timeZone: "America/Bogota" });
    return fechaFormateada;
  }

  updateDate(valor: string) {
    const current = this.usuario();
    if (current) {
      current.fechaRegistro = new Date(valor);
    }
  }
}
