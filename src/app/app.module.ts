import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeExplodeComponent } from './home-explode/home-explode.component';
import { HomeFooterComponent } from './home-footer/home-footer.component';
import { HomeConfigurationComponent } from './home-configuration/home-configuration.component';
import { HomeInfoComponent } from './home-info/home-info.component';
import { HomeInfoStatusComponent } from './home-info-status/home-info-status.component';
import { HomeNavComponent } from './home-nav/home-nav.component';
import { BleBatteryService } from '../services/ble-battery.service';
import { BleConfigurationService } from '../services/ble-configuration.service';
import { BluetoothService } from '../services/bluetooth.service';
import { NotificationsService } from '../services/notifications.service';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    HomeConfigurationComponent,
    HomeExplodeComponent,
    HomeFooterComponent,
    HomeInfoComponent,
    HomeInfoStatusComponent,
    HomeNavComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    AppRoutingModule
  ],
  providers: [
    BleBatteryService,
    BleConfigurationService,
    BluetoothService,
    NotificationsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
