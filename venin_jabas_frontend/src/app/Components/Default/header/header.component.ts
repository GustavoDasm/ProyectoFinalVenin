import { Component, OnInit, ViewChild } from '@angular/core';
import { Usuario } from 'src/app/Models/usuario/usuario';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';
import { ConfiguracionComponent } from '../../configuracion/configuracion.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  @ViewChild(ConfiguracionComponent, null) config: ConfiguracionComponent;
  public usuario:Usuario= new Usuario();
  public logo:string='';
  public nombre:string='';
  constructor(private auth:AuthService,private data: DataService) { 
    
    if(auth.getCurrentUser() != null){
      this.usuario = auth.getCurrentUser();
    }else{
      this.usuario = new Usuario();
    }
  }

  ngOnInit() {
    this.getEmpresa();
  } 
  isLogin(){
    if(this.auth.getCurrentUser() != undefined){
      
      return true;
    } else{ return false;}
  }

  getEmpresa(){
    this.data.GetSimple(this.data.api.empresa).subscribe(r=>{
      //console.log("Empresa:",r);
      
      this.nombre=r[0].nombrecomercial
      this.logo=r[0].logo
    }), (error) => {
      console.log(error);
      
    };
  }

  showConfig(){
    this.config.show(() =>{
    })
  }

  salir(){
    this.auth.logoutUser();

  }

}
