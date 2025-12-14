import { Component, OnInit, ViewChild } from "@angular/core";
import {
  MatDialog,
  MatPaginator,
  MatSort,
  MatTableDataSource,
} from "@angular/material";
import { Title } from "@angular/platform-browser";
import { DataService } from "src/app/Service/data.service";
import { DetalleGuia } from "src/app/Models/guiasalida/detguia/detalleguia";
import { AddGuiaSalidaComponent } from "./add-guia-salida/add-guia-salida.component";
import { ALertOption } from "src/app/Models/alert/alert-option";
import { Filtro } from "src/app/Models/filtro/filtro";
import { GuiaSalida } from "src/app/Models/guiasalida/guiasalida";

@Component({
  selector: "app-guia-salida",
  templateUrl: "./guia-salida.component.html",
  styleUrls: ["./guia-salida.component.css"],
})
export class GuiaSalidaComponent implements OnInit {
  public suc: any;
  public tipo_filtro: number = 0;
  public filtro: any = {
    top: 100,
    scale: "DESC",
    option: null,
    fec_ini: null,
    fec_fin: null,
    idsucursal: this.data.getSucursalId(),
    idcliente: null,  
  };

  public detalleguias: DetalleGuia[] = [];
  public guias: GuiaSalida[] = [];
  displayedColumns: string[] = [
    "fecha",
    "cliente",
    "transportista",
    "sucursal",
    "total",
    "pago",
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
    this.titleService.setTitle("Guia Salida | Sistema Venin");

    this.dataSource = new MatTableDataSource(this.operaciones);
  }

  ngOnInit() {
    this.GetSucursal();
    this.getGuiaSalida();
  }

  GetSucursal() {
    this.data.getSucursalObj().subscribe(
      (res) => {
        this.suc = res;
      },
      (error) => {}
    );
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  // getDetalleGuia() {
  //   this.data.GetSimple(this.data.api.detalleguia).subscribe((r) => {
  //     this.detalleguias = r;
  //     console.log('Detalle Guías ejemplo:', this.detalleguias[0]);
  //     this.dataSource.data = r;  // Solo cambia los datos aquí
  //   });
  // }

  getGuiaSalida(){
    const payload = {...this.filtro }; // Clona el objeto filtro para evitar mutaciones inesperadas
    this.data.Post('search_guiasalida',payload).subscribe((r) => {
      const response = r.data;
      
      this.guias = response;
      console.log('Guías ejemplo:', this.guias[0]);
      this.dataSource.data = response;  
    });
  }

  addGuiaSalida() {
    const dialogRef = this.dialog.open(AddGuiaSalidaComponent, {
      width: "90vw",
      maxWidth: "1100px",
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getGuiaSalida();
    });
  } 

  editarOperacion(id: number) {
    console.log('Editando id:', id);  // Confirmar que recibes el id

    const dialogRef = this.dialog.open(AddGuiaSalidaComponent, {
      width: '90vw',
      maxWidth: '1100px',
      data: { id: id },  // Pasas el id al diálogo
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getGuiaSalida();  // Recargar la lista después de editar
    });
  }

  anularOperacion(id: any) {
    this.data.notify(
      "¿Desea anular esta operación?",
      "Atención",
      this.data.alertType.question,
      new ALertOption(),
      () => {
        this.data.Patch("guia_salida_completa", id, { estado: 'ANU' }).subscribe(
          (res) => {
            this.data.notify(res.message, "Éxito", this.data.alertType.success);
            this.getGuiaSalida();  // Recarga la lista para reflejar el cambio
          },
          (error) => {
            console.log(error);
            this.data.notify("Error al anular", "Error", this.data.alertType.error);
          }
        );
      }
    );
  } 
}
