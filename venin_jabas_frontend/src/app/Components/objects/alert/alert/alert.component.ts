import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
  public isAlert:boolean=false;
  public alertClass:string;
  public message:string;
  public closed:boolean=false;
  public show(message:string='',style:number=1, fadetime:number=null, close:boolean = false){
    this.isAlert = true;
    this.message = message;
    this.closed = close;
    switch (style) {
      case 0:  this.alertClass = 'alert-danger'; break;
      case 1:  this.alertClass = 'alert-primary'; break;
      case 2:  this.alertClass = 'alert-warning'; break;
      case 3:  this.alertClass = 'alert-info'; break;
    }
    if(fadetime != null){
      setTimeout(() => {
        this.hide();
      }, fadetime);
    }
  }
  public hide(){
    this.isAlert = false;
  }
}
