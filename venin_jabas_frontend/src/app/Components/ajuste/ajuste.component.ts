import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Usuario } from 'src/app/Models/usuario/usuario';
import { InfoComponent } from '../objects/info/info/info.component';
import { LoadingComponent } from '../objects/loading/loading.component';
import { AlertComponent } from '../objects/alert/alert/alert.component';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';
import { Ajuste } from 'src/app/Models/ajuste/ajuste';
import { TipoOperacion } from 'src/app/Models/tipooperacion/tipo-operacion';
import { Detajuste } from 'src/app/Models/ajuste/detajuste/detajuste';
import { Motivo } from 'src/app/Models/motivo/motivo';
import { Articulo } from 'src/app/Models/articulo/articulo';
import { ComprasArticuloComponent } from '../compras/compras-detcompra/compras-detcompra.component';
import { AlertType } from 'src/app/Models/alert/alert-type';
import { ALertOption } from 'src/app/Models/alert/alert-option';
import { Moneda } from 'src/app/Models/moneda/moneda';
import { Title } from '@angular/platform-browser';
import { Filtro } from 'src/app/Models/filtro/filtro';
import { AddAjusteComponent } from './add-ajuste/add-ajuste.component';
import * as moment from 'moment';

@Component({
  selector: 'app-ajuste',
  templateUrl: './ajuste.component.html',
  styleUrls: ['./ajuste.component.css']
})
export class AjusteComponent implements OnInit {

  @ViewChild('btnshow', null) btnshowcompr: ElementRef;
  @ViewChild('btnclose', null) btnclose: ElementRef;
  @ViewChild('listadetajuste', null) listadetajuste: ElementRef;
  @ViewChild(ComprasArticuloComponent, null) public frmcomprasdetalles: ComprasArticuloComponent;
  @ViewChild(AlertComponent, null) alert: AlertComponent;
  @ViewChild(LoadingComponent, null) loading: LoadingComponent;
  @ViewChild(InfoComponent, null) info: InfoComponent;
  @ViewChild('txtdireccion', null) txtdireccion: ElementRef;
  @ViewChild(AddAjusteComponent, null) newajuste: AddAjusteComponent;
  public usuario: Usuario = new Usuario();
  public ajuste: Ajuste = new Ajuste();
  public tipos_opera: TipoOperacion[] = [];
  public ajustes: any[] = [];
  public detajustes: Detajuste[] = [];
  public motivos: Motivo[] = [];
  public detajuste: Detajuste = new Detajuste();
  public articulo: Articulo = new Articulo();
  public monedas: Moneda[] = [];
  public alertType: AlertType = new AlertType();
  public options: ALertOption = new ALertOption();
  public isadddetajuste: boolean = false;
  public index: number = 0;
  public numitem: number = 0;
  public tipo_filtro: number = 0;
  public filtro: Filtro = new Filtro();
  public pagarticulo: any;
  
  public fechaHoraActual = new Date();
  constructor(private title: Title, private data: DataService, private auth: AuthService, private route: Router) { }

  ngOnInit() {
    this.title.setTitle('Carga de inventario y/o ingreso de material | Sistema Venin');
    this.usuario = this.auth.getCurrentUser();
    // const firstDayOfMonth = new Date(this.fechaHoraActual.getFullYear(), this.fechaHoraActual.getMonth(), 1);
    // this.filtro.fecini = moment(firstDayOfMonth).format('YYYY-MM-DD');
    // this.filtro.fecfin = moment(this.fechaHoraActual).format('YYYY-MM-DD');
    this.filtro.idsucursal = this.data.getSucursalId()
    this.mostrarFiltro()
  }



  getAjustes() {
    this.data.GetSimple(this.data.api.ajuste).subscribe(r => {
      console.log(r);

      this.ajustes = r;
    })
  }
  reiniciarFiltro() {
    this.filtro = {
      ...this.reiniciarObjetoFiltro(this.filtro), // Copia los campos tipofecha, fecini, fecfin
    };
  }

  // Función para reiniciar el objeto filtro manteniendo tipofecha, fecini, fecfin
  private reiniciarObjetoFiltro(obj: Filtro): Partial<Filtro> {
    const { tipofecha, fecini, fecfin } = obj;
    return { tipofecha, fecini, fecfin };
  }


  mostrarFiltro() {
    console.log(this.filtro);
    this.data.Post('search_ajuste', this.filtro).subscribe(r => {
      console.log(r);
      if (r.status === 'error') {
        this.ajustes = [];
        console.log(r.message);
      } else {
        this.ajustes = r.data;
      }


    }), (e => { this.data.notify(e.message, "Error", this.alertType.error); })

  }


  showfrmajuste() {
    this.newajuste.ajuste = new Ajuste()
    this.newajuste.filtroguia = new Filtro()
    this.newajuste.detajustes = []
    this.newajuste.isedit = false
    this.newajuste.show(() => {
      this.mostrarFiltro();
      console.log("cerrado");
    })
  }

  showViewajuste(i) {
    console.log(i);
    this.newajuste.ajuste = new Ajuste()
    this.newajuste.detajustes = []
    this.newajuste.ajuste = i
    this.newajuste.isedit = true

    this.newajuste.show(() => {
      this.mostrarFiltro();
      console.log("cerrado");
    })
  }

  habilitar(ajuste: any) {
    this.data.wait('Habilitando documento');
    if (!ajuste.idajuste) {
      this.data.notifyClose();
      this.data.notify("Error en el documento", "Error", this.data.alertType.warning)
      return
    }
    const payload = { habilitado: true }

    this.data.Patch(this.data.api.ajuste, ajuste.idajuste.toString(), payload).subscribe(
      (r) => {
        this.data.notifyClose();
        this.data.notify("Actualizado", "Exito", this.data.alertType.success)
      },
      error => { this.data.notify("Error al actualizar", "Error", this.data.alertType.warning) }
    )
  }

}
