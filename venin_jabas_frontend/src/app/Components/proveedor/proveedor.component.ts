import { Component, OnInit, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DataService } from 'src/app/Service/data.service';
import { NotifyService } from 'src/app/Service/notify.service';
import { MatDialog, MatPaginator, MatTableDataSource } from '@angular/material';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, finalize } from 'rxjs/operators';
import { AddProveedorComponent } from './add-proveedor/add-proveedor.component';
import { Proveedor } from 'src/app/Models/proveedor/proveedor';
import { ALertOption } from 'src/app/Models/alert/alert-option';

@Component({
  selector: 'app-proveedor',
  templateUrl: './proveedor.component.html',
  styleUrls: ['./proveedor.component.css']
})
export class ProveedorComponent implements OnInit {

  @ViewChild(MatPaginator, null) paginator: MatPaginator;
  dataSource = new MatTableDataSource<Proveedor>([]);
  proveedores: Proveedor[] = [];
  total = 0;
  loading = false;
  tipodocumentos: any[] = [];
  busqueda = '';
  pgproveedor = 1;

  search = {
    top: 100,
    scale: 'DESC' as 'ASC' | 'DESC',
    fechaprogd: this.data.DateNowCurrent(),
    fechaprogh: this.data.DateNowCurrent()
  };

  private searchSubject = new Subject<string>();

  constructor(
    private title: Title,
    private data: DataService,
    private notify: NotifyService,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.title.setTitle('Proveedores | Sistema Venin');
    this.setupSearch();
    this.GetProveedor();
    this.getTipoDocumento();
  }

  private setupSearch(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(searchTerm => {
        this.loading = true;
        return searchTerm
          ? this.data.GetFromValue(this.data.api.proveedor, 'like', searchTerm)
          : this.data.GetSimple(this.data.api.proveedor);
      })
    ).subscribe({
      next: (r) => {
        this.loading = false;
        if (this.data.Exists(r)) {
          this.proveedores = r;
          this.total = this.proveedores.length;
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        } else {
          this.proveedores = [];
          this.total = 0;
        }
      },
      error: (e) => {
        this.loading = false;
        console.error(e);
      }
    });
  }

  GetProveedor(): void {
    this.loading = true;
    this.data.GetSimple(this.data.api.proveedor).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: (r) => {
        console.log("Respuesta:", r);

        if (this.data.Exists(r)) {
          this.proveedores = r;
          this.total = this.proveedores.length;
          this.dataSource.data = this.proveedores;

          // Asignar el paginador si aún no está
          if (this.paginator) {
            this.dataSource.paginator = this.paginator;
          }
        } else {
          this.proveedores = [];
          this.dataSource.data = [];
          this.total = 0;
        }
      },
      error: (e) => console.error(e)
    });
  }

  searchProveedor(): void {
    this.searchSubject.next(this.busqueda);
  }

  getTipoDocumento(): void {
    this.data.GetSimple(this.data.api.tipodocumento).subscribe({
      next: (r) => {
        try {
          this.tipodocumentos = r;
        } catch (ex) {
          console.error(ex);
        }
      },
      error: (e) => console.error(e)
    });
  }

  ShowNewProveedor(): void {
    const dialogRef = this.dialog.open(AddProveedorComponent, {
      width: '1000px'
    });

    dialogRef.afterClosed().subscribe(result => {
      this.GetProveedor();
    });
  }

  ShowEditProveedor(idprovee: any): void {
    const dialogRef = this.dialog.open(AddProveedorComponent, {
      width: '1000px',
      data: {
        idprovee: idprovee,
        isEditable: true,
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.GetProveedor();
    });
  }

  tipodoc(tipiden): string {

    switch (tipiden) {
      case '1':
        return 'DNI';
      case '6':
        return 'RUC';

      default:
        break;
    }
  }

  ShowDeleteProveedor(idprovee: any): void {
    this.data.notify('Estimado(a), ¿Estas seguro de eliminar el proveedor seleccionado?', 'Eliminar proveedor',
      this.data.alertType.question, new ALertOption(true, true, 'Sí, Eliminar', 'Cerrar'), () => { this.eliminarProveedor(idprovee) });
  }


  eliminarProveedor(idproveedor: any) {
    this.data.Delete(this.data.api.proveedor, idproveedor).subscribe({
      next: (r) => {
        if (r.status == 'success') {
          this.data.notify(r.message, 'Proveedor eliminado', this.data.alertType.error, new ALertOption());
          this.GetProveedor();
        } else {
          this.data.notify(r.message, 'Error al eliminar', this.data.alertType.error, new ALertOption());
        }
      }
    });
  }

  // async ShowDeleteProveedor(i) {
  //     this.proveedor = i;
  //     if (this.proveedor != undefined) {
  //         await this.data.AsyncGetFromValue(this.data.api.proveedor, 'idproveedor', this.proveedor.idproveedor).then(r => {
  //             try {
  //                 if (r.idproveedor != '' || r.idproveedor != undefined) {
  //                     this.data.notify('Estimado(a), ¿Estas seguro de eliminar el proveedor seleccionado: [' + this.proveedor.documento + ' | ' + this.proveedor.apellidos + ']?', 'Eliminar proveedor', this.data.alertType.question, new ALertOption(true, true, 'Sí, ELiminar', 'Cerrar'), async (r) => {

  //                         /*erliminar proveedordireccion x idproveedor */
  //                         this.data.wait('Espere por favor, estamos eliminando el proveedor seleccionado. Gracias', 'Eliminando Proveedor');

  //                         await this.data.AsyncDelete(this.data.api.proveedor, this.proveedor.idproveedor).then(r => {
  //                             if (r.status == 'success') {
  //                                 this.data.notify(r.message, 'Proveedor eliminado', this.data.alertType.error, new ALertOption());
  //                                 this.GetProveedor();
  //                             } else {
  //                                 this.data.notify(r.message, 'Error al eliminar', this.data.alertType.error, new ALertOption());
  //                             }
  //                         }).catch(e => { this.data.notifyClose(); this.data.notify("Error", 'Error al registrar proveedor', this.data.alertType.error, new ALertOption()); });
  //                     });
  //                 } else {
  //                     this.data.notify('Estimado(a), el proveedor no puede ser eliminado, debido a que está asociado a otros documentos electrónicos.', 'Advertencia', this.data.alertType.warning, new ALertOption());
  //                 }
  //             } catch (ex) { console.log(ex); }
  //         });
  //     }
  // }
}
