import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog } from '@angular/material';
import { Title } from '@angular/platform-browser';
import { ALertOption } from 'src/app/Models/alert/alert-option';
import { Transportista } from 'src/app/Models/transportista/transportista';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';
import { AddClienteComponent } from '../cliente/add-cliente/add-cliente.component';
import { AddTransportistaComponent } from './add-transportista/add-transportista.component';

@Component({
  selector: 'app-transportista',
  templateUrl: './transportista.component.html',
  styleUrls: ['./transportista.component.css']
})
export class TransportistaComponent implements OnInit {

  displayedColumns: string[] = ['apellidos', 'celular', 'acciones'];
  dataSource = new MatTableDataSource<Transportista>([]);
  filtro = { texto: '' };

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(
    private data: DataService,
    private auth: AuthService,
    private titleService: Title,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loadTransportistas();
  }

  loadTransportistas() {
    this.data.GetSimple('transportista')
      .subscribe(
        (res: Transportista[]) => {
          this.dataSource.data = res || [];
        },
        err => {
          console.error('Error al cargar transportistas', err);
        }
      );
  }

  applyFilter() {
    const text = (this.filtro.texto || '').trim().toLowerCase();
    this.dataSource.filterPredicate = (data: Transportista, filter: string) => {
      const term = filter;
      return (data.apellidos || '').toLowerCase().includes(term) ||
        (data.celular || '').toLowerCase().includes(term);
    };
    this.dataSource.filter = text;
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  clearFilter() {
    this.filtro.texto = '';
    this.applyFilter();
  }

  addTransportista() {
    // Navegar al formulario de creación
    console.log('Editando id:');
    const dialogRef = this.dialog.open(AddTransportistaComponent, {
      width: '90vw',
      maxWidth: '500px',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.loadTransportistas();
    });
  }

  editarTransportista(id: number) {
    console.log('Editando id:', id);
    const dialogRef = this.dialog.open(AddTransportistaComponent, {
      width: '90vw',
      maxWidth: '500px',
      data: { id: id },
    });
    dialogRef.afterClosed().subscribe(result => {
      this.loadTransportistas();
    });
  }

  eliminarTransportista(id: number) {
    this.data.notify(
      "¿Desea eliminar este cliente?",
      "Atención",
      this.data.alertType.question,
      new ALertOption(),
      () => {
        this.data.Delete("cliente", id.toString()).subscribe(
          (res) => {
            this.data.notify(res.message, "Éxito", this.data.alertType.success);
            this.loadTransportistas();
          },
          (error) => {
            console.log(error);
            this.data.notify("Error al anular", "Error", this.data.alertType.error);
          }
        );
      }
    );

  }

  refresh() {
    this.loadTransportistas();
  }

}
