import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ServiceWorkerModule } from '@angular/service-worker';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeNavComponent } from './home-nav/home-nav.component';
import { HomeInfoComponent } from './home-info/home-info.component';
import { HomeInfoStatusComponent } from './home-info-status/home-info-status.component';
import { HomeConfigurationComponent } from './home-configuration/home-configuration.component';
import { HomeFooterComponent } from './home-footer/home-footer.component';
import { BluetoothService } from '../services/bluetooth.service';
import { ConfigurationService } from '../services/configuration.service';
import { NotificationsService } from '../services/notifications.service';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    HomeNavComponent,
    HomeInfoComponent,
    HomeInfoStatusComponent,
    HomeConfigurationComponent,
    HomeFooterComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    BluetoothService,
    ConfigurationService,
    NotificationsService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
