import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthModule } from '@auth0/auth0-angular';
import { NgxSpinnerModule } from 'ngx-spinner';
import { environment } from 'src/environments/environment';
import { LoginComponent } from './pages/login/login.component';
import { MainComponent } from './pages/main/main.component';
import { DateAsAgoPipe } from './pipes/dateAsAgo';
import { SocketService } from './services/socket/socket.service';

@NgModule({
  declarations: [AppComponent, LoginComponent, MainComponent, DateAsAgoPipe],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxSpinnerModule,
    AuthModule.forRoot({
      ...environment.auth,
    }),
  ],
  providers: [SocketService],
  bootstrap: [AppComponent],
})
export class AppModule {}
