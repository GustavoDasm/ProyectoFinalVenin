import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'stringToNumber'
})
export class StringToNumberPipe implements PipeTransform {

  transform(value: string): number {
    if (!value) {
      return 0;
    }
    return parseInt(value);
  }

}
