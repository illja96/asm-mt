import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeNavComponent } from './home-nav/home-nav.component';
import { HomeInfoComponent } from './home-info/home-info.component';
import { HomeInfoStatusComponent } from './home-info-status/home-info-status.component';
import { HomeConfigurationComponent } from './home-configuration/home-configuration.component';
import { BluetoothService } from '../services/bluetooth.service';
import { ConfigurationService } from '../services/configuration.service';

@NgModule({
  declarations: [
    AppComponent,
    HomeNavComponent,
    HomeInfoComponent,
    HomeInfoStatusComponent,
    HomeConfigurationComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [
    BluetoothService,
    ConfigurationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
