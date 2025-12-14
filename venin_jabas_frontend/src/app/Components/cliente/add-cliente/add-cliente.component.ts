import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material";
import { Articulos } from "src/app/Models/articulos/articulos";
import { Cliente } from 'src/app/Models/cliente/cliente';
import { DataService } from "src/app/Service/data.service";

@Component({
  selector: 'app-add-cliente',
  templateUrl: './add-cliente.component.html',
  styleUrls: ['./add-cliente.component.css']
})
export class AddClienteComponent implements OnInit {

  loadingClientes = false;
  addClienteForm: FormGroup;
  clientes: Cliente[] = [];
  search_articulos = {
    top: 100,
    scale: "ASC",
    nombre: "",
  };

  tiposDocumento = [
    { codigo: 'D', nombre: 'DNI' },
    { codigo: 'R', nombre: 'RUC' },
    { codigo: 'C', nombre: 'CARNET' },
  ];

  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private dialogRef: MatDialogRef<AddClienteComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dataForm: any
  ) {
    this.addClienteForm = this.fb.group({
      id: [null],
      apellidos: ["", [Validators.required, Validators.maxLength(50)]],
      celular: ["", [Validators.required, Validators.maxLength(15)]],
      tipodoc: ["", [Validators.required, Validators.maxLength(1)]],
      numero: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
    });
  }

  ngOnInit(): void {
    console.log("Formulario creado:", this.addClienteForm.value);

    console.log("DATAFORM recibido:", this.dataForm);
    if (this.dataForm && this.dataForm.id) {
      console.log("Modo edición, cargando datos con ID:", this.dataForm.id);
      this.cargarCliente(this.dataForm.id);
    } else {
      console.log("Modo creación, no hay ID");
    }
  }
  cargarCliente(id: number): void {
    console.log("Llamando a backend para obtener el cliente con ID:", id);

    this.data.GetFromId("cliente", id.toString()).subscribe(
      (res: any) => {
        console.log("Respuesta del backend:", res);

        if (res) {
          const op = res;
          this.addClienteForm.patchValue({
            id: op.idcliente,
            apellidos: op.apellidos,
            celular: op.celular,
            tipodoc: op.tipodoc,
            numero: op.numero
          });

          console.log("Formulario después de cargar datos:", this.addClienteForm.value);

        } else {
          console.warn("No se recibió respuesta válida del backend.");
        }
      },
      (err) => {
        console.error("Error HTTP al obtener cliente:", err);
      }
    );
  }

  onSubmit(): void {
    if (this.addClienteForm.invalid) {
      this.addClienteForm.markAllAsTouched();
      return;
    }

    const clienteData = this.addClienteForm.value;
    if (clienteData.id) {
      console.log("Actualizando cliente con ID:", clienteData.id);
      this.data.Put("cliente", clienteData.id, clienteData).subscribe({
        next: (response) => {
          console.log("Cliente actualizado correctamente", response);
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error("Error al actualizar cliente", err);
        }
      });

    } else {
      console.log("Creando nuevo cliente");
      this.data.Post("cliente", clienteData).subscribe({
        next: (response) => {
          console.log("Cliente creado exitosamente", response);
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error("Error al crear cliente", err);
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
