import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { AlertType } from 'src/app/Models/alert/alert-type';
import { Cliente } from 'src/app/Models/cliente/cliente';
import { RangoFechas } from 'src/app/Models/rangofechas/rango-fechas';
import { Usuario } from 'src/app/Models/usuario/usuario';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';
import { Articulo } from 'src/app/Models/articulo/articulo';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Filtro } from 'src/app/Models/filtro/filtro';
import { InfoComponent } from '../objects/info/info/info.component';
import { LoadingComponent } from '../objects/loading/loading.component';
import { NothingComponent } from '../objects/nothing/nothing.component';
import { AlertComponent } from '../objects/alert/alert/alert.component';
@Component({
  selector: 'app-kardex',
  templateUrl: './kardex.component.html',
  styleUrls: ['./kardex.component.css']
})
export class KardexComponent implements OnInit {

  @ViewChild('btnclose', null) btnclose: ElementRef;
  @ViewChild('btnshow', null) btnshow: ElementRef;
  @ViewChild(AlertComponent, null) alert: AlertComponent;
  @ViewChild(LoadingComponent, null) loading: LoadingComponent;
  @ViewChild(NothingComponent, null) public nothing: NothingComponent;
  @ViewChild(InfoComponent, null) info: InfoComponent;
  tipoKardex: number = 1;
  public usuario: Usuario = new Usuario();
  public rangofechas: RangoFechas = new RangoFechas();
  public tipoinforme = 0;
  public funcion: Function = null;
  public isShow: boolean = false;
  public pagina: number = 0;
  public modal = "modal-lg";
  public zindex: number = 10000;
  public cliente: Cliente = new Cliente;
  public listakardex: any[] = [];
  public listakardexval: any[] = [];
  public listageneral: any[] = [];

  public listakardexval_format: any[] = [];
  public totalentradas: number = 0;
  public totalsalidas: number = 0;
  public totaltarjetas: number = 0;
  public totalentradasval: number = 0;
  public totalsalidasval: number = 0;
  public today = new Date();
  public empresa: any;
  public pagventas: any = 0;
  public articulos: Articulo[] = [];
  public alertType: AlertType = new AlertType();
  public articulo: Articulo = new Articulo();
  constructor(private data: DataService, private route: Router, private auth: AuthService) { }


  ngOnInit() {

  }

  public show(affterfunction: Function = null) {
    this.funcion = affterfunction;
    this.isShow = true;
    this.setInitialDates();
    this.showTab(1);
    this.getArticulos();
    this.getEmpresa()
    this.tipoKardex = 1
    setTimeout(() => {
      this.btnshow.nativeElement.click();
      this.info.hide();
    }, 10);
  }

  getEmpresa() {
    this.data.GetSimple(this.data.api.empresa).subscribe(r => {
      console.log("Empresa:", r);
      this.empresa = r[0];
    }), (error) => {
      console.log(error);

    };
  }

  customSearchFn(term: string, item: any): boolean {
    term = term.toLowerCase();
    return item.nombre.toLowerCase().includes(term)
  }

  async Kardex() {

    await this.GetDataKardex();
    // Llama a GetTotalCompras solo después de que GetData se haya completado
    await this.GetKardex();
    await this.getArticulo();
  }

  async KardexVal() {

    await this.GetDataKardexVal();
    // Llama a GetTotalCompras solo después de que GetData se haya completado
    await this.getKardexVal();
    await this.getArticulo();
  }

  async KardexGeneral() {

    await this.GetDataKardexGeneral();
  }
  async GetDataKardexGeneral() {
    console.log(this.rangofechas);
    let filtro = new Filtro()
    filtro.fecini = this.rangofechas.fecini
    filtro.fecfin = this.rangofechas.fecfin
    filtro.id = this.rangofechas.id
    filtro.idsucursal = this.data.getSucursalId()
    console.log("Enviado: ", filtro);
    console.log("Kardex general");

    await this.data.AsyncPost('kardexgeneral', filtro).then(r => {
      console.log(r);
      if (r.length < 1) {
        console.error("Error");
      } else {
        this.listageneral = r


      }
    }).catch(e => { console.log(e) });
  }

