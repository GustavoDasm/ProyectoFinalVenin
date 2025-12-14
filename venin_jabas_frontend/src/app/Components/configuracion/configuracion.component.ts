
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Usuario } from 'src/app/Models/usuario/usuario';
import { RangoFechas } from 'src/app/Models/rangofechas/rango-fechas';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';
import { Cliente } from 'src/app/Models/cliente/cliente';
import { HttpResponse } from '@angular/common/http';
import { AlertType } from 'src/app/Models/alert/alert-type';
import { InfoComponent } from '../objects/info/info/info.component';
import { LoadingComponent } from '../objects/loading/loading.component';
import { NothingComponent } from '../objects/nothing/nothing.component';
import { AlertComponent } from '../objects/alert/alert/alert.component';
import { Numero } from 'src/app/Models/numero/numero';
@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {
  @ViewChild('btnclose', null) btnclose: ElementRef;
  @ViewChild('btnshow', null) btnshow: ElementRef;
  @ViewChild(AlertComponent, null) alert: AlertComponent;
  @ViewChild(LoadingComponent, null) loading: LoadingComponent;
  @ViewChild(NothingComponent, null) public nothing: NothingComponent;
  @ViewChild(InfoComponent, null) info: InfoComponent;
  public usuario:Usuario=new Usuario();
  public rangofechas:RangoFechas = new RangoFechas();   
  public tipoinforme=0; 
  public funcion: Function = null;
  public isShow: boolean = false;
  public pagina: number = 0;
  public modal="modal-lg";
  public zindex:number = 10000;
  public cliente:Cliente = new Cliente;
  public serie_boleta:Numero = new Numero;
  public serie_factura:Numero = new Numero;
  public listclientes:Cliente[]=[];
  public alertType:AlertType = new AlertType();
  constructor(private data: DataService,private route:Router,private auth:AuthService) { }
  

  ngOnInit() {
   
  }

  public show(affterfunction: Function = null) {
    this.funcion = affterfunction;
    this.isShow = true;
    this.showTab(1);
    setTimeout(() => {
        this.btnshow.nativeElement.click();
        this.info.hide();
        }, 10);
  }

  showTab(i) {
    this.pagina = i;
    if(this.pagina == 1){this.modal ='modal-lg';}
    else{this.modal='';}
  }


  getSerieBoleta(){
    this.data.Post('search_numero',this.serie_boleta).subscribe(r => {
      if (r.length < 1) {
          console.log(r);
          this.serie_boleta=r;
          return this.serie_boleta;
      }else{
          console.log(r);
      }
    })
  }

  getSerieFactura(){
    this.data.Post('search_numero',this.serie_factura).subscribe(r => {
      if (r.length < 1) {
          console.log(r);
          this.serie_factura=r;
          return this.serie_factura;
      }else{
          console.log(r);
      }
    })
  }


  close() { this.btnclose.nativeElement.click(); }
}