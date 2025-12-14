import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../Service/auth.service';
import { DataService } from 'src/app/Service/data.service';
import { Usuario } from 'src/app/Models/usuario/usuario';
import { SelectSucursalComponent } from '../../select-sucursal/select-sucursal.component';
import { EditEmpresaComponent } from '../../edit-empresa/edit-empresa.component';
import { MatDialog } from '@angular/material';
import { ReporteGeneralCajaComponent } from '../../reporte-general-caja/reporte-general-caja.component';
import { ReporteCuentaClienteComponent } from '../../reporte-cuenta-cliente/reporte-cuenta-cliente.component';
import { KardexComponent } from '../../kardex/kardex.component';
import { PlanillaMovimientosComponent } from '../../planilla-movimientos/planilla-movimientos.component';
import { ReporteVentasMedioPagoComponent } from '../../reporte-ventas-medio-pago/reporte-ventas-medio-pago.component';

interface ManagedWindow {
  [key: string]: Window | null;
}

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  public nombre;
  public usuario: Usuario = new Usuario();
  public nivel: any;
  public islogin: boolean = false;
  public sucursal: string = "";
  @ViewChild(SelectSucursalComponent, null) modal_sucursal: SelectSucursalComponent;
  @ViewChild(EditEmpresaComponent, null) modal_empresa: EditEmpresaComponent;
  @ViewChild(KardexComponent, null) modalkardex: KardexComponent;
  private windowManager: ManagedWindow = {};

  constructor(private auth: AuthService, private data: DataService, public dialog: MatDialog) { }

  ngOnInit() {
    if (this.auth.getCurrentUser() != undefined) {
      this.usuario = this.auth.getCurrentUser();
      console.log("Usuario encontrado:", this.usuario)

      this.data.getSucursalObj().subscribe((obj) => {
        this.sucursal = obj.nombre;
      }, (error) => { console.log(error.error) });
      console.log(this.sucursal);
    }
    else { this.usuario = new Usuario(); }

    this.trackClosedWindows();
  }
  logout() {
    this.auth.logoutUser();
  }
  cerrar_sistema() {
    this.auth.logoutUser();
  }

  isLogin() {
    if (this.auth.getCurrentUser() != undefined) {
      return true;
    } else { return false; }
  }
  show_sucursal() {
    this.modal_sucursal.show(() => {
    })
  }


  show_empresa() {
    this.modal_empresa.show(() => {
      this.reloadPage();
    })
  }

  openLink(route: string): void {
    // Normaliza el nombre de la ventana
    const windowName = route.replace(/\//g, '_');
    const winRef = this.windowManager[windowName];
    const baseUrl = window.location.origin;

    // Construye la URL completa
    let fullUrl: string;

    if (route === '') {
      fullUrl = `${baseUrl}`;
    } else if (route.startsWith('/')) {
      fullUrl = `${baseUrl}${route}`;
    } else {
      fullUrl = `${baseUrl}/${route}`;
    }

    // Verificar si la ventana existe y no está cerrada
    if (winRef && winRef.closed === false) {
      // Enfoca la ventana existente SIN recargar
      winRef.focus();

      // No actualices la URL ni recargues
      // Solo mantén el foco en la ventana existente
    } else {
      // Abre nueva ventana
      this.windowManager[windowName] = window.open(fullUrl, windowName);
    }
  }

  // Limpiar referencias de ventanas cerradas
  trackClosedWindows() {
    setInterval(() => {
      for (const key in this.windowManager) {
        if (this.windowManager.hasOwnProperty(key)) {
          const win = this.windowManager[key];
          if (win && win.closed) {
            this.windowManager[key] = null;
          }
        }
      }
    }, 5000);
  }


  reloadPage() {
    window.location.reload();
  }

  reporteGeneralCaja() {
    const dialogRef = this.dialog.open(ReporteGeneralCajaComponent, {
      width: '90vw',
      maxWidth: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  reporteCuentaCliente() {
    const dialogRef = this.dialog.open(ReporteCuentaClienteComponent, {
      width: '90vw',
      maxWidth: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  reportePlanillas() {
    const dialogRef = this.dialog.open(PlanillaMovimientosComponent, {
      width: '90vw',
      maxWidth: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  reporteVentasMetodoPago() {
    const dialogRef = this.dialog.open(ReporteVentasMedioPagoComponent, {
      width: '90vw',
      maxWidth: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {

    });
  }

  showmodal_kardex(){
    this.modalkardex.show(() =>{
    })
  }
}
