import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ALertOption } from 'src/app/Models/alert/alert-option';
import { DataService } from 'src/app/Service/data.service';

@Component({
  selector: 'app-add-personal',
  templateUrl: './add-personal.component.html',
  styleUrls: ['./add-personal.component.css']
})
export class AddPersonalComponent implements OnInit {
  personalForm: FormGroup;
  constructor(private fb: FormBuilder, private dataService: DataService,
    public dialogRef: MatDialogRef<AddPersonalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  ngOnInit() {
    this.initializeForm();
    if (this.isEditMode()) {
      this.getSolicitud();
    }
  }

  getSolicitud() {

    this.dataService.GetFromId(this.dataService.api.personal, this.data.id).subscribe((res) => {
      console.log("Personal", res);
      const personalData = res;
      this.personalForm.patchValue({
        nombre: personalData.nombre ? personalData.nombre : '',
        direccion: personalData.direccion ? personalData.direccion : '',
        tipodocumento: personalData.tipodocumento ? personalData.tipodocumento : '',
        documento: personalData.documento ? personalData.documento : '',
        fecha_ingreso: personalData.fecha_ingreso ? personalData.fecha_ingreso : null,
        notas: personalData.notas ? personalData.notas : '',
        cargo: personalData.cargo ? personalData.cargo : '',
        celular: personalData.celular ? personalData.celular : '',
        idusuario: personalData.idusuario ? personalData.id : null,
        idsucursal: personalData.idsucursal ? personalData.idsucursal : 1
      });


    }, (error) => {
      console.log(error);

    }, () => { })
  }

  isEditMode(): boolean {
    return this.data && this.data.id !== undefined;
  }

  initializeForm(): void {
    this.personalForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(40)]],
      direccion: ['', Validators.maxLength(40)],
      tipodocumento: ['1', Validators.required],
      documento: ['', [Validators.required, Validators.maxLength(20)]],
      fecha_ingreso: [new Date()],
      notas: ['', Validators.maxLength(50)],
      cargo: ['VEN'],
      celular: ['', Validators.maxLength(15)],
      activo: ['1'],
      idusuario: [null],
      idsucursal: [1]
    });
  }


  close() {
    this.dialogRef.close();
  }

  save() {
    if (this.personalForm.valid) {
      console.log('Formulario válido:', this.personalForm.value);

      if (this.isEditMode()) {
        this.actualizarPersonal();
      }else{
        this.guardarPersonal();
      }

    } else {
      console.log('Formulario inválido');
    }
  }


  guardarPersonal() {
    this.dataService.Post(this.dataService.api.personal, this.personalForm.value).subscribe(
      (response) => {
        this.dataService.notify("Personal guardado correctamente", "Éxito", this.dataService.alertType.success, new ALertOption(), () => { this.close() });

      },
      (error) => {
        console.error('Error al guardar el personal:', error);
        this.dataService.notify("Error al guardar personal", "Error", this.dataService.alertType.error, new ALertOption(), () => {  });
      }
    );
  }

  actualizarPersonal() {
    this.dataService.Put(this.dataService.api.personal, this.data.id, this.personalForm.value).subscribe(
      (response) => {
        this.dataService.notify("Personal actualizado correctamente", "Éxito", this.dataService.alertType.success, new ALertOption(), () => { this.close() });

      },
      (error) => {
        this.dataService.notify("Error al actualizar personal", "Error", this.dataService.alertType.error, new ALertOption(), () => {  });
      }
    );
   }
}
