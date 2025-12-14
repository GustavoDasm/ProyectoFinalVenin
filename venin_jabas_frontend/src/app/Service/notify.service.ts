import { Injectable } from '@angular/core';
import { NotifierService } from 'angular-notifier';

@Injectable({
  providedIn: 'root'
})
export class NotifyService {
  private notify: NotifierService;
  constructor(private n:NotifierService){
      this.notify=n;
  }
  public Show( obj:any):void{
      console.log(obj);
      if(obj != null){
        if(obj.result=== 0){
            this.notify.notify('error',obj.message) ;
        }else if(obj.result=== 1){
            this.notify.notify('success',obj.message) ;
        }else if(obj.result=== 2){
            this.notify.notify('warning',obj.message) ;
        }if(obj.result=== 3){
            this.notify.notify('info',obj.message) ;
        }
      }else{
          this.notify.notify('info',obj);
      }
      
  }
  public Notify( option:number,message:string):void{
      if(option=== 0){
          this.notify.notify('error',message) ;
      }else if(option=== 1){
          this.notify.notify('success',message) ;
      }else if(option=== 2){
          this.notify.notify('warning',message) ;
      }if(option=== 3){
          this.notify.notify('info',message) ;
      }
  }
  public Error(message){
    this.notify.notify('error',message);
    console.log(message);
  }
}
