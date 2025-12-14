import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Personal } from 'src/app/Models/personal/personal';
import * as moment from 'moment';
import { Usuario } from 'src/app/Models/usuario/usuario';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';

@Component({
  selector: 'app-add-caja-efectivo',
  templateUrl: './add-caja-efectivo.component.html',
  styleUrls: ['./add-caja-efectivo.component.css'],
  providers: [DatePipe]
})
export class AddCajaEfectivoComponent implements OnInit {

  loading = false;
  caja_efectivo: FormGroup;
  editMode = false;
  tipoOperacion: 'ingreso' | 'salida';
  today = new Date();
  usuario: Usuario = new Usuario();
  currentTime = new Date();
  currentUser = 'Usuario Actual'; // Reemplazar con dato real
  establecimientos = []; // Reemplazar con datos reales
  tiposIngresos: any[] = [];
  tiposSalidas: any[] = [];
  subTiposSalidas: any[] = [];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private dataService: DataService,
    public dialogRef: MatDialogRef<AddCajaEfectivoComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private datePipe: DatePipe
  ) {
    this.tipoOperacion = data.tipo_operacion;
    console.log("Establecimiento: ",dataService.getSucursalId());
    
    this.caja_efectivo = this.fb.group({
      id: [null],
      fecha: [moment().format('YYYY-MM-DD'), Validators.required],
      hora: [moment().format('HH:mm'), Validators.required],
      serie: ['', [Validators.maxLength(4)]],
      numero: ['', [Validators.maxLength(8)]],
      tipodoc: ['', [Validators.maxLength(3)]],
      personal: [dataService.getPersonalId(), Validators.required],
      personal_nombre: [dataService.getPersonalNombre(), Validators.required],
      tipocaja: [this.tipoOperacion === 'ingreso' ? 'I' : 'S', Validators.required],
      tipo_operacion: [null, Validators.required],
      referencia: ['', [Validators.maxLength(100)]],
      importe: [0, [Validators.required, Validators.min(0.01)]],
      estado: ['emitido', Validators.required],
      establecimiento: [Number(dataService.getSucursalId()) || null, Validators.required],
      subtipo_operacion: [null],
    });

    this.usuario = this.auth.getCurrentUser();
    console.log('Usuario actual:', this.usuario);
    
  }

  ngOnInit(): void {
    // Actualizar hora cada segundo
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
    this.getMovimientos() 
    this.getSucursales()
    
    if (this.data.id) {
      this.editMode = true;
      this.getCajaEfectivo(this.data.id);
    }
  }
  getCajaEfectivo(id: any) {
    this.loading = true;
    this.dataService.GetFromId("cajaefectivo", id).subscribe(
      (res) => {
        this.caja_efectivo.patchValue({
          id: res.id,
          fecha: res.fecha,
          hora: res.hora,
          serie: res.serie,
          numero: res.numero,
          tipodoc: res.tipodoc,
          personal: res.personal,
          tipocaja: res.tipocaja,
          tipo_operacion: res.tipo_operacion,
          subtipo_operacion: res.subtipo_operacion,
          referencia: res.referencia,
          importe: res.importe,
          estado: res.estado,
          establecimiento: res.establecimiento,
          personal_nombre: res.personal_nombre,
          establecimiento_nombre: res.establecimiento_nombre
        });

        if (res.subtipo_operacion) {
          this.getSubTipos(res.tipo_operacion);
          
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error al obtener la caja de efectivo:', error);
        this.loading = false;
        this.onCancel()
      }
    )
  }

  getMovimientos(){
    this.dataService.GetSimple("tipomovimiento").subscribe(
      (res) => {
        console.log(res);
        
        if (this.tipoOperacion === 'ingreso') {
          this.tiposIngresos = res.filter(mov => mov.categoria == 'I');
          console.log("Tipos de ingresos:", this.tiposIngresos);
          
        } else {
          this.tiposSalidas = res.filter(mov => mov.categoria == 'S');
          // const planilla = this.tiposSalidas.find(mov => mov.descripcion === 'Planilla');
          // if (planilla) {
          //   this.getSubTipos(planilla.id);
          // }
          console.log("Tipos de salidas:", this.tiposSalidas);
          
        }
      },
      (error) => {
        console.error('Error al obtener tipos de movimientos:', error);
      }
    )
  }

  getSubTipos(id:string){
    console.log("Obteniendo id de tipo de movimiento:", id);
    
    this.subTiposSalidas = []
    this.dataService.GetFromValue("subtipomovimiento", "tipomovimiento", id).subscribe(
      (res) => {
        this.subTiposSalidas = res;
        // if (this.subTiposSalidas.length > 0) {
        //   this.caja_efectivo.patchValue({ subtipo_operacion: null });
        // }
        console.log("Subtipos de salida:", this.subTiposSalidas);
      },
      (error) => {
        console.error('Error al obtener subtipos de movimientos:', error);
      }
    )
  }

  getSucursales(){
    this.dataService.GetSimple("sucursal").subscribe(
      (res) => {
        this.establecimientos = res;
        console.log("Sucursales:", this.establecimientos);
      },
      (error) => {
        console.error('Error al obtener sucursales:', error);
      }
    );
  }

  saveOperacion(operacion: any): void {
    this.loading = true;
    this.dataService.Post("cajaefectivo", operacion).subscribe(
      (res) => {
        console.log('Operación guardada:', res);
        this.loading = false;
        this.dialogRef.close(res); // Cerrar el diálogo y pasar la operación guardada
      },
      (error) => {
        console.error('Error al guardar la operación:', error);
        this.loading = false;
      })
  }

  editOperacion(operacion: any, id:any): void {
    this.loading = true;
    this.dataService.Put("cajaefectivo", id, operacion).subscribe(
      (res) => {
        console.log('Operación actualizada:', res);
        this.loading = false;
        this.dialogRef.close(res); // Cerrar el diálogo y pasar la operación guardada
      },
      (error) => {
        console.error('Error al guardar la operación:', error);
        this.loading = false;
      })
  }

  onSubmit(): void {
    if (this.caja_efectivo.valid) {
      const operacion = this.caja_efectivo.value;
      if (this.editMode) {
        this.editOperacion(operacion, operacion.id);
      }else{
  
        this.saveOperacion(operacion);
      }
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

}
