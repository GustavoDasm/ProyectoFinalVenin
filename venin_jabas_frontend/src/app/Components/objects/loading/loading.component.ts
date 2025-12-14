import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.css']
})
export class LoadingComponent implements OnInit {
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
  public text(m:string=''){
    this.message = m;
  }
}
