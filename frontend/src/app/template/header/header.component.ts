import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { Dropdown } from 'bootstrap';
import { Usuario } from '../../models/usuario';
import { UtilityService } from '../../services/utility.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  standalone: false
})
export class HeaderComponent {
  @ViewChild("menudd") menudd: ElementRef | undefined;
  currentUsuario: Usuario | undefined;

  constructor(private util: UtilityService, private router: Router) {
    if (this.util.isLoggedIn())
      this.currentUsuario = this.util.getCurrentUser();
    else
      this.router.navigate(["/login"]);
  }

  openmenudd() {
    let dd = Dropdown.getOrCreateInstance(this.menudd?.nativeElement);
    dd.toggle();
  }
}