  async getArticulo() {
    this.data.GetFromId(this.data.api.articulos, this.rangofechas.id).subscribe(r => {
      console.log("Articulo:", r);
      this.articulo = r;
    }), (error) => {
      console.log(error);

    };
  }


  async GetKardex() {
    this.listakardex.forEach(kardex => {
      if (kardex.tipomovimiento === 'ENTRADA') {
        this.totalentradas += +kardex.cantidad
        console.log(this.totalentradas);

      } else if (kardex.tipomovimiento === 'SALIDA') {
        this.totalsalidas += +kardex.cantidad
        console.log(this.totalsalidas);
      }
    });
  }

  showTab(i) {
    this.pagina = i;
    if (this.pagina == 1) { this.modal = 'modal-lg'; }
    else { this.modal = ''; }
  }

  async GetDataKardex() {
    console.log(this.rangofechas);
    let filtro = new Filtro()
    filtro.fecini = this.rangofechas.fecini
    filtro.fecfin = this.rangofechas.fecfin
    filtro.id = this.rangofechas.id
    filtro.idsucursal = this.data.getSucursalId()
    console.log("Enviado: ", filtro);

    await this.data.AsyncPost(this.data.api.kardex, filtro).then(r => {
      console.log(r);
      if (r.length < 1) {
        console.error("Error");
      } else {
        this.listakardex = r;


      }
    }).catch(e => { console.log(e) });
  }

  async GetDataKardexVal() {
    console.log(this.rangofechas);
    let filtro = new Filtro()
    filtro.fecini = this.rangofechas.fecini
    filtro.fecfin = this.rangofechas.fecfin
    filtro.id = this.rangofechas.id
    filtro.idsucursal = this.data.getSucursalId()
    console.log("Enviado: ", filtro);

    await this.data.AsyncPost('kardexval', filtro).then(r => {
      console.log(r);
      if (r.length < 1) {
        console.error("Error");
      } else {
        this.listakardexval = r;


      }
    }).catch(e => { console.log(e) });
  }

  async getKardexVal() {
    const newformat = this.parseKardexRow(this.listakardexval)
    this.listakardexval_format = newformat;
    this.listakardexval_format.forEach(kardex => {
      this.totalentradas += +kardex.entcantidad
      this.totalsalidas += +kardex.salcantidad
      this.totalentradasval += +kardex.entsaldo
      this.totalsalidasval += +kardex.salidasaldo;
      // if (kardex.entcantidad > 0) {

      //   console.log(this.totalentradasval);

      // } else if (kardex.salcantidad > 0) {
      //   this.totalsalidasval += +kardex.salcantidad
      //   console.log(this.totalsalidasval);
      // }

    });
    console.log(this.listakardexval_format);

  }

  setInitialDates() {
    const today = new Date();
    this.rangofechas.fecfin = this.formatearFechas(today);

    // Obtener el primer día del mes
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    this.rangofechas.fecini = this.formatearFechas(firstDayOfMonth);
  }

  formatearFechas(fecha) {
    const parsedDate = moment(fecha, 'DD-MM-YYYY');
    fecha = parsedDate.format('YYYY-MM-DD');
    return fecha;
  }

  setRango() {
    let fechainicio = this.formatearFechas(this.rangofechas.fecini);
    let fechafin = this.formatearFechas(this.rangofechas.fecfin);
    this.rangofechas.fecini = fechainicio;
    this.rangofechas.fecfin = fechafin;
  }


  print() {
    if (this.tipoKardex == 1) {
      this.imprimirKardex();
    } else if (this.tipoKardex == 2) {
      this.imprimirKardexVal();
    } else{
      this.imprimirKardexGeneral()
    }
  }

  async imprimirKardex() {

    this.totalentradas = 0
    this.totalsalidas = 0
    this.listakardex = []
    // this.route.navigate(['printer/kardex']);
    await this.Kardex()
    setTimeout(() => {
      this.printerKardex();
    }, 1500);
  }

  async imprimirKardexVal() {

    this.totalsalidasval = 0
    this.totalsalidasval = 0
    this.listakardexval = []
    await this.KardexVal()
    setTimeout(() => {
      this.printerKardexVal();
    }, 1500);
  }

