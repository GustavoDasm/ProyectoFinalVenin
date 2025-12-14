import { Injectable, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, tap, map } from 'rxjs/operators';
//import { Settings } from '../Settings/settings';
import { Config } from './config/config';
import { AlertComponent } from '../Components/objects/alert/alert/alert.component';
import { ModalComponent } from '../Components/objects/modal/modal/modal.component';
import { AuthService } from './auth.service';
import Swal from 'sweetalert2';
import { AlertType } from '../Models/alert/alert-type';
import { ALertOption } from '../Models/alert/alert-option';
import { Numero } from '../Models/numero/numero';
import { Router } from '@angular/router';
import { RangoFechas } from '../Models/rangofechas/rango-fechas';

//import class

@Injectable({
  providedIn: 'root'
})
export class DataService {
  public api: Config = new Config();
  private headers = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json', 'X-Subdomain': 'ng',
      'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Credentials': 'true'
    })
  }
  public serie_boleta: Numero = new Numero;
  public serie_factura: Numero = new Numero;
  public serieb_ncr: Numero = new Numero;
  public serief_ncr: Numero = new Numero;
  public serief_ndb: Numero = new Numero;
  public serieb_ndb: Numero = new Numero;
  public serie_pedido: Numero = new Numero;
  public serie_guia: Numero = new Numero;
  constructor(public http: HttpClient, private auth: AuthService, private router: Router) {
    // //ng
    //fabrimac_lima
    this.initSeriesPorSucursal()
  
  }
  private data: any;
  public alertType: AlertType = new AlertType();

  public notify(message: string, title: string, types: any = this.alertType.success, options: ALertOption = new ALertOption(), confirmF: Function = null, cancelF: Function = null) {

    let swal = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success mr-3',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false,

    })
    swal.fire({
      title: title,
      text: message,
      icon: types,
      confirmButtonText: options.confirmButtonText,
      cancelButtonText: options.cancelButtonText,
      showCancelButton: options.showCancelButton,
      allowOutsideClick: false,
      allowEscapeKey: false,
      reverseButtons: false,
      showCloseButton: options.showCloseButton
    }).then((r) => {
      if (r.value) {
        if (confirmF != null) { confirmF(); }
      } else if (r.dismiss === Swal.DismissReason.cancel) {
        if (cancelF != null) { cancelF(); }
      }
    }

    ).catch(() => { console.log('cancelado'); })
  }
  public wait(message: string = '', title: string = 'Alerta de Sistema') {
    let swal = Swal.mixin({

    });
    swal.fire({
      text: message,
      title: title,
      icon: undefined,
      allowOutsideClick: false,
      allowEscapeKey: false,
      allowEnterKey: false,
      showCancelButton: false,
      showConfirmButton: false,
    });
  }
  public notifyClose() {
    Swal.close();
  }
  /* Nuevas Funciones para consumir APIRest*/

  getSucursalObj(): Observable<any> {
    const idsucursal = sessionStorage.getItem('idSucursal');
    return this.GetFromId(this.api.sucursal, idsucursal).pipe(
      map((r) => r)
    );
  }

  setSucursalId(idSucursal: number): void {
    sessionStorage.setItem('idSucursal', idSucursal.toString());
  }

  getSucursalId(): string | null {
    return sessionStorage.getItem('idSucursal');
  }

  setPersonalId(idSucursal: number): void {
    sessionStorage.setItem('idPersonal', idSucursal.toString());
  }

  getPersonalId(): string | null {
    return sessionStorage.getItem('idPersonal');
  }

  setPersonalNombre(nombre: number): void {
    sessionStorage.setItem('personalNombre', nombre.toString());
  }

  getPersonalNombre(): string | null {
    return sessionStorage.getItem('personalNombre');
  }

  initSeriesPorSucursal() {
    const idSucursal: number = parseInt(this.getSucursalId());
    switch (idSucursal) {
      case 1:
        this.serie_boleta.serie = "BB12";
        this.serie_factura.serie = "FF12";
        this.serie_pedido.serie = "0001";
        this.serieb_ncr.serie = "BB12";
        this.serief_ncr.serie = "FF12";
        this.serie_guia.serie = "TT12";
        break;
      case 2:
        this.serie_boleta.serie = "BB03";
        this.serie_factura.serie = "FF03";
        this.serie_pedido.serie = "0008";
        this.serieb_ncr.serie = "BB03";
        this.serief_ncr.serie = "FF03";
        this.serie_guia.serie = "TT03";
        break;
      case 3:
        this.serie_boleta.serie = "BB01";
        this.serie_factura.serie = "FF01";
        this.serie_pedido.serie = "0014";
        this.serieb_ncr.serie = "BB01";
        this.serief_ncr.serie = "FF01";
        this.serie_guia.serie = "TT01";
        break;
      case 4:
        this.serie_boleta.serie = "BB06";
        this.serie_factura.serie = "FF06";
        this.serie_pedido.serie = "0011";
        this.serieb_ncr.serie = "BB06";
        this.serief_ncr.serie = "FF06";
        this.serie_guia.serie = "TT06";
        break;
      case 5:
        this.serie_boleta.serie = "BB05";
        this.serie_factura.serie = "FF05";
        this.serie_pedido.serie = "0013";
        this.serieb_ncr.serie = "BB05";
        this.serief_ncr.serie = "FF05";
        this.serie_guia.serie = "TT05";
        break;
      case 6:
        this.serie_boleta.serie = "BB08";
        this.serie_factura.serie = "FF08";
        this.serie_pedido.serie = "0016";
        this.serieb_ncr.serie = "BB08";
        this.serief_ncr.serie = "FF08";
        this.serie_guia.serie = "TT08";
        break;
      default:
        // Fallback por si el idsucursal no es válido
        this.serie_boleta.serie = "BB01";
        this.serie_factura.serie = "FF01";
        this.serie_pedido.serie = "0001";
        this.serieb_ncr.serie = "BB01";
        this.serief_ncr.serie = "FF01";
        this.serie_guia.serie = "TT01";
    }
  }

  public Search(clase: string, coleccion: any): Observable<any> {
    console.log(coleccion);

    let response = this.http.post<any>(this.api.apiUrl + 'search/' + clase, coleccion)
    return response
  }

  public searchArticulos(coleccion: any): Observable<any> {
    console.log(coleccion);

    let response = this.http.post<any>(this.api.apiUrl + 'search_articulos/', coleccion)
    return response
  }

  public searchPrecios(coleccion: any): Observable<any> {
    console.log(coleccion);

    let response = this.http.post<any>(this.api.apiUrl + 'search_precios/', coleccion)
    return response
  }

  public GetSimple(base: string): Observable<any> {
    var response = this.http.get<any>(this.api.apiUrl + base);
    return response;
  }


  public GetFromId(base: string, value: string = ''): Observable<any> {
    return this.http.get<any>(this.api.apiUrl + base + '/' + value);
  }

  public GetFromValue(base: string, option: string = '', value: string = ''): Observable<any> {
    return this.http.get<any>(this.api.apiUrl + base + '/' + option + '/' + value);
  }

  public Post(base: string, coleccion: any): Observable<any> {
    console.log(coleccion);
    return this.http.post<any>(this.api.apiUrl + base + '/', coleccion);
  }

  public Put(base: string, value: string = '', coleccion: any): Observable<any> {
    console.log(coleccion);
    return this.http.put<any>(this.api.apiUrl + base + '/' + value + '/', coleccion);
  }

  public Patch(base: string, value: string = '', coleccion: any): Observable<any> {
    console.log(coleccion);
    return this.http.patch<any>(this.api.apiUrl + base + '/' + value + '/', coleccion);
  }

  public Delete(base: string, value: string = ''): Observable<any> {
    return this.http.delete<any>(this.api.apiUrl + base + '/' + value);
  }

  //funciones Asincronicas
  public AsyncGetSimple(base: string): Promise<any> {
    var response = this.http.get<any>(this.api.apiUrl + base);
    return response.toPromise();
  }

  public AsyncGetFromId(base: string, value: string = ''): Promise<any> {
    return this.http.get<any>(this.api.apiUrl + base + '/' + value).toPromise();
  }

  public AsyncGetFromValue(base: string, option: string = '', value: any = ''): Promise<any> {
    var response = this.http.get<any>(this.api.apiUrl + base + '/' + option + '/' + value)
    return response.toPromise();
  }

  public AsyncPost(base: string, coleccion: any): Promise<any> {
    return this.http.post<any>(this.api.apiUrl + base + '/', coleccion).toPromise();
  }

  public AsyncPut(base: string, value: string = '', coleccion: any): Promise<any> {
    var response = this.http.put<any>(this.api.apiUrl + base + '/' + value + '/', coleccion)
    return response.toPromise();
  }

  public AsyncDelete(base: string, value: string = ''): Promise<any> {
    return this.http.delete<any>(this.api.apiUrl + base + '/' + value).toPromise();
  }

  public Print(value: string = ''): Promise<any> {
    return this.http.get<any>(this.api.apiUrl + 'imprime/' + value).toPromise();
  }

  public PrintP(value: string = '', coleccion: any): Promise<any> {
    return this.http.post<any>(this.api.apiUrl + 'imprime/' + value, coleccion).toPromise();
  }

  public GenerateExcel(value: string = '', coleccion: any): Observable<any> {
    return this.http.post<any>(this.api.apiUrl + 'excel/' + value, coleccion);
  }

  public GeneratePDF(value: string = '', coleccion: any): Observable<any> {
    return this.http.post<any>(this.api.apiUrl + 'pdf/' + value, coleccion);
  }

  public DeleteExcel(value: string = ''): Observable<any> {
    return this.http.get<any>(this.api.apiUrl + 'delete_excel' + value);
  }

  public DeletePDF(value: string = ''): Observable<any> {
    return this.http.get<any>(this.api.apiUrl + 'delete_pdf/' + value);
  }
 
  public Consulta(option: string = '', value: any = null): Promise<any> {
    return this.http.get<any>('https://api.digitalboxperusac.com/consulta/' + option + '/' + value).toPromise();
  }

  public ConsultaDNI(value: string = null): Promise<any> {
    const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJlbWFpbCI6InlvcmRpY2l0bzIwMTRAZ21haWwuY29tIn0.x7Cz4LfNnDoRPz-dYc4cCvQJdSVlryehagpZ5Ai6c4Q';  // El token específico que necesitas
    return this.http.get<any>('https://dniruc.apisperu.com/api/v1/dni/' + value + `?token=${token}`).toPromise();
  }

  public GetTipoCambio(fecha: string = null): Promise<any> {

    return this.http.get<any>(this.api.apiUrl + 'getipocambio/' + fecha).toPromise();
  }
  public SendNubefact(option: string = '', coleccion: any = null): Promise<any> {
    return this.http.post<any>('http://127.0.0.1:8000/api/' + option, coleccion).toPromise();
  }
  public selectPostP(base: string, option: string = '', value = '', coleccion: any): Promise<any> {
    return this.http.post<any>(this.api.apiUrl + base + '/select/' + option + '/' + value, coleccion).toPromise();
  }
  public insertP(base: string, coleccion: any, type: string = ''): Promise<any> {
    return this.http.post<any>(this.api.apiUrl + base + '/insert', coleccion).toPromise();
  }
  public updateP(base: string, option: string = '', coleccion: any = null, type: string = ''): Promise<any> {
    return this.http.post<any>(this.api.apiUrl + base + '/update/' + option, coleccion).toPromise();
  }
  public deleteP(base: string, value: any = null): Promise<any> {
    console.log(value);
    return this.http.delete<any>(this.api.apiUrl + base + '/delete/' + value).toPromise();
  }

  //funciones adicionales
  DateNowCurrent(): string {
    let d: Date = new Date();
    let dia = d.getDate();
    let mes = (d.getMonth() + 1);
    let messtring = "";
    let diastring = "";
    if (mes >= 0 && mes <= 9) { messtring = '0' + mes }
    else { messtring = mes.toString(); }
    if (dia >= 0 && dia <= 9) { diastring = '0' + dia }
    else { diastring = dia.toString(); }
    return d.getFullYear() + '-' + messtring + '-' + diastring;
  }
  public DateGetValue(fecha: string, format: string = 'd'): number {
    let dt = new Date(fecha)
    switch (format) {
      case 'd': return dt.getDate();
      case 'm': return dt.getMonth() + 1;
      case 'd': return dt.getFullYear();
      default: return 0;
    }
  }
  public StringToDate(fecha: string): Date {
    return new Date(fecha);
  }
  public DateSetValue(fecha: Date, value: number, format: string = 'd'): Date {
    switch (format) {
      case 'd': fecha.setDate(fecha.getDate() + value);
      case 'm': fecha.getMonth() + 1;
      case 'd': fecha.getFullYear();
    }
    return fecha;
  }
  public DateToString(fecha: Date): string {
    return fecha.toISOString().split('T')[0];
  }

  public isset(value: any) {
    if (value != undefined) {
      if (typeof value == 'string') {
        if (value != '') {
          return true;
        } else {
          return false;
        }
      }
    } else { return false; }
  }

  open(url: string): void {
    const newTab = window.open('', '_blank');
    newTab.location.href = this.router.serializeUrl(
      this.router.createUrlTree([url])
    );
  }

  getCurrentUser() {
    return this.auth.getCurrentUser();
  }

  SetFocus(element: ElementRef) {
    setTimeout(() => {
      element.nativeElement.focus();
    }, 500);
  }

  ShowAlert(alert: AlertComponent, message: string = '', style = 1, close: boolean = false, time: number = 5000) {
    alert.show(message, style, time, close);
    setTimeout(() => {
      alert.hide();
    }, time);
  }

  Modal(modal: ModalComponent, message: string, title: string, funcion: Function = null, button: boolean = false) {
    modal.show(message, title, 1, funcion, button);
  }

  public Exists(value: any) {
    if (value != undefined) {
      if (value != '') {
        return true;
      } else { return false; }
    } else { return false; }
  }

  public numberFormat(value: any = 0, decimales: number = 2) {
    let res = 0;
    switch (typeof value) {
      case 'string':
        res = parseFloat(parseFloat(value).toFixed(decimales))
        break;
      case 'number':
        res = parseFloat(value.toFixed(decimales))
        break;
      default:
        break;
    }
    return res;
  }

  /* verifica si existe un contenido en la variable */
  public iscontent(object: any): boolean {
    return object != undefined && object != '' ? true : false;
  }


}
