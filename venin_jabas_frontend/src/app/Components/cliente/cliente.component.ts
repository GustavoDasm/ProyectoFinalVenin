import { Component, OnInit, ViewChild } from '@angular/core';
import {
  MatDialog,
  MatPaginator,
  MatSort,
  MatTableDataSource,
} from "@angular/material";
import { Title } from "@angular/platform-browser";
import { DataService } from "src/app/Service/data.service";
import { ALertOption } from "src/app/Models/alert/alert-option";
import { Cliente } from 'src/app/Models/cliente/cliente';
import { AddClienteComponent } from './add-cliente/add-cliente.component';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.component.html',
  styleUrls: ['./cliente.component.css']
})
export class ClienteComponent implements OnInit {

  public suc: any;
  public tipo_filtro: number = 0;
  public filtro: any = {
    top: 100,
    scale: "ASC",
    nombre: "",
  };

  public clientes: Cliente[] = [];

  displayedColumns: string[] = [
    "apellidos",
    "celular",
    "tipodoc",
    "numero",
    "acciones",
  ];

  dataSource: MatTableDataSource<any>;
  operaciones: any[] = [];

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(
    private data: DataService,
    private titleService: Title,
    public dialog: MatDialog
  ) {
    this.titleService.setTitle("Clientes | Sistema Venin");
    this.dataSource = new MatTableDataSource(this.operaciones);
  }

  ngOnInit() {
    this.getCliente();
  }

  GetSucursal() {
    this.data.getSucursalObj().subscribe(
      (res) => {
        this.suc = res;
      },
      (error) => {}
    );
  }

  getTipoDocumentoTexto(codigo: string): string {
    if (codigo === 'D') return 'DNI';
    if (codigo === 'R') return 'RUC';
    if (codigo === 'C') return 'CARNET';
    return codigo;
  }

  getCliente() {
    this.data.GetSimple(this.data.api.cliente).subscribe((r) => {
      this.clientes = r;
      this.dataSource.data = r;
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  addCliente() {
    const dialogRef = this.dialog.open(AddClienteComponent, {
      width: "500px",
      disableClose: true,
      data: {},
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("Cliente agregado, recargando datos...");
        this.getCliente();  // ← Aquí recargas los datos reales desde backend
      }
    });
  } 

  editarOperacion(id: any) {
    console.log('Editando id:', id);  
    const dialogRef = this.dialog.open(AddClienteComponent, {
      width: '90vw',
      maxWidth: '500px',
      data: { id: id },  
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getCliente();  
    });
  }

  anularOperacion(id: any) {
    this.data.notify(
      "¿Desea eliminar este cliente?",
      "Atención",
      this.data.alertType.question,
      new ALertOption(),
      () => {
        this.data.Delete("cliente", id.toString()).subscribe(
          (res) => {
            this.data.notify(res.message, "Éxito", this.data.alertType.success);
            this.getCliente();  
          },
          (error) => {
            console.log(error);
            this.data.notify("Error al anular", "Error", this.data.alertType.error);
          }
        );
      }
    );
  } 

  applyFilter() {
      const text = (this.filtro.nombre || '').trim().toLowerCase();
      this.dataSource.filterPredicate = (data: Cliente, filter: string) => {
        const term = filter;
        return (data.apellidos || '').toLowerCase().includes(term)
      };
      this.dataSource.filter = text;
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  
    clearFilter() {
      this.filtro.nombre = '';
      this.applyFilter();
    }

}
