import { Component, OnInit } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  constructor(private auth: AuthService, private spinner: NgxSpinnerService) {}

  ngOnInit() {}

  loginWithAuth0() {
    this.spinner.show();
    this.auth.loginWithPopup().subscribe(
      (result) => {
        this.spinner.hide();
      },
      (error) => {
        this.spinner.hide();
      }
    );
  }
}
