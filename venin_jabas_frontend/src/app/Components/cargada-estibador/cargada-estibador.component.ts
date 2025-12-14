import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from "@angular/material";
import { Title } from "@angular/platform-browser";
import { DataService } from "src/app/Service/data.service";
import { DetalleGuia } from "src/app/Models/guiasalida/detguia/detalleguia";
import { FormEjemploComponent } from "./form-ejemplo/form-ejemplo.component";

@Component({
  selector: "app-cargada-estibador",
  templateUrl: "./cargada-estibador.component.html",
  styleUrls: ["./cargada-estibador.component.css"],
})
export class CargadaEstibadorComponent implements OnInit {
  public suc: any;
  public tipo_filtro: number = 0;
  public filtro: any = {
    tipofecha: 0,
    top: 100,
    scale: "ASC",
    fec_ini: "",
    fec_fin: "",
    estado: "",
    tipocaja: "",
    establecimiento: this.data.getSucursalId(),
  };

  public detalleguias: DetalleGuia[] = [];

  displayedColumns: string[] = [
    "fecha",
    "dia",
    "cantidad",
    "precio",
    "total",
    "cliente",
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
    this.titleService.setTitle("Cargada Estribor | Sistema Venin");

    this.dataSource = new MatTableDataSource(this.operaciones);
  }

  ngOnInit() {
    this.GetSucursal();
    this.getDetalleGuia();
  }

  GetSucursal() {
    this.data.getSucursalObj().subscribe(
      (res) => {
        this.suc = res;
      },
      (error) => {}
    );
  }

  getDetalleGuia() {
    this.data.GetSimple(this.data.api.detalleguia).subscribe((r) => {
      this.detalleguias = r;
      this.dataSource.data = r;
    });
  }

  ingresarFormDialog() {
    const dialogRef = this.dialog.open(FormEjemploComponent, {
      width: "90vw",
      maxWidth: "400px",
    });
  }
}
