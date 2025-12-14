import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nothing',
  templateUrl: './nothing.component.html',
  styleUrls: ['./nothing.component.css']
})
export class NothingComponent implements OnInit {

  public isNothing:boolean=false;
  public message:string='';
  constructor() { }

  ngOnInit() {
  }
  public show(message='No es posible encontrar los registros en el sistema. Vuelva a intentarlo con otros parámetros de búsqueda.'){
    this.isNothing = true;
    this.message = message;
    
  }
  public hide(){
    this.isNothing = false;
  }
}
