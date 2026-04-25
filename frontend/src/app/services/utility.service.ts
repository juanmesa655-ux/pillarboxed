import { ElementRef, Injectable, signal } from '@angular/core';
import { Modal } from 'bootstrap';
import { Observable } from 'rxjs';
import { ToasterModel } from '../models/core/toaster.model';
import { USUARIOS_MOCK } from '../data/usuarios-mock';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  private toasterSignal = signal<ToasterModel | undefined>(undefined);
  private sessionKey = "UsuarioKeySession";

  // Signal pública de solo lectura
  public toaster = this.toasterSignal.asReadonly();

  constructor() { }

Login(email: string, password: string): Observable<boolean> {
  return new Observable(subs => {
    const usuario = USUARIOS_MOCK.find(
      u => u.email === email && u.password === password
    );
    if (usuario) {
      this.setSession(this.sessionKey, usuario);
      subs.next(true);
    } else {
      subs.next(false);
    }
    subs.complete();
  });
}

  getCurrentUser(): any | undefined {
    return this.getSession<any>(this.sessionKey);
  }

  logout() {
    this.setSession(this.sessionKey, undefined);
  }

  isLoggedIn(): boolean {
    let usr = this.getSession(this.sessionKey);
    return (usr != undefined);
  }

  getSession<T>(key: string) {
    let obj = sessionStorage.getItem(btoa(key));
    if (obj)
      return JSON.parse(atob(obj)) as T;
    else
      return undefined;
  }

  setSession(key: string, value: any) {
    if (value)
      sessionStorage.setItem(btoa(key), btoa(JSON.stringify(value)));
    else
      sessionStorage.removeItem(key);
  }

  AbrirModal(modal: ElementRef | undefined) {
    if (modal) {
      let bsModal = Modal.getOrCreateInstance(modal.nativeElement);
      bsModal.show();
    }
  }

  CerrarModal(modal: ElementRef | undefined) {
    if (modal) {
      let bsModal = Modal.getInstance(modal?.nativeElement)
      bsModal?.hide();

      let backdrop = document.querySelector(".modal-backdrop.fade.show");
      if (backdrop) {
        backdrop.parentNode?.removeChild(backdrop);
      }
      document.body.removeAttribute('style');
      document.body.removeAttribute('class');
    }
  }

  showToaster(message: string, delay: number, type: 'success' | 'danger' | 'warning' | 'info' | 'primary') {
    this.toasterSignal.set({ message, delay: (delay * 1000), type });
  }

}