  async imprimirKardexGeneral() {

    // const myobj = JSON.stringify(this.rangofechas);
    // console.log(myobj);
    // this.data.setFechas(this.rangofechas)
    // console.log(this.data.getFechas());
    this.loading.show("Cargando...")
    this.totalentradas = 0
    this.totalsalidas = 0
    this.listakardexval = []
    // this.route.navigate(['printer/kardex']);
    await this.KardexGeneral()
    this.loading.hide()
    const formatLista = this.listageneral.map(item => {
      return {
        ...item,
        movimientos: this.parseKardexRow(item.movimientos)
      };
    });
    console.log("Datos formateados", formatLista);

    setTimeout(() => {
      this.printerKardexValGeneral(formatLista);
    }, 1500);
  }

  printerKardex() {
    const doc = new jsPDF();
    const titulo = { text: 'KARDEX DIGITAL', x: 85, y: 20 };


    // Función para agregar encabezado en cada página
    const addHeader = () => {
      doc.setFontSize(14);
      doc.text(titulo.text, titulo.x, titulo.y);
      const textWidth = doc.getTextWidth(titulo.text);  // Obtener el ancho del texto
      const lineY = titulo.y + 1;  // Posición Y de la línea (1 unidad por debajo del texto)

      doc.setLineWidth(0.5);  // Establecer el grosor de la línea
      doc.line(titulo.x, lineY, titulo.x + textWidth, lineY);
      doc.setFontSize(11);
      doc.text(`Nombre: ${this.articulo.nombre}.`, 10, 28);
      doc.text(`Del periodo ${this.rangofechas.fecini} al periodo ${this.rangofechas.fecfin}`, 10, 38);
      doc.text(`Generado el dia ${this.formatFecha(this.today, 'dd-MM-yyyy hh:mm')}`, 150, 38);
      if (this.empresa.logo) {
        doc.addImage(this.empresa.logo, 'PNG', 10, 8, 20, 9);
      } // Añade tu imagen
      doc.setFontSize(12);
    };

    // Columnas de la tabla
    const tableColumn = ['Fecha', 'Numero', 'Referencia', 'Entrada', 'Salida', 'Saldo'];
    const tableRows: any[] = [];

    // Obtener filas de una tabla HTML (ejemplo)
    const rows = document.querySelectorAll('#kardex tbody tr');
    rows.forEach(row => {
      const cols = row.querySelectorAll('td');
      const data: any[] = [];
      cols.forEach(col => data.push(col.innerText));
      tableRows.push(data);
    });

    // Usar autoTable para generar la tabla
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      margin: { horizontal: 10, vertical: 30 },
      theme: 'grid',
      columnStyles: {
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' }
        // Alinear la columna "Cantidad" (índice 3) a la derecha
      },
      styles: {
        fontSize: 9,  // Controla el tamaño de fuente para todo el contenido de la tabla
        cellPadding: 2,  // Espaciado interno de las celdas
      },
      didDrawPage: (data: any) => {
        // Encabezado en cada página

        const pageNumber = data.pageNumber;  // Obtener el número de página
        //const pageCount = doc.getNumberOfPages();

        console.log(data.totalPages);
        if (pageNumber == 1) {
          addHeader();
        }

        const pagetext = `Página ${pageNumber} `;
        doc.text(pagetext, 175, 15);  // Añade tu imagen
      },
      didDrawHeader: (data: any) => {
        doc.setFontSize(12);
        doc.text('Fecha', data.settings.margin.left, data.cursor.y);
        doc.text('Hora', data.settings.margin.left, data.cursor.y);
        doc.text('Doc', data.settings.margin.left, data.cursor.y);
        doc.text('Serie', data.settings.margin.left, data.cursor.y);
        doc.text('Numero', data.settings.margin.left, data.cursor.y);
        doc.text('Referencia', data.settings.margin.left, data.cursor.y);
        doc.text('Entrada', data.settings.margin.left, data.cursor.y);
        doc.text('Salida', data.settings.margin.left, data.cursor.y);
        doc.text('Saldo', data.settings.margin.left, data.cursor.y);
      }
    });

    // Guardar el archivo PDF
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
    //doc.save('informe.pdf');

  }


  printerKardexVal() {
    const doc = new jsPDF('landscape');
    const titulo = { text: 'KARDEX VALORADO', x: 135, y: 20 };


    // Función para agregar encabezado en cada página
    const addHeader = () => {
      doc.setFontSize(14);
      doc.text(titulo.text, titulo.x, titulo.y);
      const textWidth = doc.getTextWidth(titulo.text);  // Obtener el ancho del texto
      const lineY = titulo.y + 1;  // Posición Y de la línea (1 unidad por debajo del texto)

      doc.setLineWidth(0.5);  // Establecer el grosor de la línea
      doc.line(titulo.x, lineY, titulo.x + textWidth, lineY);
      doc.setFontSize(11);
      doc.text(`Nombre: ${this.articulo.nombre}.`, 10, 28);
      doc.text(`Cod: ${this.articulo.codigo}. Unidad de medida: ${this.articulo.unidad.unidad}.`, 10, 33);
      doc.text(`Del periodo ${this.rangofechas.fecini} al periodo ${this.rangofechas.fecfin}`, 10, 38);
      doc.text(`Generado el dia ${this.formatFecha(this.today, 'dd-MM-yyyy hh:mm')}`, 220, 38);
      if (this.empresa.logo) {
        doc.addImage(this.empresa.logo, 'PNG', 10, 8, 20, 9);
      } // Añade tu imagen // Añade tu imagen
      doc.setFontSize(12);
    };

    // Columnas de la tabla
    const tableColumn = ['Fecha', 'Doc', 'Serie', 'Numero', 'Tipo', 'Entrada Cantidad', 'Entrada Costo', 'Entrada Costo total', 'Salida Cantidad', 'Salida Costo', 'Salida Costo total', 'Saldo final', 'Costo Promedio', 'Saldo Valorado'];
    const tableRows: any[] = [];

    // Obtener filas de una tabla HTML (ejemplo)
    const rows = document.querySelectorAll('#kardexval tbody tr');
    rows.forEach(row => {
      const cols = row.querySelectorAll('td');
      const data: any[] = [];
      cols.forEach(col => data.push(col.innerText));
      tableRows.push(data);
    });

    // Usar autoTable para generar la tabla
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      margin: { horizontal: 10, vertical: 30 },
      theme: 'grid',
      columnStyles: {
        5: { halign: 'right' },
        6: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' },
        9: { halign: 'right' },
        10: { halign: 'right' },
        11: { halign: 'right' },
        12: { halign: 'right' },
        13: { halign: 'right' }
        // Alinear la columna "Cantidad" (índice 3) a la derecha
      },
      styles: {
        fontSize: 10,  // Controla el tamaño de fuente para todo el contenido de la tabla
        cellPadding: 2,  // Espaciado interno de las celdas
      },
      didDrawPage: (data: any) => {
        // Encabezado en cada página

        const pageNumber = data.pageNumber;

        if (pageNumber === 1) {
          addHeader(); // Solo en la primera página
        }
        const pagetext = `Página ${pageNumber} `;
        doc.text(pagetext, 245, 15);  // Añade tu imagen
      },
      didDrawHeader: (data: any) => {
        doc.setFontSize(12);
        doc.text('Fecha', data.settings.margin.left, data.cursor.y);
        doc.text('Hora', data.settings.margin.left, data.cursor.y);
        doc.text('Doc', data.settings.margin.left, data.cursor.y);
        doc.text('Serie', data.settings.margin.left, data.cursor.y);
        doc.text('Numero', data.settings.margin.left, data.cursor.y);
        doc.text('Referencia', data.settings.margin.left, data.cursor.y);
        doc.text('Entrada', data.settings.margin.left, data.cursor.y);
        doc.text('Salida', data.settings.margin.left, data.cursor.y);
        doc.text('Saldo', data.settings.margin.left, data.cursor.y);
      }
    });

    // Guardar el archivo PDF
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
    //doc.save('informe.pdf');

  }

  formatFecha(fecha: Date | string, format: string): string {
    // Formatear la fecha a 'dd-MM-yyyy'
    const parsedDate = moment(fecha, 'DD-MM-YYYY');
    fecha = parsedDate.format('YYYY-MM-DD');
    return fecha;
  }

  async getArticulos() {
    console.log("obteniendo artculos");
    await this.data.AsyncGetSimple(this.data.api.articulos).then(r => {
      this.articulos = r;
    })
  }

  close() {
    this.btnclose.nativeElement.click();
  }

  testKardexVal() {
    console.log(this.rangofechas);
    let filtro = new Filtro()
    filtro.fecini = this.rangofechas.fecini
    filtro.fecfin = this.rangofechas.fecfin
    filtro.id = this.rangofechas.id
    filtro.idsucursal = this.data.getSucursalId()
    console.log("Enviado: ", filtro);

    this.data.Post('kardexval', filtro).subscribe(r => {
      console.log(r);
      if (r.length < 1) {
        console.error("Error");
      } else {
        this.listakardex = r;


      }
    }, error => { e => { console.log(e) } });
  }

  parseKardexRow(list: any[]) {
    let rows: any[] = [];
    console.log(list);

    list.forEach(kardex => {
      let row: any = {};
      row.fecha = kardex.fecha;
      row.documento = kardex.documento;
      row.serie = kardex.serie;
      row.numero = kardex.numero;
      row.tipo = kardex.tipo_ope;
      console.log("Tipo movimiento: ", kardex.tipomovimiento);
      console.log("Cantidad obtenida: ", kardex.cantidad);

      switch (kardex.tipomovimiento) {
        case "ENTRADA":
          row.entcantidad = Number(kardex.cantidad).toFixed(2);
          row.entcosto = Number(kardex.costopromedio).toFixed(2);
          row.entsaldo = Number(kardex.entrada_valorada).toFixed(2);

          row.salcantidad = 0;
          row.salidacosto = 0;
          row.salidasaldo = 0;
          console.log("ENTRADA: ", kardex.cantidad, row.entcantidad);
          break;

        case "SALIDA":
          row.entcantidad = 0;
          row.entcosto = 0;
          row.entsaldo = 0;

          row.salcantidad = Number(kardex.cantidad).toFixed(2);
          row.salidacosto = Number(kardex.costopromedio).toFixed(2);
          row.salidasaldo = Number(kardex.salida_valorada).toFixed(2);
          console.log("SALIDA: ", kardex.cantidad, row.salcantidad);
          break;

        default:
          row.entcantidad = 0;
          row.entcosto = 0;
          row.entsaldo = 0;
          row.salcantidad = 0;
          row.salidacosto = 0;
          row.salidasaldo = 0;
          console.log("Operacion por defecto: ", kardex.cantidad, row.salcantidad);
          break;
      }
      console.log("Mostrando datos pre saldo valorado", row);

      row.saldo = Number(kardex.saldoinventario).toFixed(2);
      row.costo = Number(kardex.costopromedio).toFixed(2);
      row.saldovalorado = Number(kardex.saldo_valorado).toFixed(2);
      console.log("Introduciendo fila con saldo valorado", row);
      rows.push(row);
    });
    return rows;
  }

  printerKardexValGeneral(datos: Array<any>) {
    const doc = new jsPDF('landscape');
    const titulo = { text: 'KARDEX VALORADO', x: 135, y: 20 };

    // Función para convertir valores a número seguro
    const safeNumber = (value: any, decimals = 3): string => {

      console.log();
      const num = Number(value) || 0;

      return num.toFixed(decimals);
    };

    // Función para formatear fecha
    const formatFecha = (fecha: string) => {
      if (!fecha) return '';
      try {
        const d = new Date(fecha);
        return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getFullYear()}`;
      } catch {
        return fecha; // Devuelve el valor original si no se puede parsear
      }
    };

    // Función para agregar encabezado
    const addHeader = (producto: any) => {
      doc.setFontSize(14);
      doc.text(titulo.text, titulo.x, titulo.y);
      const textWidth = doc.getTextWidth(titulo.text);
      doc.setLineWidth(0.5);
      doc.line(titulo.x, titulo.y + 1, titulo.x + textWidth, titulo.y + 1);

      doc.setFontSize(11);
      doc.text(`Nombre: ${producto.nombre || 'N/A'}`, 10, 28);
      doc.text(`Generado: ${formatFecha(new Date().toISOString())}`, 220, 38);

      if (this.empresa.logo) {
        doc.addImage(this.empresa.logo, 'PNG', 10, 8, 20, 9);
      }
      doc.setFontSize(12);
    };

    // Columnas de la tabla
    const tableColumn = [
      'Fecha', 'Doc', 'Serie', 'Numero',
      'Entrada Cantidad', 'Entrada Costo', 'Entrada Costo total',
      'Salida Cantidad', 'Salida Costo', 'Salida Costo total',
      'Saldo final', 'Costo Promedio', 'Saldo Valorado'
    ];

    datos.forEach((producto, index) => {
      if (index > 0) {
        doc.addPage();
      }

      addHeader(producto);

      // Construir filas con protección contra NaN
      const tableRows = producto.movimientos.map((mov: any) => {
        // parseo seguro
        const entCantidad = Number(mov.entcantidad) || 0;
        const entCosto = Number(mov.entcosto) || 0;
        const entSaldo = Number(mov.entsaldo) || 0;
        const salCantidad = Number(mov.salcantidad) || 0;
        const salCosto = Number(mov.salidacosto) || 0;
        const salSaldo = Number(mov.salidasaldo) || 0;
        const saldoCantidad = Number(mov.saldo) || 0;
        const costoPromedio = Number(mov.costo) || 0;
        const saldoValorado = Number(mov.saldovalorado) || 0;

        return [
          formatFecha(mov.fecha),            // fecha
          mov.documento || '',             // documento
          mov.serie || '',             // serie
          mov.numero || '',             // número

          // Entradas
          entCantidad.toFixed(3),            // entcantidad
          entCosto.toFixed(2),               // entcosto
          entSaldo.toFixed(2),               // entsaldo

          // Salidas
          salCantidad.toFixed(3),            // salcantidad
          salCosto.toFixed(2),               // salidacosto
          salSaldo.toFixed(2),               // salidasaldo

          // Saldos finales
          saldoCantidad.toFixed(2),          // saldo
          costoPromedio.toFixed(2),          // costo
          saldoValorado.toFixed(2),          // saldovalorado
        ];
      });

      // Generar la tabla
      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        margin: { horizontal: 10, vertical: 30 },
        theme: 'grid',
        columnStyles: {
          5: { halign: 'right' },
          6: { halign: 'right' },
          7: { halign: 'right' },
          8: { halign: 'right' },
          9: { halign: 'right' },
          10: { halign: 'right' },
          11: { halign: 'right' },
          12: { halign: 'right' },
          13: { halign: 'right' }
        },
        styles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: 'linebreak'
        },
        didDrawPage: (data: any) => {
          const pageNumber = doc.getCurrentPageInfo().pageNumber;
          doc.text(`Página ${pageNumber}`, 245, 15);
        }
      });
    });

    // Imprimir automáticamente
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
    let ruta = this.data.api.kardex
    if (this.tipoKardex == 2) {
      ruta = this.data.api.kardex_valorado; 
    } else if (this.tipoKardex == 3) {
      ruta = this.data.api.kardex_general;
    }
    console.log(this.rangofechas);
    let filtro = new Filtro()
    filtro.fecini = this.rangofechas.fecini
    filtro.fecfin = this.rangofechas.fecfin
    filtro.id = this.rangofechas.id
    filtro.idsucursal = this.data.getSucursalId()
    console.log("Enviado: ", filtro);
    this.data.GenerateExcel(ruta, filtro).subscribe(r => {
      console.log(r);

      if (r.download_url) {
        window.open(this.data.api.apiBaseUrl + 'api/download_excel' + r.download_url, '_blank');
        // Establecer un retraso antes de eliminar el archivo
        setTimeout(() => {
          this.data.DeleteExcel(r.download_url).subscribe(r => console.log(r));
        }, 20000); // 10000 milisegundos = 10 segundos
      }
    }, (error) => {
      this.data.notify("Error al generar excel", "Error", this.alertType.error);
    });
  }

}

