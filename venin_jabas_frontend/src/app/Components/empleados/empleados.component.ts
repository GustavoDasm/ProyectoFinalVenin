import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from "@angular/material";
import { Title } from "@angular/platform-browser";
import { Empleado } from "src/app/Models/empleado/empleado";
import { DataService } from "src/app/Service/data.service";
import { AddEmpleadoComponent } from "./add-empleado/add-empleado.component";

@Component({
  selector: "app-empleados",
  templateUrl: "./empleados.component.html",
  styleUrls: ["./empleados.component.css"],
})
export class EmpleadosComponent implements OnInit {
  public empleados: Empleado[] = [];
  displayedColumns: string[] = [
    "nombres",
    "apellidos",
    "direccion",
    "fecingreso",
    "sueldobasico",
    "telefono",
    "email",
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
    this.titleService.setTitle("Empleados | Sistema Venin");
    this.dataSource = new MatTableDataSource(this.operaciones);
  }

  ngOnInit() {
    this.getEmpleados();
  }

  getEmpleados() {
    this.data.GetSimple(this.data.api.empleado).subscribe((r) => {
      this.empleados = r;
      this.dataSource.data = r; 
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  selectOperacion() {
    this.dialog.open(AddEmpleadoComponent, {
      width: "90vw",
      maxWidth: "1000px",
    });
  }
}
