import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as moment from 'moment';
import { Usuario } from 'src/app/Models/usuario/usuario';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';

@Component({
  selector: 'app-reporte-cuenta-cliente',
  templateUrl: './reporte-cuenta-cliente.component.html',
  styleUrls: ['./reporte-cuenta-cliente.component.css']
})
export class ReporteCuentaClienteComponent implements OnInit {

  usuario: Usuario = new Usuario();
  filtroForm: FormGroup;
  clientes: any[] = [];
  loadingClientes: boolean = false;
  sucursales: any[] = [];

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
      idcliente: [null, Validators.required],
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

  mostrarPDF() {
    if (this.filtroForm.valid) {
      const filtro = this.filtroForm.value;
      console.log("Filtro seleccionado:", filtro);
      // Aquí se llamaría al servicio para obtener los datos del reporte
      this.dataService.Post('cuenta_cliente', filtro).subscribe(response => {
        console.log(response);

        if (response) {
          this.generateCuentaClienteReport(response.data);
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


  buildCuentaClienteReport(reportData: any) {
    const { cliente, detalles, resumen } = reportData;

    // Cabeceras de la tabla (añadimos Documento)
    const head = [[
      'Día',
      'Documento',
      'Producto',
      'Cantidad',
      'Precio',
      'Total'
    ]];

    // Construcción del cuerpo de la tabla
    const body = (detalles || []).map((detalle: any) => {
      // Usamos directamente el campo idguiar y lo compactamos como G{id}
      const idguiar = detalle.idguiar;
      const documento = idguiar !== undefined && idguiar !== null ? `GUIA - ${idguiar}` : '';

      return [
        this.formatFecha(detalle.fecha, 'dd-MM-yyyy'),
        documento,
        detalle.producto || '',
        (Number(detalle.cantidad) || 0).toString(),
        (Number(detalle.precio) || 0).toFixed(2),
        (Number(detalle.total) || 0).toFixed(2)
      ];
    });

    // Calcular totales desde el resumen (si no viene, valores por defecto)
    const totalGeneral = resumen && resumen.total_general ? Number(resumen.total_general) : 0;
    const totalCantidad = resumen && resumen.total_cantidad ? Number(resumen.total_cantidad) : 0;
    const totalPago = resumen && resumen.total_pago ? Number(resumen.total_pago) : 0;

    // Calcular saldo actual (por si no vino en resumen)
    const saldoActual = (resumen && resumen.saldo_actual !== undefined)
      ? Number(resumen.saldo_actual)
      : (totalGeneral - totalPago);

    // Añadir fila de totales (las tres filas pedidas)
    body.push([
      '',
      '',
      'TOTALES:',
      totalCantidad.toString(),
      '',
      totalGeneral.toFixed(2)
    ]);

    body.push([
      '',
      '',
      'TOTAL PAGOS:',
      '',
      '',
      totalPago.toFixed(2)
    ]);

    body.push([
      '',
      '',
      'SALDO ACTUAL:',
      '',
      '',
      saldoActual.toFixed(2)
    ]);

    // Estilos de columnas (ajustados por la nueva columna)
    // Ajusta valores si usas unidades distintas; son valores razonables para jsPDF en mm/papeles A4.
    const columnStyles = {
      0: { cellWidth: 30, halign: 'center' },  // Día
      1: { cellWidth: 30, halign: 'center', overflow: 'ellipsize' }, // Documento (corto y con ellipsize)
      2: { cellWidth: 100, halign: 'left' },   // Producto (más ancho)
      3: { cellWidth: 20, halign: 'center' },  // Cantidad
      4: { cellWidth: 25, halign: 'right' },   // Precio
      5: { cellWidth: 25, halign: 'right' }    // Total
    };

    // Opciones para autoTable (evita el warning deprecado: usar styles.overflow)
    const autoTableOptions = {
      styles: {
        overflow: 'linebreak' // por defecto para las demás columnas
      },
      columnStyles,
      // Resaltamos las filas de totales en negrita y las alineamos a la derecha
      didParseCell: (data: any) => {
        // data.cell.raw contiene el valor original de la celda
        const raw = String(data.cell.raw || '');
        if (raw === 'TOTALES:' || raw === 'TOTAL PAGOS:' || raw === 'SALDO ACTUAL:') {
          // fila de totales: hacemos negrita y alineamos texto a la derecha en la celda de label
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'right';
        }
        // Para las celdas numéricas de las filas de totales (columna Total) también poner negrita
        // detectamos si la fila actual es una de las últimas 3 filas
        const bodyRowIndex = data.row.index;
        const totalRows = body.length;
        if (bodyRowIndex >= totalRows - 3 && data.column.index === 5) {
          data.cell.styles.fontStyle = 'bold';
        }
      }
    };

    return {
      head,
      body,
      columnStyles,
      totalGeneral,
      totalCantidad,
      totalPago,
      saldoActual,
      cliente,
      autoTableOptions
    };
  }



  // Método principal para generar el reporte de cuenta cliente
  generateCuentaClienteReport(reportData: any) {
    const doc = new jsPDF('landscape');
    console.log("Generando reporte con datos:", reportData);

    // Construir la estructura para autoTable
    const reportStructure = this.buildCuentaClienteReport(reportData);
    const { head, body, columnStyles, cliente } = reportStructure;

    // Añadir título del documento
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('CUENTA CLIENTE', 15, 15);

    // Añadir nombre del cliente
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.text('Cliente: ' + (cliente || 'Sin especificar'), 15, 25);

    // Añadir fecha del reporte
    const fechaActual = new Date();
    doc.setFontSize(9);
    doc.text('Fecha del reporte: ' + this.formatFecha(fechaActual, 'dd-MM-yyyy HH:mm'), 220, 15);

    // Configuración de la tabla
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
        lineWidth: 0.05
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
      overflow: 'linebreak',
      cellWidth: 'wrap',
      // Aplicar estilo especial a la fila de totales
      didParseCell: function (data: any) {
        if (data.row.index === body.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [240, 240, 240];
        }
      }
    });

    // Configurar impresión automática
    doc.autoPrint({ variant: 'non-conform' });

    // Crear y mostrar el PDF para impresión
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
    let ruta = 'cuenta_cliente'
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
