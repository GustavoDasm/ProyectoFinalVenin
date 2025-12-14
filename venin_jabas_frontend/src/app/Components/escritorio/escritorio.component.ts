import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';
import { PlanillaMovimientosComponent } from '../planilla-movimientos/planilla-movimientos.component';
import { ReporteCuentaClienteComponent } from '../reporte-cuenta-cliente/reporte-cuenta-cliente.component';
import { ReporteGeneralCajaComponent } from '../reporte-general-caja/reporte-general-caja.component';
import { KardexComponent } from '../kardex/kardex.component';

interface ManagedWindow {
  [key: string]: Window | null;
}

@Component({
  selector: 'app-escritorio',
  templateUrl: './escritorio.component.html',
  styleUrls: ['./escritorio.component.css']
})
export class EscritorioComponent implements OnInit {

  private windowManager: ManagedWindow = {};

  @ViewChild(KardexComponent, null) modalkardex: KardexComponent;
  constructor(private auth: AuthService, private data: DataService, public dialog: MatDialog) { }

  ngOnInit() {
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

  showmodal_kardex() {
    this.modalkardex.show(() => {
    })
  }
}
