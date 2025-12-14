import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as moment from 'moment';
import { Usuario } from 'src/app/Models/usuario/usuario';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';

@Component({
  selector: 'app-reporte-general-caja',
  templateUrl: './reporte-general-caja.component.html',
  styleUrls: ['./reporte-general-caja.component.css']
})
export class ReporteGeneralCajaComponent implements OnInit {

  usuario: Usuario = new Usuario();
  filtroForm: FormGroup;
  sucursales: any[] = [];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private datePipe: DatePipe,
    public dataService: DataService,
    public dialogRef: MatDialogRef<ReporteGeneralCajaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.filtroForm = this.fb.group({
      fecha_inicio: [moment().startOf('month').format('YYYY-MM-DD'), Validators.required],
      fecha_fin: [moment().format('YYYY-MM-DD'), Validators.required],
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

  onNoClick(): void {
    this.dialogRef.close();
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

  mostrarPDF() {
    if (this.filtroForm.valid) {
      const filtro = this.filtroForm.value;
      console.log("Filtro seleccionado:", filtro);
      // Aquí se llamaría al servicio para obtener los datos del reporte
      this.dataService.Post('reportegeneral', filtro).subscribe(response => {
        if (response) {
          this.generateReport(response);
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


  generateReport(report: any) {
    const doc = new jsPDF('landscape');

    // construimos la estructura para autoTable
    const { head, body, columnStyles } = this.buildAutoTableFromReportMinimal(report);

    (doc as any).autoTable({
      head: head,
      body: body,
      startY: 20, // Reducido de 20 a 15
      theme: 'grid',
      styles: {
        fontSize: 6,  // Reducido de 7 a 6
        cellPadding: 0.5,  // Reducido de 1 a 0.5
        lineColor: [40, 40, 40],
        textColor: [0, 0, 0],
        lineWidth: 0.05  // Reducido de 0.1 a 0.05
      },
      headStyles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 5,  // Reducido de 8 a 7
        fillColor: [210, 210, 210],  // Gris más claro
        textColor: [0, 0, 0],
        lineWidth: 0.1,  // Reducido de 0.2 a 0.1
        fontStyle: 'bold',
        cellPadding: 0.5  // Añadido para consistencia
      },
      columnStyles: columnStyles,
      margin: { top: 12, right: 5, bottom: 5, left: 5 },  // Márgenes reducidos
      pageBreak: 'auto',
      tableWidth: 'wrap',  // Cambiado de 'auto' a 'wrap' para mejor ajuste
      showHead: 'everyPage',
      overflow: 'linebreak',  // Añadido para manejar overflow
      cellWidth: 'wrap'  // Añadido para mejor ajuste de celdas
    });

    // Añadir título más pequeño
    doc.setFontSize(11);  // Reducido de 12 a 10
    doc.setFont(undefined, 'bold');
    doc.text('REPORTE DE CAJA', 5, 10);  
    doc.setFontSize(9);// Posición ajustada
    doc.setFont(undefined, 'normal');
    doc.text(`Del periodo ${this.formatFecha(this.fechaInicio, 'dd-MM-yyyy')} al periodo ${this.formatFecha(this.fechaFin, 'dd-MM-yyyy')}`, 5, 15);
    doc.text(`Sucursal:  ${this.getNombreSucursalActual()}`, 220, 15);
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

  buildAutoTableFromReportMinimal(report: any) {
    const tiposIng = report.tipos_ingresos || [];
    const tiposSal = report.tipos_salidas || [];

    // Calcular el número total de columnas para gastos
    let totalGastosColumns = 0;
    tiposSal.forEach((cat: any) => {
      if (cat.subcategorias && cat.subcategorias.length > 0) {
        totalGastosColumns += cat.subcategorias.length;
      } else {
        totalGastosColumns += 1;
      }
    });

    // Construir cabecera de tres niveles
    const head = [
      // Primera fila: Encabezados principales
      [
        { content: 'Fecha', rowSpan: 3, styles: { halign: 'center', valign: 'middle' } },
        { content: 'Concepto', rowSpan: 3, styles: { halign: 'center', valign: 'middle' } },
        { content: 'INGRESOS', colSpan: tiposIng.length, styles: { halign: 'center', fillColor: [220, 240, 220] } },
        { content: 'TOTAL INGRESOS', rowSpan: 3, styles: { halign: 'center', fillColor: [200, 230, 200], fontStyle: 'bold' } },
        { content: 'GASTOS', colSpan: totalGastosColumns, styles: { halign: 'center', fillColor: [240, 220, 220] } },
        { content: 'TOTAL GASTOS', rowSpan: 3, styles: { halign: 'center', fillColor: [230, 200, 200], fontStyle: 'bold' } },
        { content: 'EFECTIVO DEL DIA', rowSpan: 3, styles: { halign: 'center', valign: 'middle', fontStyle: 'bold' } }
      ],
      // Segunda fila: Categorías principales
      [
        // Ingresos (categorías principales)
        ...tiposIng.map((cat: any) => ({
          content: cat.descripcion,
          styles: { halign: 'center', fillColor: [230, 250, 230] }
        })),
        // Espacio para TOTAL INGRESOS (rowSpan)
        // { content: '', styles: { fillColor: [200, 230, 200] } },
        // Gastos (categorías principales con colspan para sus subcategorías)
        ...tiposSal.flatMap((cat: any) => {
          if (cat.subcategorias && cat.subcategorias.length > 0) {
            return [{
              content: cat.descripcion,
              colSpan: cat.subcategorias.length,
              styles: { halign: 'center', fillColor: [250, 230, 230] }
            }];
          } else {
            return [{
              content: cat.descripcion,
              colSpan: 1,
              styles: { halign: 'center', fillColor: [250, 230, 230] }
            }];
          }
        }),
        // Espacio para TOTAL SALIDAS (rowSpan)
        { content: '', styles: { fillColor: [230, 200, 200] } }
      ],
      // Tercera fila: Subcategorías
      [
        // Ingresos (no tienen subcategorías)
        ...tiposIng.map(() => ({ content: '', styles: { fillColor: [240, 255, 240] } })),
        // Espacio para TOTAL INGRESOS (rowSpan)
        // { content: '', styles: { fillColor: [200, 230, 200] } },
        // Gastos (subcategorías)
        ...tiposSal.flatMap((cat: any) => {
          if (cat.subcategorias && cat.subcategorias.length > 0) {
            return cat.subcategorias.map((sub: any) => ({
              content: sub.descripcion,
              styles: { halign: 'center', fillColor: [255, 240, 240] }
            }));
          } else {
            return [{ content: '', styles: { fillColor: [255, 240, 240] } }];
          }
        }),
        // Espacio para TOTAL SALIDAS (rowSpan)
        { content: '', styles: { fillColor: [230, 200, 200] } }
      ]
    ];

    const body: any[] = [];

    // Procesar filas de datos
    (report.rows || []).forEach((r: any) => {
      const row: any[] = [];

      // Fecha y Concepto
      row.push(r.fecha || '');
      row.push(r.concepto || '');

      // Ingresos (categorías principales)
      tiposIng.forEach((cat: any) => {
        row.push(r[cat.col] !== null && r[cat.col] !== undefined ? r[cat.col] : '');
      });

      // 🔹 NUEVO: TOTAL INGRESOS por fila
      row.push(r.total_ingreso !== null && r.total_ingreso !== undefined ? r.total_ingreso : '');

      // Gastos (todas las columnas: principales y subcategorías)
      tiposSal.forEach((cat: any) => {
        if (cat.subcategorias && cat.subcategorias.length > 0) {
          cat.subcategorias.forEach((sub: any) => {
            row.push(r[sub.col] !== null && r[sub.col] !== undefined ? r[sub.col] : '');
          });
        } else {
          row.push(r[cat.col] !== null && r[cat.col] !== undefined ? r[cat.col] : '');
        }
      });

      // 🔹 NUEVO: TOTAL SALIDAS por fila
      row.push(r.total_salida !== null && r.total_salida !== undefined ? r.total_salida : '');

      // Saldo
      row.push(r.saldo !== null && r.saldo !== undefined ? r.saldo : '');

      body.push(row);
    });

    // Añadir fila de totales
    if (report.totales) {
      const totRow: any[] = [];
      totRow.push('');
      totRow.push('TOTALES');

      // Totales de ingresos
      tiposIng.forEach((cat: any) => {
        totRow.push(report.totales[cat.col] || '');
      });

      // 🔹 NUEVO: TOTAL GENERAL INGRESOS
      totRow.push(report.totales.total_ingreso || '');

      // Totales de gastos
      tiposSal.forEach((cat: any) => {
        if (cat.subcategorias && cat.subcategorias.length > 0) {
          cat.subcategorias.forEach((sub: any) => {
            totRow.push(report.totales[sub.col] || '');
          });
        } else {
          totRow.push(report.totales[cat.col] || '');
        }
      });

      // 🔹 NUEVO: TOTAL GENERAL SALIDAS
      totRow.push(report.totales.total_salida || '');

      // Saldo final
      const lastSaldo = (report.rows && report.rows.length) ?
        report.rows[report.rows.length - 1].saldo : report.opening_balance;
      totRow.push(lastSaldo || '');

      body.push(totRow);
    }

    // Estilos de columnas
    const columnStyles: any = {
      0: { halign: 'center', cellWidth: 15, valign: 'middle' },
      1: { halign: 'left', cellWidth: 30, valign: 'middle' }
    };

    // Columnas de ingresos
    const ingresosStartCol = 2;
    const ingresosEndCol = ingresosStartCol + tiposIng.length;
    for (let i = ingresosStartCol; i < ingresosEndCol; i++) {
      columnStyles[i] = { halign: 'right', cellWidth: 15, valign: 'middle' };
    }

    // 🔹 NUEVO: Columna TOTAL INGRESOS
    columnStyles[ingresosEndCol] = { halign: 'right', cellWidth: 15, fontStyle: 'bold', valign: 'middle', fillColor: [240, 255, 240] };

    // Columnas de gastos
    const gastosStartCol = ingresosEndCol + 1;
    const gastosEndCol = gastosStartCol + totalGastosColumns;
    for (let i = gastosStartCol; i < gastosEndCol; i++) {
      columnStyles[i] = { halign: 'right', cellWidth: 15, valign: 'middle' };
    }

    // 🔹 NUEVO: Columna TOTAL SALIDAS
    columnStyles[gastosEndCol] = { halign: 'right', cellWidth: 15, fontStyle: 'bold', valign: 'middle', fillColor: [255, 240, 240] };

    // Columna Saldo
    columnStyles[gastosEndCol + 1] = { halign: 'right', cellWidth: 15, fontStyle: 'bold', valign: 'middle' };

    return { head, body, columnStyles };
  }

}
