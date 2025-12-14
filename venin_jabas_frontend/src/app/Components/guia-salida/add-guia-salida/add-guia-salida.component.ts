import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef, MatPaginator, MatSort, MatTableDataSource } from "@angular/material";
import * as moment from "moment";
import { Cliente } from "src/app/Models/cliente/cliente";
import { DetallePago } from "src/app/Models/detallepago/detallepago";
import { Detguia } from "src/app/Models/guiasalida/detguia/detguia";
import { Sucursal } from "src/app/Models/sucursal/sucursal";
import { Transportista } from "src/app/Models/transportista/transportista";
import { DataService } from "src/app/Service/data.service";
import { AddVentaComponent } from "./add-venta/add-venta.component";
import { AddPagoComponent } from "./add-pago/add-pago.component";

@Component({
  selector: "app-add-guia-salida",
  templateUrl: "./add-guia-salida.component.html",
  styleUrls: ["./add-guia-salida.component.css"],
})

export class AddGuiaSalidaComponent implements OnInit {
  loading: boolean = false;
  loadingClientes = false;
  loadingTransportistas = false;
  guiaSalidaForm: FormGroup;
  today = new Date();
  currentTime = new Date();
  apellidoCliente: string = ""
  apellidoTransportista: string = ""
  clientes: Cliente[] = [];
  transportistas: Transportista[] = [];
  sucursales: Sucursal[] = [];
  detVenta: Detguia[] = [];
  detPago: DetallePago[] = [];
  ventaColumns: string[] = ["producto", "cantidad", "precio", "total", "acciones",];

  pagoColumns: string[] = ["fechaPago", "referencias", "importe", "acciones"];
  search_clientes = {
    top: 100,
    scale: "ASC",
    apellidos: "",
  };

  search_transportistas = {
    top: 100,
    scale: "ASC",
    apellidos: "",
  };

  dataSourceVentas: MatTableDataSource<any>;
  dataSourcePagos: MatTableDataSource<any>;
  operacionesVentas: any[] = [];
  operacionesPagos: any[] = [];

  @ViewChild(MatPaginator, { static: false }) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort!: MatSort;

  constructor(
    private fb: FormBuilder,
    private data: DataService,
    private dialogRef: MatDialogRef<AddGuiaSalidaComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public dataForm: any
  ) {
    this.dataSourceVentas = new MatTableDataSource(this.operacionesVentas);
    this.dataSourcePagos = new MatTableDataSource(this.operacionesPagos);

    this.guiaSalidaForm = this.fb.group({
      id: [null],
      fecha_guia: [moment().format("YYYY-MM-DD"), Validators.required],
      hora: [moment().format("HH:mm"), Validators.required],
      cliente: [null, Validators.required],
      transportista: [null, Validators.required],
      nombre_transportista: [''],
      nombre_cliente: [''],
      sucursal: [Number(data.getSucursalId()), Validators.required],
      referencia_guia: ["", [Validators.maxLength(40)]],
      ventas: this.fb.array([]), // Aquí guardaremos las filas de ventas
      pagos: this.fb.array([]),   // Aquí guardaremos las filas de pagos
    });
  }

