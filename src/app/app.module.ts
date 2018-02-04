import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { AppRoutingModule, routedComponents } from './app-routing.module';
import { CarsService } from 'services_cars.service';

@NgModule({
    imports: [
        BrowserModule,
        HttpModule,

        AppRoutingModule
    ],
    declarations: [
        AppComponent,
        routedComponents
    ],
    providers: [
        CarsService
    ],
    bootstrap: [AppComponent],
})
export class AppModule { }
