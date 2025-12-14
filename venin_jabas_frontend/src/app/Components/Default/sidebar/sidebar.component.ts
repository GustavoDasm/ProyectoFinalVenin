import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';
import { environment } from 'src/environments/environment';
import { Nivel } from '../../../Models/nivel/nivel';
import { Usuario } from '../../../Models/usuario/usuario';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  public usuario :Usuario = new Usuario();
  public buttontop:string='Nueva Programación';
  constructor(private auth:AuthService, private data:DataService) { }
  logout(){
    this.auth.logoutUser();
  }
  ngOnInit() {
    this.usuario = this.auth.getCurrentUser();
  }
}
