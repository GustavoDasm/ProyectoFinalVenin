import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent implements OnInit {
  @ViewChild('btnshow',null) public btnshow:ElementRef;
  @ViewChild('btnhide',null) public btnhide: ElementRef;
  public isShowDelete:boolean= false;
  public title='';
  public message ='';
  public isButton:boolean;
  constructor() { }
  public fun :Function;
  public style:string;
  ngOnInit() {
  }
  public show(message='ventana de diálogo e información',title='Alerta de Sistema',type:number=1,funcion:Function=null,button:boolean=false){
    switch (type) {
      case 0:   this.style='danger'; break;
      case 1:   this.style='primary'; break;
      case 2:   this.style='warning'; break;
      case 3:   this.style='info'; break;
      default:
        break;
    }
    
    this.title = title;
    this.message = message;
    this.isShowDelete = true;
    this.isButton = button;
    this.fun = funcion;
    setTimeout(() => {
      this.btnshow.nativeElement.click();
    }, 50);
  }
  public hide(){
    this.isShowDelete = false;
  }
  public process(){
    if(this.fun != null){
      this.fun();
      this.btnhide.nativeElement.click();
    }else{console.log('ninguna funcion activa');}
  }
}
