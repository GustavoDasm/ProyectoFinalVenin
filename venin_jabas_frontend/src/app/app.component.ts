import { Component } from '@angular/core';
import { AuthService } from './Service/auth.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  public islogin=false;
  public title = 'transmdicas';
  private logincontainer='';
  private logincontentwrapper='';
  constructor(private auth:AuthService){
    if(auth.getCurrentUser() != null){
      this.islogin=true;
    }else{
      this.islogin=false;
    }
  }
}

