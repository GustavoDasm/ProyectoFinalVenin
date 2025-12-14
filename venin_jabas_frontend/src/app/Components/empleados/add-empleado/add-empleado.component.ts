import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { inject } from '@angular/core/testing';
import { DataService } from 'src/app/Service/data.service';
import * as moment from 'moment';
@Component({
  selector: 'app-add-empleado',
  templateUrl: './add-empleado.component.html',
  styleUrls: ['./add-empleado.component.css']
})
export class AddEmpleadoComponent implements OnInit {
  loading = false;
  empleadoForm: FormGroup;
  today = new Date();
  currentTime = new Date();

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    private dialogRef: MatDialogRef<AddEmpleadoComponent>,  
    @Inject(MAT_DIALOG_DATA) public data:any,
  ) {
    this.empleadoForm = this.fb.group({
    id: [null],
    apellidos: ['', [Validators.maxLength(40)]],
    nombres: ['', [Validators.maxLength(40)]],
    sexo: ['', [Validators.maxLength(1)]],
    estado_civil: ['', [Validators.maxLength(4)]],
    direccion: ['', [Validators.maxLength(50)]],
    localidad: ['', [Validators.maxLength(25)]],
    provincia: ['', [Validators.maxLength(25)]],
    ciudad: ['', [Validators.maxLength(35)]],
    distrito: ['', [Validators.maxLength(25)]],
    nacional: ['', [Validators.maxLength(25)]],
    cargo: ['', [Validators.maxLength(25)]],
    tipo_trabajador: ['', [Validators.maxLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    codigo: ['', [Validators.maxLength(5), Validators.pattern(/^\d+$/), Validators.min(1)]], //en el backend se llama numtarjeta
    clase: ['', [Validators.maxLength(15)]],
    telefono: ['', Validators.pattern(/^\d{9}$/)],
    tipo_documento: ['', [Validators.maxLength(1)]],
    le_dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    fecha_nacimiento: [moment().format('YYYY-MM-DD'), Validators.required],
    fecha_ingreso: [moment().format('YYYY-MM-DD'), Validators.required],
    fecha_cese: [moment().format('YYYY-MM-DD'), Validators.required],
    situacion: ['', [Validators.maxLength(10)]],
    regimen: ['', [Validators.maxLength(10)]],
    clasificacion_especial: ['', [Validators.maxLength(4)]], //en el backend se llama nivel
    });
  }

  ngOnInit(): void {
    // Actualizar hora cada segundo
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  saveEmpleado(empleado: any): void {
    this.dataService.Post("empleado", empleado).subscribe(
      (res) => {
        console.log('Empleado guardado:', res);
        this.dialogRef.close(res);
      },
      (error) => {
        console.error('Error al guardar el empleado:', error);
      }
    );
  }
  onSubmit(): void {
/*     if (this.caja_efectivo.valid) {
      const operacion = this.caja_efectivo.value;
      if (this.editMode) {
        this.editOperacion(operacion, operacion.id);
      }else{
  
        this.saveOperacion(operacion);
      }
    } */
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
