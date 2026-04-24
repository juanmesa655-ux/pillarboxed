import { Component, ElementRef, ViewChild, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { UtilityService } from './services/utility.service';
import { Toast } from 'bootstrap';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  standalone: false
})
export class AppComponent {
  private router = inject(Router);
  public util = inject(UtilityService);

  @ViewChild("toaster") toaster: ElementRef | undefined;

  constructor() {
    // Reaccionar a cambios en el Signal del Toaster
    effect(() => {
      const data = this.util.toaster();
      if (data && this.toaster) {
        const autohide = (data.delay > 0);
        const toast = Toast.getOrCreateInstance(this.toaster.nativeElement, { 
          animation: true, 
          autohide, 
          delay: data.delay 
        });
        toast.show();
      }
    });
  }

  isLoginRoute(): boolean {
    return this.router.url === '/login';
  }
  
  title = 'crudProject';
}
