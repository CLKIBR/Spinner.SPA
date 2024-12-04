import { Component } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgStyle } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective, CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective, FormControlDirective, ButtonDirective, AlertModule, GridModule, FormModule, CardModule, TableModule, UtilitiesModule, AvatarComponent, ProgressComponent, TableDirective, ModalModule, ButtonModule, ProgressBarDirective } from '@coreui/angular';
import { FormsModule, NgModel, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/service/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ContainerComponent, RowComponent, ColComponent, CardGroupComponent, TextColorDirective,
    CardComponent, CardBodyComponent, FormDirective, InputGroupComponent, InputGroupTextDirective,
    IconDirective, FormControlDirective, ButtonDirective, NgStyle, CommonModule, FormsModule,
    AlertModule, GridModule, FormModule, CardModule, TableModule, UtilitiesModule, HttpClientModule,
    ReactiveFormsModule, ModalModule, ButtonModule],
  providers: [AuthService, NgModel]
})
export class LoginComponent {

  constructor(private authService: AuthService) { }

  loginUser: any = {};

  login() {
    this.authService.login(this.loginUser)
  }

}
