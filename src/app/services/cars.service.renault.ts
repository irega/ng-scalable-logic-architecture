import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { CarModel } from 'models_car.model';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CarsService {

    constructor(private http: Http) {
    }

    getCars() {
        //we return a fake model (no http call). 
        let model: Array<CarModel> = [
            { id: 1, name: 'megane', kW: 100 },
            { id: 2, name: 'clio', kW: 120 },
            { id: 3, name: 'laguna', kW: 80 }
        ];
        return Observable.of(model);
    }
}
