import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeConnectComponent } from './home-connect/home-connect.component';
import { HomeNavComponent } from './home-nav/home-nav.component';
import { BluetoothService } from '../services/bluetooth.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeConnectComponent,
    HomeNavComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [BluetoothService],
  bootstrap: [AppComponent]
})
export class AppModule { }
