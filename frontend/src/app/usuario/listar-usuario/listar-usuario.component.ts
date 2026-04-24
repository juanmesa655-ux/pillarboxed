import { Component, ElementRef, ViewChild, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Usuario } from '../../models/usuario';
import Swal from 'sweetalert2';
import { UsuarioService } from '../../services/usuario.service';
import { UtilityService } from '../../services/utility.service';

@Component({
  selector: 'app-listar-usuario',
  templateUrl: './listar-usuario.component.html',
  styleUrl: './listar-usuario.component.css',
  standalone: false
})
export class ListarUsuarioComponent implements OnInit {
  private _usuarioService = inject(UsuarioService);
  private _util = inject(UtilityService);
  private destroyRef = inject(DestroyRef); // Modern disposal

  @ViewChild('modalUsuario') modal: ElementRef | undefined;

  VectorUsuarios = signal<Usuario[]>([]);
  usuarioSeleccionado = signal<Usuario | undefined>(undefined);
  isNew = signal(false);
  isLoading = signal(true);

  ngOnInit() {
    this.LoadUsuarios();
  }

  LoadUsuarios() {
    this.isLoading.set(true);
    this._usuarioService.getUsuarios()
      .pipe(takeUntilDestroyed(this.destroyRef)) // Prevents memory leaks
      .subscribe((rs) => {
        this.VectorUsuarios.set(rs);
        this.isLoading.set(false);
      });
  }

  EditarUsuario(usuario: Usuario) {
    this._util.AbrirModal(this.modal);
    this.isNew.set(false);
    this.usuarioSeleccionado.set(usuario);
  }

  NuevoUsuario() {
    this._util.AbrirModal(this.modal);
    this.isNew.set(true);
    this.usuarioSeleccionado.set({ id: 0, fechaRegistro: new Date(), nombre: "" });
  }

  GuardarUsuario() {
    if (this.isNew()) {
      // Logic for creating
      this.VectorUsuarios.update(prev => [...prev, this.usuarioSeleccionado()!]);
      this.usuarioSeleccionado.set(undefined);
      this._util.CerrarModal(this.modal)
    } else {
      // Logic for editing
      this.usuarioSeleccionado.set(undefined);
      this._util.CerrarModal(this.modal)
    }
    Swal.fire({ title: 'Cambios guardados correctamente', icon: 'success' })
  }

  EliminarUsuario(us: Usuario) {
    Swal.fire({
      icon: 'question',
      title: `¿Está seguro de eliminar el usuario '${us.nombre}'?`,
      showCancelButton: true,
      confirmButtonText: "Si, eliminar",
      cancelButtonText: 'No, conservar',
      buttonsStyling: false,
      customClass: {
        cancelButton: 'btn btn-secondary me-1',
        confirmButton: 'btn btn-danger'
      }
    }).then(rs => {
      if (rs.isConfirmed) {
        this.VectorUsuarios.update(prev => prev.filter(u => u.id !== us.id));
        Swal.fire({ title: 'Usuario eliminado correctamente', icon: 'success' });
      }
    });
  }

  mostrarToast() {
    this._util.showToaster('Mensaje prueba', 2, 'warning');
  }
}
