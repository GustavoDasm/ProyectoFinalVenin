import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import jsPDF from 'jspdf';
import * as moment from 'moment';
import { Usuario } from 'src/app/Models/usuario/usuario';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';

@Component({
  selector: 'app-planilla-movimientos',
  templateUrl: './planilla-movimientos.component.html',
  styleUrls: ['./planilla-movimientos.component.css']
})
export class PlanillaMovimientosComponent implements OnInit {

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
    public dialogRef: MatDialogRef<PlanillaMovimientosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.filtroForm = this.fb.group({
      fecha_inicio: [moment().startOf('month').format('YYYY-MM-DD'), Validators.required],
      fecha_fin: [moment().format('YYYY-MM-DD'), Validators.required],
      estado: ['EMI'],
      idcliente: [null],
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
      this.dataService.Post('planilla_mov', filtro).subscribe(response => {
        console.log(response);

        if (response) {
          this.generateGuiaSalidaReport(response.data);
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


  buildGuiaSalidaReport(reportData: any) {
    // reportData puede venir como { report: [...] } o como { data: { report: [...] } }
    const report = reportData && (reportData.report || (reportData.data && reportData.data.report)) || [];
    const total_registros = reportData && (reportData.total_registros || (reportData.data && reportData.data.total_registros)) || report.length;

    // Cabecera: columnas principales y bloques por producto
    const head = [[
      'Sucursal',
      'Fecha',
      'Cliente',
      'Transporte',
      'JAVA\nCant.',
      'JAVA\nPrecio',
      'JAVA\nTotal',
      'PAPEL\nCant.',
      'PAPEL\nPrecio',
      'PAPEL\nTotal',
      'PERIÓD\nCant.',
      'PERIÓD\nPrecio',
      'PERIÓD\nTotal',
      'SUMA\nTOTAL',
      'Estado',
      'Referencia'
    ]];

    // Construcción del cuerpo
    const body = (report || []).map((r: any) => {
      const fmtFecha = r.fecha ? (this.formatFecha ? this.formatFecha(r.fecha, 'dd-MM-yyyy') : r.fecha) : '';
      const qty_java = Number(r.java && r.java.cantidad) || 0;
      const price_java = Number(r.java && r.java.precio) || 0;
      const total_java = Number(r.java && r.java.total) || 0;

      const qty_papel = Number(r.papel && r.papel.cantidad) || 0;
      const price_papel = Number(r.papel && r.papel.precio) || 0;
      const total_papel = Number(r.papel && r.papel.total) || 0;

      const qty_period = Number(r.periodico && r.periodico.cantidad) || 0;
      const price_period = Number(r.periodico && r.periodico.precio) || 0;
      const total_period = Number(r.periodico && r.periodico.total) || 0;

      const suma_total = Number(r.suma_total) || (total_java + total_papel + total_period);

      return [
        r.sucursal || '',
        fmtFecha,
        r.cliente || '',
        r.transporte || '',
        qty_java.toString(),
        price_java.toFixed(2),
        total_java.toFixed(2),
        qty_papel.toString(),
        price_papel.toFixed(2),
        total_papel.toFixed(2),
        qty_period.toString(),
        price_period.toFixed(2),
        total_period.toFixed(2),
        suma_total.toFixed(2),
        r.estado || '',
        r.referencia || ''
      ];
    });

    // Calcular totales agregados por columna (para la fila final)
    const totals = {
      qty_java: 0,
      total_java: 0,
      qty_papel: 0,
      total_papel: 0,
      qty_period: 0,
      total_period: 0,
      suma_total: 0
    };

    (report || []).forEach((r: any) => {
      totals.qty_java += Number(r.java && r.java.cantidad) || 0;
      totals.total_java += Number(r.java && r.java.total) || 0;
      totals.qty_papel += Number(r.papel && r.papel.cantidad) || 0;
      totals.total_papel += Number(r.papel && r.papel.total) || 0;
      totals.qty_period += Number(r.periodico && r.periodico.cantidad) || 0;
      totals.total_period += Number(r.periodico && r.periodico.total) || 0;
      totals.suma_total += Number(r.suma_total) || 0;
    });

    // Fila(s) de totales: puedes ajustar el texto/orden como prefieras
    body.push([
      '', // sucursal
      '', // fecha
      '', // cliente
      'TOTALES:',
      totals.qty_java.toString(),
      '', // precio agregado no aplica
      totals.total_java.toFixed(2),
      totals.qty_papel.toString(),
      '',
      totals.total_papel.toFixed(2),
      totals.qty_period.toString(),
      '',
      totals.total_period.toFixed(2),
      totals.suma_total.toFixed(2),
      '',
      ''
    ]);

    // Estilos de columnas (ajusta anchos según tu A4/Landscape)
    const columnStyles = {
      0: { cellWidth: 25, halign: 'left' },   // Sucursal
      1: { cellWidth: 20, halign: 'center' }, // Fecha
      2: { cellWidth: 40, halign: 'left' },   // Cliente
      3: { cellWidth: 35, halign: 'left' },   // Transporte
      4: { cellWidth: 10, halign: 'center' }, // JAVA Cant
      5: { cellWidth: 12, halign: 'right' },  // JAVA Precio
      6: { cellWidth: 12, halign: 'right' },  // JAVA Total
      7: { cellWidth: 10, halign: 'center' }, // PAPEL Cant
      8: { cellWidth: 12, halign: 'right' },  // PAPEL Precio
      9: { cellWidth: 12, halign: 'right' },  // PAPEL Total
      10: { cellWidth: 10, halign: 'center' },// PERIOD Cant
      11: { cellWidth: 12, halign: 'right' }, // PERIOD Precio
      12: { cellWidth: 12, halign: 'right' }, // PERIOD Total
      13: { cellWidth: 12, halign: 'right' }, // Suma total
      14: { cellWidth: 15, halign: 'center' },// Estado
      15: { cellWidth: 30, halign: 'left' }   // Referencia
    };

    // Opciones autoTable (respetando el enfoque que ya usas)
    const autoTableOptions = {
      styles: {
        overflow: 'linebreak',
        fontSize: 5,
        cellPadding: 0.5
      },
      headStyles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 6,
        fillColor: [210, 210, 210],
        fontStyle: 'bold'
      },
      columnStyles,
      // Aplicar negrita/estilo a fila de totales (última fila)
      didParseCell: (data: any) => {
        const rowIndex = data.row.index;
        const totalRowIndex = body.length - 1;
        if (rowIndex === totalRowIndex) {
          // Columna etiqueta (índice 3) se pone en negrita y alineada a la derecha
          if (data.column.index === 3) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.halign = 'right';
          }
          // Las celdas numéricas de totales en negrita
          if ([4, 6, 7, 9, 10, 12, 13].includes(data.column.index)) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.fillColor = [245, 245, 245];
          }
        }
      }
    };

    return {
      head,
      body,
      columnStyles,
      autoTableOptions,
      totals,
      total_registros
    };
  }


  // Genera el PDF (usa jsPDF + autoTable) para GuiasSalida
  generateGuiaSalidaReport(reportData: any) {
    const doc = new jsPDF('landscape');
    const reportStructure = this.buildGuiaSalidaReport(reportData);
    const { head, body, columnStyles, autoTableOptions, totals, total_registros } = reportStructure;

    // Título
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('PLANILLA', 15, 15);

    // Info del reporte: total guías y rango si existe
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total guías: ${total_registros}`, 15, 25);
    // Mostrar rango de fechas del formulario, formateadas y alineadas con la fecha del reporte
    const fechaIniStr = this.formatFecha(this.fechaInicio, 'dd-MM-yyyy');
    const fechaFinStr = this.formatFecha(this.fechaFin, 'dd-MM-yyyy');
    doc.text(`Del periodo ${fechaIniStr} al ${fechaFinStr}`, 120, 15);
    // Fecha de generación
    const fechaActual = new Date();
    const fechaStr = this.formatFecha ? this.formatFecha(fechaActual, 'dd-MM-yyyy HH:mm') : fechaActual.toLocaleString();
    doc.setFontSize(9);
    doc.text('Fecha del reporte: ' + fechaStr, 220, 15);

    // Tabla
    (doc as any).autoTable({
      head: head,
      body: body,
      startY: 35,
      theme: 'grid',
      styles: {
        fontSize: 7,
        cellPadding: 1,
        lineColor: [40, 40, 40],
        textColor: [0, 0, 0],
        lineWidth: 0.05,
        overflow: 'linebreak'
      },
      headStyles: autoTableOptions.headStyles,
      columnStyles: columnStyles,
      didParseCell: autoTableOptions.didParseCell,
      margin: { top: 35, right: 10, bottom: 10, left: 10 },
      pageBreak: 'auto',
      tableWidth: 'wrap',
      showHead: 'everyPage'
    });

    // Opcional: autoPrint si quieres imprimir directo (igual que tenías)
    // doc.autoPrint({ variant: 'non-conform' });

    // Crear blob y abrir en iframe para previsualizar/imprimir
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

    // Además devolver el blob/url por si quieres descargarlo o manejarlo fuera
    return { doc, blob, url };
  }

  GenerarExcel() {
    let ruta = 'planilla_mov'
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
