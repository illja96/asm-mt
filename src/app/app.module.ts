import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeNavComponent } from './home-nav/home-nav.component';
import { HomeStatusComponent } from './home-status/home-status.component';
import { HomeBatteryComponent } from './home-battery/home-battery.component';
import { BluetoothService } from '../services/bluetooth.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeNavComponent,
    HomeBatteryComponent,
    HomeStatusComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [BluetoothService],
  bootstrap: [AppComponent]
})
export class AppModule { }
