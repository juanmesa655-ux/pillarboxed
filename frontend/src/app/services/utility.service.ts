import { ElementRef, Injectable, signal } from '@angular/core';
import { Modal } from 'bootstrap';
import { Observable } from 'rxjs';
import { ToasterModel } from '../models/core/toaster.model';
import { Usuario } from '../models/usuario';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {
  private toasterSignal = signal<ToasterModel | undefined>(undefined);
  private sessionKey = "UsuarioKeySession";

  // Signal pública de solo lectura
  public toaster = this.toasterSignal.asReadonly();

  constructor() { }

  Login(usr: string, pwd: string): Observable<boolean> {
    return new Observable(subs => {
      let rs = usr == 'admin' && pwd == 'admin';
      this.setSession(this.sessionKey, { id: 1, nombre: "Omar", fechaRegistro: new Date() })
      subs.next(rs);
      subs.complete();
    })
  }

  getCurrentUser(): Usuario | undefined {
    return this.getSession<Usuario>(this.sessionKey);
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