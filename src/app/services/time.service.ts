import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class TimeService {

  private defaultTimeZone: string = environment.defaultTimeZone;

  getCurrentDate(): Date {
    return moment().tz(this.defaultTimeZone).toDate();
  }
}
