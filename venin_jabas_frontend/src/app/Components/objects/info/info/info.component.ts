import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html'
})
export class InfoComponent implements OnInit {
  @ViewChild('content', null) content: ElementRef;
  @ViewChild('btnhide', null) btnhide: ElementRef;
  
  public isShow: boolean = false;
  public textClass = 'text-info';
  public message;
  public font: number = 16;
  public option: any = { cancelText: 'Cancelar', successText: 'Aceptar', isCancel: false }
  public title:string='AVISO IMPORTANTE';
  public fun: Function;
  public funcan:Function;
  public isError:boolean=false;
  constructor() { }
  ngOnInit() {
  }

  public show(message = '', type: number = 1,close:boolean=null, option: any = null, fsuccess: Function = null, fcancel:Function=null, font = null) {
    this.isShow = true;
    this.message = "";
    if(close == null){
      this.isError = false;
    }else{this.isError = close;}
    if (this.isInternet()) {
      this.message = message;
      if (font != null) {
        this.font = font;
      }
      switch (type) {
        case 0: this.textClass = 'text-danger'; break;
        case 1: this.textClass = 'text-info'; break;
        case 2: this.textClass = 'text-success'; break;
        case 3: this.textClass = 'text-primary'; break;
      }
      if (option != null) {
        this.option = option;
      }else{
        this.option = { cancelText: 'Cancelar', successText: 'Aceptar', isCancel: false };
      }
      this.fun = fsuccess;
      this.funcan = fcancel;
    } 
    setTimeout(() => {
      this.content.nativeElement.style.fontSize = this.font + 'px';
      this.content.nativeElement.innerHTML = this.message;
    }, 50);


  }
  public isInternet(){
    let r:boolean =false;
    if(navigator.onLine){
      r = true;
    }else{
      r=false;
      this.message = 'No existe conexión a internet, por favor verifique el estado de internet en su ordenador. si el error persiste, comuníquese con el proveedor del internet.';
      this.option = { cancelText: 'Cancelar', successText: 'Aceptar', isCancel: false }
    }
    return r;
  }
  public error(obj,f:Function= null){
    this.isError=true;
    this.message ="";
    this.textClass = 'text-danger';
    this.isShow = true;
    if(this.isInternet()){
      if(obj.error.text != undefined){
        this.title = 'ERROR DE CONSOLA';
        this.message = obj.error.text;
      }else{
        this.message = "Ocurrio un error interno en el sistema. posbles errores => no hay conexión al api rest";
      }
      this.fun = f;
      this.option = { cancelText: 'Cancelar', successText: 'Aceptar', isCancel: false }

    }
    setTimeout(() => {
      this.content.nativeElement.style.fontSize = this.font + 'px';
      this.content.nativeElement.innerHTML = this.message;
    }, 50);
  }
  public hide() {
    this.isShow = false;
  }
  public process() {
    if (this.fun != null) {
      this.fun();

    }
    if(this.isError){
      console.log('iserror');
      setTimeout(() => {
        this.isShow = false;
      }, 50);
    }else{
      this.isShow = false;
    }
    
  }
  cancel() {
    if (this.funcan != null) {
      this.funcan();
    }
    if(this.isError){
      setTimeout(() => {
        this.btnhide.nativeElement.click();
        this.isShow = false;
      }, 50);
    }
  }
}
