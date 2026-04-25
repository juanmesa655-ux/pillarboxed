import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppComponent } from "./app.component";
import { provideSweetAlert2 } from "@sweetalert2/ngx-sweetalert2";
import { provideHttpClient } from "@angular/common/http";
import { LoginComponent } from "./login/login.component";
import { FormsModule } from "@angular/forms";
import { AppRoutingModule } from "./app-routing.module";
import { Register } from "./register/register";
import { Recuperar } from "./recuperar/recuperar";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    Register,
    Recuperar,
  ],
  imports: [BrowserModule, AppRoutingModule, FormsModule],
  providers: [provideHttpClient(), provideSweetAlert2()],
  bootstrap: [AppComponent],
})
export class AppModule {}
