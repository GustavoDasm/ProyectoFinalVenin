import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import * as moment from 'moment';
import { DataService } from 'src/app/Service/data.service';

@Component({
  selector: 'app-add-pago',
  templateUrl: './add-pago.component.html',
  styleUrls: ['./add-pago.component.css']
})
export class AddPagoComponent implements OnInit {

  addPagoForm: FormGroup;
  today = new Date();
  tiposPago:any[] = []
  currentTime = new Date();

  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private dialogRef: MatDialogRef<AddPagoComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dataForm: any,
  ) {
    this.addPagoForm = this.fb.group({
      idpago: [null],
      fechaPago: [moment().format("YYYY-MM-DD"), Validators.required],
      referencias: ["", [Validators.required, Validators.maxLength(20)]],
      tipo_pago: ["", [Validators.required]],
      importe: [
        null,
        [
          Validators.required,
          Validators.maxLength(12),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
    });
  }

  ngOnInit():void {
    console.log("Formulario creado:", this.addPagoForm.value);
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    this.getTiposPago();
    if (this.dataForm) {
      this.addPagoForm.patchValue(this.dataForm);
    }
  }

  getTiposPago(){
    this.data.GetSimple('tarjetacre').subscribe((res:any)=>{
      this.tiposPago = res;
      console.log("Tipos de pago:", this.tiposPago);
    })
  }

  onSubmit(): void {
    if (this.addPagoForm.valid) {
      const pago = this.addPagoForm.value;
      console.log("Enviando pago:", pago);
      this.dialogRef.close(pago); // aquí enviamos los datos al componente padre
    }
  }
  onCancel(): void {
    this.dialogRef.close();
  }

}
