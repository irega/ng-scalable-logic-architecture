import { Component, Input } from '@angular/core';
import { CarModel } from 'src_app_models_car.model';

@Component({
 moduleId: module.id.toString(),
 selector: 'carman-car-detail',
 templateUrl: 'car-detail.component.renault.html',
 styleUrls: ['./car-detail.component.scss']
})
export class CarDetailComponent {
 @Input() car: CarModel;
}
