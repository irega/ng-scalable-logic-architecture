import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

class CarData {
}

@Injectable()
export class CarsService {

    constructor(private http: Http) {
    }

    getCars() {
        const URL_GET_CARS = '/Cars';
        return this.http.get(URL_GET_CARS).map(response => {
            const cars = response.json() as CarData[];
        });
    }
}
