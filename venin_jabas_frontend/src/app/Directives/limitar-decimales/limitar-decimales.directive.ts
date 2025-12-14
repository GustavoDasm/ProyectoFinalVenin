import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
  selector: '[appLimitarDecimales]'
})
export class LimitarDecimalesDirective {

  @Input() appLimitarDecimales = 5; // Por defecto: 5 decimales

  constructor(private el: ElementRef) { }

  @HostListener('input', ['$event'])
  onInputChange(event: any) {
    const input = event.target;
    let value = input.value;

    if (value && value.includes('.')) {
      const partes = value.split('.');
      if (partes[1].length > this.appLimitarDecimales) {
        value = partes[0] + '.' + partes[1].substring(0, this.appLimitarDecimales);
        input.value = value;
        input.dispatchEvent(new Event('input')); // actualiza ngModel
      }
    }
  }

}
