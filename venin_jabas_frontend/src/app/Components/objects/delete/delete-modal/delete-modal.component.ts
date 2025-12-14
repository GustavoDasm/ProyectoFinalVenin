import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.css']
})
export class DeleteModalComponent implements OnInit {
  @ViewChild('btnshow',null) public btnshow:ElementRef;
  @ViewChild('btnhide',null) public btnhide: ElementRef;
  public isShowDelete= false;
  public title='';
  public message ='';
  constructor() { }
  public fun :Function;
  ngOnInit() {
  }
  public show(message='¿Estás seguro de esliminar el elemento seleccionado?',title='Eliminar Elemento',f:Function=null){
    this.title = title;
    this.message = message;
    this.isShowDelete = true;
    this.fun = f;
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
