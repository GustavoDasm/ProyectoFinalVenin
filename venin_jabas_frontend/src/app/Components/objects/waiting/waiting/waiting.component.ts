import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-waiting',
  templateUrl: './waiting.component.html',
  styleUrls: ['./waiting.component.css']
})
export class WaitingComponent implements OnInit {
  public isLoading:boolean=false;
  public message:string='';
  constructor() { }

  ngOnInit() {
  }
  public show(message='Cargando datos...'){
    this.isLoading = true;
    this.message = message;
  }
  public hide(){
    this.isLoading = false;
  }
}
