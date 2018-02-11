import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { CarsService } from 'src_app_services_cars.service';
import { CarModel } from 'src_app_models_car.model';

@Component({
 moduleId: module.id.toString(),
 selector: 'carman-car-list',
 templateUrl: 'car-list.component.html',
 styleUrls: ['./car-list.component.scss']
})
export class CarListComponent implements OnInit, OnDestroy {
 public cars: CarModel[];
 private _getCarsSubscription: Subscription;

 constructor(private _service: CarsService) {
 }

 ngOnInit() {
  this.getCars();
 }

 ngOnDestroy() {
  this._deleteGetCarsSubscription();
 }

 private _deleteGetCarsSubscription() {
  if (this._getCarsSubscription) {
   this._getCarsSubscription.unsubscribe();
  }
 }

 getCars() {
  this._getCarsSubscription = this._service.getCars().subscribe(cars => {
   this.cars = cars || [];
  });
 }
}