  ngOnInit(): void {
    // Actualizar hora cada segundo
    this.getSucursales();
    console.log("Formulario creado:", this.guiaSalidaForm.value);
    const ventasArray = this.guiaSalidaForm.get('ventas') as FormArray;
    this.operacionesVentas.forEach(venta => {
      ventasArray.push(this.createVentaGroup(venta));
    });

    const pagosArray = this.guiaSalidaForm.get('pagos') as FormArray;
    this.operacionesPagos.forEach(pago => {
      pagosArray.push(this.createPagoGroup(pago));
    });

    console.log("DATAFORM recibido:", this.dataForm);

    if (this.dataForm && this.dataForm.id) {
      console.log("Modo edición, cargando datos con ID:", this.dataForm.id);
      this.cargarOperacion(this.dataForm.id);
    } else {
      console.log("Modo creación, no hay ID");
    }

    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  cargarOperacion(id: number): void {
    console.log("Llamando a backend para obtener guía salida con ID:", id);
    this.loading = true;
    this.data.GetFromId("guia_salida_completa", id.toString()).subscribe(
      (res: any) => {
        console.log("Respuesta del backend:", res);

        if (res) {
          const op = res;
          this.guiaSalidaForm.patchValue({
            id: op.idguiar,
            fecha_guia: op.fecha,
            hora: op.hora,
            cliente: op.idcliente,
            transportista: op.idtransporte,
            nombre_transportista: op.transporte,
            nombre_cliente: op.cliente,
            sucursal: op.idsucursal,
            referencia_guia: op.referencia
          });

          this.search_cliente({ apellidos: op.cliente });
          this.search_transportista({ apellidos: op.transporte });

          // Ventas
          const ventasArray = this.guiaSalidaForm.get('ventas') as FormArray;
          ventasArray.clear();
          this.operacionesVentas = op.detalleVentas || [];
          this.operacionesVentas.forEach(venta => {
            ventasArray.push(this.createVentaGroup(venta));
          });
          this.dataSourceVentas.data = this.operacionesVentas;

          // Pagos
          const pagosArray = this.guiaSalidaForm.get('pagos') as FormArray;
          pagosArray.clear();
          this.operacionesPagos = op.detallePagos || [];
          this.operacionesPagos.forEach(pago => {
            pagosArray.push(this.createPagoGroup(pago));
          });
          this.dataSourcePagos.data = this.operacionesPagos;
          console.log("Formulario después de cargar datos:", this.guiaSalidaForm.value);

        } else {
          console.warn("No se recibió respuesta válida del backend.");
          alert("No se recibió respuesta válida del backend.");
        }
        this.loading = false;
      },
      (err) => {
        console.error("Error HTTP al obtener guía salida:", err);
        this.loading = false;
      }
    );
  }

  createVentaGroup(venta): FormGroup {
    return this.fb.group({
      idproduct: [venta.idproduct],
      nombre: [venta.nombre, Validators.required],
      cantidad: [venta.cantidad, [Validators.required, Validators.pattern(/^\d+$/)]],
      precio: [venta.precio, [Validators.required]],
      total: [venta.total, [Validators.required]],
    });
  }

  agregarVenta(venta) {
    this.operacionesVentas.push(venta);
    const ventasArray = this.guiaSalidaForm.get('ventas') as FormArray;
    ventasArray.push(this.createVentaGroup(venta));
    this.dataSourceVentas.data = this.operacionesVentas;
  }

  createPagoGroup(pago): FormGroup {
    return this.fb.group({
      idpago: [pago.idpago],
      fechaPago: [pago.fechaPago, Validators.required],
      referencias: [pago.referencias, [Validators.required, Validators.maxLength(20)]],
      importe: [pago.importe, [Validators.required]],
    });
  }

  agregarPago(pago) {
    this.operacionesPagos.push(pago);
    const pagosArray = this.guiaSalidaForm.get('pagos') as FormArray;
    pagosArray.push(this.createPagoGroup(pago));
    this.dataSourcePagos.data = this.operacionesPagos;
  }

  getDetVentas() {
    this.data.GetSimple(this.data.api.detguia).subscribe((r) => {
      this.detVenta = r;
      this.dataSourceVentas.data = r;
      this.dataSourceVentas.sort = this.sort;
      this.dataSourceVentas.paginator = this.paginator;
    });
  }

  getDetPagos() {
    this.data.GetSimple(this.data.api.detallepago).subscribe((r) => {
      this.detPago = r;
      this.dataSourcePagos.data = r;
      this.dataSourcePagos.sort = this.sort;
      this.dataSourcePagos.paginator = this.paginator;
    });
  }

  getSucursales() {
    this.data.GetSimple(this.data.api.sucursal).subscribe(
      (res: any[]) => {
        this.sucursales = res;
      },
      (err) => {
        console.error("Error cargando sucursales", err);
      }
    );
  }

  onSearchCliente(term: string) {
    // opcional: filtrar si term es muy corto
    console.log("Buscando cliente con término:", term);
    if (!term || term.length < 2) {
      this.clientes = [];
      console.log("Término muy corto, limpiando lista de clientes.");
      return;
    }
    const searchPayload = { apellidos: term };  // o el campo que uses en backend para filtrar
    this.search_cliente(searchPayload);
  }

  search_cliente(searchParams: any) {
    this.loadingClientes = true;
    console.log("Enviando búsqueda con parámetros:", searchParams);

    this.data.Post("search_cliente", searchParams).subscribe(
      (r) => {
        this.loadingClientes = false;
        console.log("Respuesta del servidor:", r);
        if (!r || r.message !== "success") {
          console.error("Error en respuesta del backend:", r);
          this.clientes = [];
        } else {
          const items = r.data.map((item) => ({
            ...item,
            apellidoscompleto: item.apellidos || 'Sin nombre',
          }));
          console.log("Clientes formateados:", items);
          this.clientes = items;
        }
      },
      (e) => {
        this.loadingClientes = false;
        this.clientes = [];
        console.error("Error HTTP al buscar cliente:", e);
      }
    );
  }

  onSearchTransportista(term: string) {
    // opcional: filtrar si term es muy corto
    console.log("Buscando transportista con término:", term);
    if (!term || term.length < 2) {
      this.transportistas = [];
      console.log("Término muy corto, limpiando lista de transportistas.");
      return;
    }
    const searchPayload = { apellidos: term };  // o el campo que uses en backend para filtrar
    this.search_transportista(searchPayload);
  }

  search_transportista(searchParams: any) {
    this.loadingTransportistas = true;
    console.log("Enviando búsqueda con parámetros:", searchParams);

    this.data.Post("search_transportista", searchParams).subscribe(
      (r) => {
        this.loadingTransportistas = false;
        console.log("Respuesta del servidor:", r);
        if (!r || r.message !== "success") {
          console.error("Error en respuesta del backend:", r);
          this.transportistas = [];
        } else {
          const items = r.data.map((item) => ({
            ...item,
            apellidoscompleto: item.apellidos || 'Sin nombre',
          }));
          console.log("Transportistas formateados:", items);
          this.transportistas = items;
        }
      },
      (e) => {
        this.loadingTransportistas = false;
        this.transportistas = [];
        console.error("Error HTTP al buscar transportistas:", e);
      }
    );
  }
  calcularTotalVentas(): number {
    return this.operacionesVentas.reduce((acc, item) => acc + (item.total || 0), 0);
  }

  calcularTotalPagos(): number {
    return this.operacionesPagos.reduce((acc, item) => acc + (item.importe || 0), 0);
  }

  addVenta() {
    const dialogRef = this.dialog.open(AddVentaComponent, {
      width: "600px",
      disableClose: true,
      data: {},
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("Venta agregada desde diálogo:", result);
        this.operacionesVentas.push(result);
        this.dataSourceVentas.data = this.operacionesVentas; // actualizar tabla
      }
    });
  }

