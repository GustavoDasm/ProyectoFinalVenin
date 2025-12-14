import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DataService } from 'src/app/Service/data.service';

@Component({
  selector: 'app-add-transportista',
  templateUrl: './add-transportista.component.html',
  styleUrls: ['./add-transportista.component.css']
})
export class AddTransportistaComponent implements OnInit {

  form: FormGroup;
  loading = false;
  isEdit = false;
  titulo = 'Nuevo transportista';

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private dialogRef: MatDialogRef<AddTransportistaComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id?: number }
  ) {
    this.form = this.fb.group({
      idtrans: [null],
      apellidos: ['', [Validators.required, Validators.maxLength(50)]],
      celular: ['', [Validators.maxLength(15)]]
    });
  }

  ngOnInit(): void {
    if (this.data && this.data.id) {
      this.isEdit = true;
      this.titulo = 'Editar transportista';
      this.loadTransportista(this.data.id);
    }
  }

  loadTransportista(id: number) {
    this.loading = true;
    this.dataService.GetFromId('transportista', id.toString()).subscribe(
      (res: any) => {
        this.loading = false;
        if (res) {
          this.form.patchValue({
            idtrans: res.idtrans,
            apellidos: res.apellidos,
            celular: res.celular
          });
        }
      },
      err => {
        this.loading = false;
        console.error('Error cargando transportista', err);
        try {
          this.dataService.notify('Error cargando datos', 'Error', this.dataService.alertType.error);
        } catch (e) { /* ignore */ }
      }
    );
  }

  // Método minimalista: decide si crear o actualizar
  guardar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      idtrans: this.form.value.idtrans,
      apellidos: this.form.value.apellidos,
      celular: this.form.value.celular
    };

    if (this.isEdit && payload.idtrans) {
      this.updateTransportista(payload.idtrans, payload);
    } else {
      this.createTransportista(payload);
    }
  }

  // Crear
  private createTransportista(payload: any) {
    this.loading = true;
    this.dataService.Post('transportista', payload).subscribe(
      (res: any) => {
        this.loading = false;
        try {
          this.dataService.notify('Transportista creado', 'Éxito', this.dataService.alertType.success);
        } catch (e) { /* ignore */ }
        this.dialogRef.close(res);
      },
      err => {
        this.loading = false;
        console.error('Error creando transportista', err);
        try {
          this.dataService.notify('Error al crear transportista', 'Error', this.dataService.alertType.error);
        } catch (e) { /* ignore */ }
      }
    );
  }

  // Actualizar
  private updateTransportista(id: number, payload: any) {
    this.loading = true;
    this.dataService.Put('transportista', id.toString(), payload).subscribe(
      (res: any) => {
        this.loading = false;
        try {
          this.dataService.notify('Transportista actualizado', 'Éxito', this.dataService.alertType.success);
        } catch (e) { /* ignore */ }
        this.dialogRef.close(res);
      },
      err => {
        this.loading = false;
        console.error('Error actualizando transportista', err);
        try {
          this.dataService.notify('Error al actualizar transportista', 'Error', this.dataService.alertType.error);
        } catch (e) { /* ignore */ }
      }
    );
  }

  cancelar() {
    this.dialogRef.close();
  }

  // getters para template
  get apellidos() { return this.form.get('apellidos'); }
  get celular() { return this.form.get('celular'); }




}
