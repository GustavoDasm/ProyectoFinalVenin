import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as moment from 'moment';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Usuario } from 'src/app/Models/usuario/usuario';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';
import { ReporteCuentaClienteComponent } from '../reporte-cuenta-cliente/reporte-cuenta-cliente.component';

@Component({
  selector: 'app-reporte-ventas-medio-pago',
  templateUrl: './reporte-ventas-medio-pago.component.html',
  styleUrls: ['./reporte-ventas-medio-pago.component.css']
})
export class ReporteVentasMedioPagoComponent implements OnInit {

  usuario: Usuario = new Usuario();
  filtroForm: FormGroup;
  clientes: any[] = [];
  loadingClientes: boolean = false;
  sucursales: any[] = [];
  tiposPago: any[] = [];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private datePipe: DatePipe,
    public dataService: DataService,
    public dialogRef: MatDialogRef<ReporteCuentaClienteComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.filtroForm = this.fb.group({
      fecha_inicio: [moment().startOf('month').format('YYYY-MM-DD'), Validators.required],
      fecha_fin: [moment().format('YYYY-MM-DD'), Validators.required],
      estado: ['EMI'],
      idcliente: [null],
      tipo_pago: ['01'],
      idsucursal: [Number(dataService.getSucursalId()) || null, Validators.required]
    });
    this.usuario = this.auth.getCurrentUser();
  }

  get fechaInicio(): string {
    return this.filtroForm.get('fecha_inicio').value;
  }

  get fechaFin(): string {
    return this.filtroForm.get('fecha_fin').value;
  }

  getNombreSucursalActual(): string {
    const idsucursal = this.filtroForm.get('idsucursal').value;
    const sucursal = this.sucursales.find(s => s.idsucursal === idsucursal);
    return sucursal ? sucursal.nombre : '';
  }

  ngOnInit() {
    this.getSucursales();
    this.getTiposPago();
  }

  getSucursales() {
    this.dataService.GetSimple('sucursal').subscribe(
      (res) => {
        this.sucursales = res;
      }, (error) => {
        console.error('Error al obtener sucursales:', error);
      }
    );
  }

  onSearchCliente(term: string) {
    // opcional: filtrar si term es muy corto
    console.log("Buscando cliente con término:", term);
    if (!term || term.length < 2) {
      this.clientes = [];
      console.log("Término muy corto, limpiando lista de clientes.");
      return;
    }
    const searchPayload = { apellidos: term };  // o el campo que uses en backend para filtrar
    this.search_cliente(searchPayload);
  }

  search_cliente(searchParams: any) {
    this.loadingClientes = true;
    console.log("Enviando búsqueda con parámetros:", searchParams);

    this.dataService.Post("search_cliente", searchParams).subscribe(
      (r) => {
        this.loadingClientes = false;
        console.log("Respuesta del servidor:", r);
        if (!r || r.message !== "success") {
          console.error("Error en respuesta del backend:", r);
          this.clientes = [];
        } else {
          const items = r.data.map((item) => ({
            ...item,
            apellidoscompleto: item.apellidos || 'Sin nombre',
          }));
          console.log("Clientes formateados:", items);
          this.clientes = items;
        }
      },
      (e) => {
        this.loadingClientes = false;
        this.clientes = [];
        console.error("Error HTTP al buscar cliente:", e);
      }
    );
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getTiposPago(){
    this.dataService.GetSimple('tarjetacre').subscribe((res:any)=>{
      this.tiposPago = res;
      this.tiposPago.push({codigo:null, nombre:'Todos'});
      console.log("Tipos de pago:", this.tiposPago);
    })
  }

  mostrarPDF() {
    console.log("Generando reporte con filtro:", this.filtroForm.value);
    
    if (this.filtroForm.valid) {
      const filtro = this.filtroForm.value;
      console.log("Filtro seleccionado:", filtro);
      // Aquí se llamaría al servicio para obtener los datos del reporte
      this.dataService.Post('metodo_pago', filtro).subscribe(response => {
        console.log(response);

        if (response) {
          this.generateDetallePagoReport(response.data);
        } else {
          // Manejar error o mostrar mensaje
          console.error('Error al generar el reporte:', response);
        }
      });

    }
  }

  formatFecha(fecha: Date | string, format: string): string {
    // Formatear la fecha a 'dd-MM-yyyy'
    return this.datePipe.transform(fecha, format) || '';
  }


  buildDetallePagoReport(reportData: any = {}) {
  const { cliente = '', detalles = [], resumen = {} } = reportData;

  const head = [[
    'Día',          // fecha de la GuiaSalida
    'Cliente',
    'Referencia',   // DetallePago.referencias
    'Fecha Pago',   // DetallePago.fechaPago
    'Método Pago',  // metodopago (nombre o código resuelto)
    'Total'         // importe de DetallePago
  ]];

  const body = (detalles || []).map((detalle: any) => {
    return [
      this.formatFecha(detalle.fecha, 'dd-MM-yyyy') || '',
      detalle.cliente || '',
      detalle.referencia || '',
      this.formatFecha(detalle.fechaPago, 'dd-MM-yyyy') || '',
      detalle.metodopago || '',
      (Number(detalle.total) || 0).toFixed(2)
    ];
  });

  // Total general (desde resumen o calculado)
  const totalGeneral = resumen && resumen.total_general
    ? Number(resumen.total_general)
    : (detalles || []).reduce((acc: number, d: any) => acc + (Number(d.total) || 0), 0);

  // Solo UNA fila de totales (según tu pedido)
  body.push([
    '',
    '',
    'TOTALES:',
    '',
    '',
    totalGeneral.toFixed(2)
  ]);

  const columnStyles = {
    0: { cellWidth: 30, halign: 'center' },
    1: { cellWidth: 80, halign: 'left' },
    2: { cellWidth: 60, halign: 'left', overflow: 'ellipsize' },
    3: { cellWidth: 30, halign: 'center' },
    4: { cellWidth: 50, halign: 'left' },
    5: { cellWidth: 25, halign: 'right' }
  };

  const autoTableOptions = {
    styles: { overflow: 'linebreak' },
    columnStyles,
    didParseCell: (data: any) => {
      const raw = String(data.cell.raw || '');
      // etiqueta de totales en negrita y alineada a la derecha
      if (raw === 'TOTALES:') {
        data.cell.styles.fontStyle = 'bold';
        data.cell.styles.halign = 'right';
      }
      // valor numérico en la última columna de la última fila -> negrita
      const bodyRowIndex = data.row.index;
      const totalRows = body.length;
      if (bodyRowIndex === totalRows - 1 && data.column.index === 5) {
        data.cell.styles.fontStyle = 'bold';
      }
    }
  };

  return {
    head,
    body,
    columnStyles,
    totalGeneral,
    cliente,
    autoTableOptions
  };
}

/** Genera e imprime el PDF (Angular 8) para DetallePago — sin totalPago ni saldoActual */
generateDetallePagoReport(reportData: any) {
  const doc = new jsPDF('landscape');
  console.log('Generando reporte DetallePago con datos:', reportData);

  const reportStructure = this.buildDetallePagoReport(reportData);
  const { head, body, columnStyles, cliente, autoTableOptions } = reportStructure;

  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('CUENTA - DETALLE PAGOS', 15, 15);

  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Cliente: ' + (cliente || 'Sin especificar'), 15, 25);

  const fechaActual = new Date();
  doc.setFontSize(9);
  doc.text('Fecha del reporte: ' + this.formatFecha(fechaActual, 'dd-MM-yyyy HH:mm'), 220, 15);

  (doc as any).autoTable({
    head: head,
    body: body,
    startY: 35,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 1,
      lineColor: [40, 40, 40],
      textColor: [0, 0, 0],
      lineWidth: 0.05,
      overflow: 'linebreak'
    },
    headStyles: {
      halign: 'center',
      valign: 'middle',
      fontSize: 9,
      fillColor: [210, 210, 210],
      textColor: [0, 0, 0],
      lineWidth: 0.1,
      fontStyle: 'bold',
      cellPadding: 1
    },
    columnStyles: columnStyles,
    margin: { top: 35, right: 10, bottom: 10, left: 15 },
    pageBreak: 'auto',
    tableWidth: 'wrap',
    showHead: 'everyPage',
    didParseCell: autoTableOptions.didParseCell
  });

  // autoPrint y abrir iframe para impresión (igual que antes)
  doc.autoPrint({ variant: 'non-conform' });

  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);

  iframe.onload = () => {
    if (iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  };
}

  GenerarExcel() {
    let ruta = 'metodo_pago'
    const filtro = this.filtroForm.value;
    this.dataService.GenerateExcel(ruta, filtro).subscribe(r => {
      console.log(r);

      if (r.download_url) {
        window.open(this.dataService.api.apiBaseUrl + 'api/download_excel' + r.download_url, '_blank');
        // Establecer un retraso antes de eliminar el archivo
        setTimeout(() => {
          this.dataService.DeleteExcel(r.download_url).subscribe(r => console.log(r));
        }, 20000); // 10000 milisegundos = 10 segundos
      }
    }, (error) => {
      this.data.notify("Error al generar excel", "Error", this.dataService.alertType.error);
    });
  }

}
