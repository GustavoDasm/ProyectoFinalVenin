import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ALertOption } from 'src/app/Models/alert/alert-option';
import { DataService } from 'src/app/Service/data.service';

@Component({
  selector: 'app-add-proveedor',
  templateUrl: './add-proveedor.component.html',
  styleUrls: ['./add-proveedor.component.css']
})
export class AddProveedorComponent implements OnInit {
  proveedorForm: FormGroup;
  tipodocumentos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    public dialogRef: MatDialogRef<AddProveedorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.proveedorForm = this.fb.group({
      idprovee: [null],
      razonsocial: [''],
      direccion: [''],
      ruc: [''],
      telefono: [''],
      contacto: [''],
      nota: [''],
      cuenta: [''],
      email: [''],
      actividad: [''],
      distrito: [''],
      tip_iden: ['1'],
      codubigeo: [''],

    });
  }

  ngOnInit() {
    this.GetTipoDocIden();
    if (this.data) {
      console.log(this.data);

      this.getProveedor();
    }
  }

  GetTipoDocIden() {
    this.dataService.GetSimple(this.dataService.api.tipodocumento).subscribe(r => {
      this.tipodocumentos = r;
    }, (e => { console.log(e) }));
  }

  getProveedor() {
    this.dataService.GetFromId('proveedor', this.data.idprovee).subscribe(
      (response: any) => {
        this.proveedorForm.patchValue(response);
      },
      error => {
        console.error('Error al obtener el proveedor:', error);
      }
    );
  }

  buscarRuc() {
    const ruc = this.proveedorForm.get('ruc').value;
    if (ruc) {
      this.dataService.Consulta('ruc', ruc).then(

        (response: any) => {
          console.log(response);

          if (response) {
            this.proveedorForm.patchValue({
              tip_iden: ruc.length > 8 ? '6' : '1',
              razonsocial: response.message.razon_social,
              direccion: response.message.domicilio_fiscal,
            });
          }
        })
    } else {
      this.proveedorForm.markAllAsTouched()
      console.log('Ingrese un RUC válido');
    }

  }

  save() {
    console.log("Guardando proveedor");

    if (this.proveedorForm.invalid) {
      console.log("Formulario invalido");

      this.proveedorForm.markAllAsTouched();
      return
    }
    if (this.data) {
      this.actualizarProveedor();
    } else {
      this.guardarProveedor();
    }
  }

  guardarProveedor() {
    this.dataService.Post('proveedor', this.proveedorForm.value).subscribe(
      response => {
        this.dataService.notify('Proveedor guardado correctamente', 'Proveedor guardado', this.dataService.alertType.success, new ALertOption());
      },
      error => {
        console.error('Error al guardar el proveedor:', error);
      }, () => { this.dialogRef.close(); }
    );
  }

  actualizarProveedor() {
    const idprovee = this.data.idprovee;
    this.dataService.Put('proveedor', idprovee, this.proveedorForm.value).subscribe(
      response => {
        this.dataService.notify('Proveedor actualizado correctamente', 'Proveedor actualizado', this.dataService.alertType.success, new ALertOption());
      },
      error => {
        console.error('Error al guardar el proveedor:', error);
      }, () => { this.dialogRef.close(); }
    );
  }


  close() {
    this.dialogRef.close();
  }

}
