import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material";
import { Articulos } from "src/app/Models/articulos/articulos";
import { DataService } from "src/app/Service/data.service";

@Component({
  selector: "app-add-venta",
  templateUrl: "./add-venta.component.html",
  styleUrls: ["./add-venta.component.css"],
})
export class AddVentaComponent implements OnInit {
  loadingArticulos = false;
  addVentaForm: FormGroup;
  today = new Date();
  currentTime = new Date();
  articulos: Articulos[] = [];
  search_articulos = {
    top: 100,
    scale: "ASC",
    nombre: "",
  };

  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private dialogRef: MatDialogRef<AddVentaComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dataForm: any
  ) {
    this.addVentaForm = this.fb.group({
      idproduct: [null],
      nombre: ["", [Validators.required, Validators.maxLength(25)]],
      cantidad: [null, [Validators.required, Validators.pattern(/^\d+$/)]],
      precio: [
        null,
        [
          Validators.required,
          Validators.maxLength(12),
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      ],
      total: [
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
    console.log("Formulario creado:", this.addVentaForm.value);
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);

    if (this.dataForm) {
      this.addVentaForm.patchValue(this.dataForm);
    }

    const cantidadControl = this.addVentaForm.get('cantidad');
    if (cantidadControl) {
      cantidadControl.valueChanges.subscribe(() => this.calcularTotal());
    }

    const precioControl = this.addVentaForm.get('precio');
    if (precioControl) {
      precioControl.valueChanges.subscribe(() => this.calcularTotal());
    }
  }

  calcularTotal() {
    const cantidadControl = this.addVentaForm.get('cantidad');
    const precioControl = this.addVentaForm.get('precio');
    const totalControl = this.addVentaForm.get('total');

    const cantidad = cantidadControl ? cantidadControl.value : 0;
    const precio = precioControl ? precioControl.value : 0;
    const total = parseFloat((cantidad * precio).toFixed(2));

    if (totalControl) {
      totalControl.setValue(total, { emitEvent: false });
    }
  }

  onArticuloSelected(articulo: any) {
    if (articulo) {
      this.addVentaForm.patchValue({
        idproduct: articulo.idproduct,
        nombre: articulo.nombre,
        precio: articulo.precio,
      });

      this.calcularTotal(); // recalcular si ya hay cantidad
    }
  }

  onSearchArticulos(term: string) {
    // opcional: filtrar si term es muy corto
    console.log("Buscando articulo con término:", term);
    if (!term || term.length < 2) {
      this.articulos = [];
      console.log("Término muy corto, limpiando lista de articulos.");
      return;
    }
    const searchPayload = { nombre: term }; // o el campo que uses en backend para filtrar
    this.search_articulo(searchPayload);
  }

  search_articulo(searchParams: any) {
    this.loadingArticulos = true;
    console.log("Enviando búsqueda con parámetros:", searchParams);

    this.data.Post("search_articulos", searchParams).subscribe(
      (r) => {
        this.loadingArticulos = false;
        console.log("Respuesta del servidor:", r);
        if (!r || r.message !== "success") {
          console.error("Error en respuesta del backend:", r);
          this.articulos = [];
        } else {
          const items = r.data.map((item) => ({
            ...item,
            nombreArticulo: item.nombre || "Sin nombre",
          }));
          console.log("Articulos formateados:", items);
          this.articulos = items;
        }
      },
      (e) => {
        this.loadingArticulos = false;
        this.articulos = [];
        console.error("Error HTTP al buscar articulos:", e);
      }
    );
  }

  onSubmit(): void {
    if (this.addVentaForm.valid) {
      const venta = this.addVentaForm.value;
      console.log("Enviando venta:", venta);
      this.dialogRef.close(venta); // aquí enviamos los datos al componente padre
    }
  }
  onCancel(): void {
    this.dialogRef.close();
  }
}
