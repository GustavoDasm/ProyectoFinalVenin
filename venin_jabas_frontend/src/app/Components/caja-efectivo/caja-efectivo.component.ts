import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { Cliente } from 'src/app/Models/cliente/cliente';
import { Filtro } from 'src/app/Models/filtro/filtro';
import { DataService } from 'src/app/Service/data.service';
import { AddCajaEfectivoComponent } from './add-caja-efectivo/add-caja-efectivo.component';
import { SelectOperacionComponent } from './select-operacion/select-operacion.component';
import { ALertOption } from 'src/app/Models/alert/alert-option';

@Component({
  selector: 'app-caja-efectivo',
  templateUrl: './caja-efectivo.component.html',
  styleUrls: ['./caja-efectivo.component.css']
})
export class CajaEfectivoComponent implements OnInit {

  public suc: any;
  public tipo_filtro: number = 0;
  public filtro: any = {
    tipofecha: 0,
    top: 100,
    scale: 'ASC',
    fec_ini: '',
    fec_fin: '',
    estado: '',
    tipocaja: '',
    establecimiento: this.data.getSucursalId(),
  }

  public clientes: Cliente[] = []
  displayedColumns: string[] = [
    'establecimiento','fecha', 'hora', 'personal', 'referencia', 'tipocaja',
    'importe',  'estado', 'acciones'
  ];

  dataSource: MatTableDataSource<any>;
  operaciones: any[] = [];

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(private data: DataService, private titleService: Title, public dialog: MatDialog) {
    this.titleService.setTitle("Caja Efectivo | Sistema Venin");

    this.dataSource = new MatTableDataSource(this.operaciones);
  }

  ngOnInit() {
    this.GetSucursal();
    this.mostrarFiltro()
  }

  GetSucursal() {
    this.data.getSucursalObj().subscribe(
      (res) => {
        this.suc = res;
      }, (error) => { }
    )
  }

  GetSolicitudes() {
    this.data.GetSimple("solicitud_compra").subscribe(
      (res) => {
        this.operaciones = res;
        this.dataSource = new MatTableDataSource(this.operaciones);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }, (error) => { }
    )
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
    this.data.Post("search_caja_efec", this.filtro).subscribe(
      (res) => {
        console.log(res);
        
        if (res.status === 'error') {
          this.operaciones = [];
          console.log(res.message);
        } else {
          this.operaciones = res.data;

        }
        this.dataSource = new MatTableDataSource(this.operaciones);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

      }, (error) => { 
        this.operaciones = [];
        this.dataSource = new MatTableDataSource(this.operaciones);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    )

  }

  getClientes() {
    this.data.GetSimple(this.data.api.cliente).subscribe(r => { this.clientes = r; })
  }


  selectOperacion(){
    const dialogRef = this.dialog.open(SelectOperacionComponent, {
      width: '90vw',
      maxWidth: '400px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result === 'ingreso') {
          console.log("Abriendo Ingreso");
          this.nuevaOperacion('ingreso');
          
        } else if (result === 'salida') {
          console.log("Abriendo Salida");
          this.nuevaOperacion('salida');
        }
      }
    });
  }
  

  nuevaOperacion(tipo:string) {
    const dialogRef = this.dialog.open(AddCajaEfectivoComponent, {
      width: '90vw',
      maxWidth: '1000px',
      data: { tipo_operacion: tipo } // Puedes cambiar a 'salida' si es necesario
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.mostrarFiltro();
      }
    });
  }


  editarOperacion(id: any, tipo:string) {
    let tipoOperacion = tipo === 'I' ? 'ingreso' : 'salida';
    console.log("Editando operacion tipo:", tipoOperacion, "con id:", id);
    

    const dialogRef = this.dialog.open(AddCajaEfectivoComponent, {
      width: '90vw',
      maxWidth: '1000px',
      data: { 
        tipo_operacion: tipoOperacion,
        id: id,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.mostrarFiltro();
    });
  }

  anularOperacion(id:any){
    this.data.notify("¿Desea anular esta operación?","Atencion",this.data.alertType.question, new ALertOption(),()=>{
      this.data.Patch("cajaefectivo",id,{estado:'anulado'}).subscribe((res)=>{
        this.data.notify(res.message,"Exito",this.data.alertType.success);
      }, (error)=>{
        console.log(error);
        
      },()=>{
        this.mostrarFiltro();
      } );
    });
  }

}
