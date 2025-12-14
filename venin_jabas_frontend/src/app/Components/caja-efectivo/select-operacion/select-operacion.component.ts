import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-select-operacion',
  templateUrl: './select-operacion.component.html',
  styleUrls: ['./select-operacion.component.css']
})
export class SelectOperacionComponent implements OnInit {

  constructor(private dialogRef: MatDialogRef<SelectOperacionComponent>) {}

  select(tipo: 'ingreso' | 'salida') {
    this.dialogRef.close(tipo); // cierra y devuelve 'ingreso' o 'salida'
  }

  ngOnInit() {
  }

}