  addPago() {
    const dialogRef = this.dialog.open(AddPagoComponent, {
      width: "600px",
      disableClose: true,
      data: {},
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log("Pago agregada desde diálogo:", result);
        this.operacionesPagos.push(result);
        this.dataSourcePagos.data = this.operacionesPagos; // actualizar tabla
      }
    });
  }

  onSubmit(): void {
    if (this.guiaSalidaForm.valid && this.operacionesVentas.length > 0) {

      this.loading = true;

      const formData = this.guiaSalidaForm.value;
      const idcliente = formData.cliente && formData.cliente.id ? formData.cliente.id : formData.cliente;
      const idtransporte = formData.transportista && formData.transportista.id ? formData.transportista.id : formData.transportista;
      const idsucursal = formData.sucursal && formData.sucursal.id ? formData.sucursal.id : formData.sucursal;
      const total = this.calcularTotalVentas()
      const pago = this.calcularTotalPagos()
      const estado = total === pago ? 'CAN' : 'EMI'


      const guiaData = {
        fecha: formData.fecha_guia,
        hora: formData.hora,
        estado: estado,
        referencia: formData.referencia_guia,
        total: total,
        pago: pago,
        idcliente: idcliente,
        idtransporte: idtransporte,
        idsucursal: idsucursal,
        detalleVentas: this.operacionesVentas,
        detallePagos: this.operacionesPagos,
      };

      const idOperacion = formData.id;
      console.log("Id: ", idOperacion);
      if (idOperacion) {
        // MODO EDICIÓN: hacer PUT o PATCH
        this.data.Put("guia_salida_completa", idOperacion.toString(), guiaData).subscribe(
          (res) => {
            this.loading = false;
            console.log("Guía actualizada correctamente:", res);
            this.dialogRef.close(res);
          },
          (error) => {
            this.loading = false;
            console.error("Error al actualizar la guía:", error);
            alert("Error al actualizar la guía de salida.");
            this.dialogRef.close(error);
          }
        );
      } else {
        // MODO CREACIÓN: hacer POST
        this.data.Post("guia_salida_completa", guiaData).subscribe(
          (res) => {
            this.loading = false;
            console.log("Guía creada correctamente:", res);
            this.dialogRef.close(res);
          },
          (error) => {
            this.loading = false;
            console.error("Error al guardar la guía:", error);
            alert("Error al guardar la guía de salida.");
            this.dialogRef.close(error);
          }
        );
      }
      
    } else {
      console.warn("Formulario inválido o sin ventas");
      alert("Formulario inválido o sin ventas");
      this.loading = false;
    }
  }

  editarOperacionVentas(venta: any): void {
    console.log("Intentando editar venta:", venta);
    if (!venta) {
      console.warn("La venta recibida está vacía o undefined");
      return;
    }
    const index = this.operacionesVentas.indexOf(venta);
    console.log("Índice encontrado para editar:", index);
    if (index === -1) {
      console.warn("La venta no fue encontrada en operacionesVentas");
      return;
    }
    const dialogRef = this.dialog.open(AddVentaComponent, {
      width: '600px',
      disableClose: true,
      data: venta
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log("Resultado del diálogo (edición):", result);
      if (result) {
        this.operacionesVentas[index] = result;
        this.dataSourceVentas.data = [...this.operacionesVentas];
        const ventasArray = this.guiaSalidaForm.get('ventas') as FormArray;
        ventasArray.at(index).patchValue(result);
        console.log("Venta editada y formulario actualizado:", result);
      } else {
        console.log("Edición cancelada por el usuario");
      }
    });
  }

  anularOperacionVentas(venta: any): void {
    console.log("Intentando anular venta:", venta);
    if (!venta) {
      console.warn("La venta recibida está vacía o undefined");
      return;
    }
    const index = this.operacionesVentas.indexOf(venta);
    console.log("Índice encontrado para anular:", index);
    if (index === -1) {
      console.warn("La venta no fue encontrada en operacionesVentas");
      return;
    }
    if (confirm('¿Seguro que quieres eliminar esta venta?')) {
      this.operacionesVentas.splice(index, 1);
      this.dataSourceVentas.data = [...this.operacionesVentas];
      const ventasArray = this.guiaSalidaForm.get('ventas') as FormArray;
      ventasArray.removeAt(index);
      console.log("Venta eliminada correctamente del array y formulario");
    } else {
      console.log("Eliminación cancelada por el usuario");
    }
  }

  editarOperacionPagos(pago: any): void {
    console.log("Editando... pagos", pago);
    const index = this.operacionesPagos.indexOf(pago);
    console.log("Índice encontrado:", index);
    if (index === -1) return;

    const dialogRef = this.dialog.open(AddPagoComponent, {
      width: '600px',
      disableClose: true,
      data: pago
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.operacionesPagos[index] = result;
        this.dataSourcePagos.data = [...this.operacionesPagos];
        const pagosArray = this.guiaSalidaForm.get('pagos') as FormArray;
        pagosArray.at(index).patchValue(result);
      }
    });
  }

  anularOperacionPagos(pago: any): void {
    console.log("Anulando... pagos", pago);
    const index = this.operacionesPagos.indexOf(pago);
    console.log("Índice encontrado:", index);
    if (index === -1) return;
    if (confirm('¿Seguro que quieres eliminar este pago?')) {
      this.operacionesPagos.splice(index, 1);
      this.dataSourcePagos.data = [...this.operacionesPagos];
      const pagosArray = this.guiaSalidaForm.get('pagos') as FormArray;
      pagosArray.removeAt(index);
    }
  }
  onCancel(): void {
    this.dialogRef.close();
  }
}

