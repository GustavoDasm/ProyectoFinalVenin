import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Cliente } from 'src/app/Models/cliente/cliente';
import { Filtro } from 'src/app/Models/filtro/filtro';
import { TipoDocumento } from 'src/app/Models/tipodocumento/tipo-documento';
import { Transportista } from 'src/app/Models/transportista/transportista';
import { DataService } from 'src/app/Service/data.service';
import { LoadingComponent } from '../objects/loading/loading.component';
import { NothingComponent } from '../objects/nothing/nothing.component';
import { AlertComponent } from '../objects/alert/alert/alert.component';
import { MatDialog, MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Personal } from 'src/app/Models/personal/personal';
import { AddPersonalComponent } from './add-personal/add-personal.component';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.css']
})
export class PersonalComponent implements OnInit {
  @ViewChild(LoadingComponent, null) public loading: LoadingComponent;
  @ViewChild(NothingComponent, null) public nothing: NothingComponent;
  @ViewChild(AlertComponent, null) public alert: AlertComponent;
  //@ViewChild(AddTransportistaComponent, null) public frmaddtrans: AddTransportistaComponent;
  public cliente: Cliente = new Cliente();
  dataSource = new MatTableDataSource<any>([]);
  public personal: Personal[] = [];
  public tipodocumentos: TipoDocumento[] = [];
  displayedColumns: string[] = ['nombre', 'direccion', 'documento', 'fecha_ingreso', 'opciones'];
  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;
  filtro = { text: '', top: 10, scale: 'ASC' };
  constructor(private title: Title, private data: DataService, public dialog: MatDialog) { }

  ngOnInit() {
    this.title.setTitle('Personal | Sistema Venin');
    this.dataSource = new MatTableDataSource(this.personal);
    this.SearchPersonal()
  }


  SearchPersonal() {

    this.data.Post('search_personal', this.filtro).subscribe(r => {
      if (r.message === 'success') {
        this.personal = r.data;

      } else {
        this.personal = [];
        console.log(r.message);
      }
    }, e => {
      console.log(e.error);
      this.personal = [];
      this.updateDataSource(this.personal);
    }, () => { this.updateDataSource(this.personal); })
  }

  private updateDataSource(data: any[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    // // Forzar la detección de cambios (útil en algunos casos)
    // if (this.changeDetector) {
    //   this.changeDetector.detectChanges();
    // }
  }


  SearchByName() {

    if (this.filtro.text.length < 2) {
      this.personal = [];
      return
    }
    this.SearchPersonal();
  }

  showAddPersonal() {
    const dialogRef = this.dialog.open(AddPersonalComponent, {
      width: '90vw',
      maxWidth: '1000px',
    });

    dialogRef.afterClosed().subscribe(result => {
      this.SearchPersonal();
    });
  }

  showEditPersonal(personal: Personal) {
    const dialogRef = this.dialog.open(AddPersonalComponent, {
      width: '90vw',
      maxWidth: '1000px',
      data: { id: personal.idpersonal }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.SearchPersonal();
    });
  }


}
