import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule, routedComponents } from './app-routing.module';
import { CarDetailComponent } from 'src_app_car-detail_car-detail.component';
import { CarsService } from 'src_app_services_cars.service';

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,
        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        CarDetailComponent,
        routedComponents
    ],
    providers: [
        CarsService
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
