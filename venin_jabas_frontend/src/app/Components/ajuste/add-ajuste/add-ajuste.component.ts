import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { Ajuste } from 'src/app/Models/ajuste/ajuste';
import { Detajuste } from 'src/app/Models/ajuste/detajuste/detajuste';
import { ALertOption } from 'src/app/Models/alert/alert-option';
import { AlertType } from 'src/app/Models/alert/alert-type';
import { Articulo } from 'src/app/Models/articulo/articulo';
import { Filtro } from 'src/app/Models/filtro/filtro';
import { Moneda } from 'src/app/Models/moneda/moneda';
import { Motivo } from 'src/app/Models/motivo/motivo';
import { TipoOperacion } from 'src/app/Models/tipooperacion/tipo-operacion';
import { Usuario } from 'src/app/Models/usuario/usuario';
import { AlertComponent } from '../../objects/alert/alert/alert.component';
import { DatePipe } from '@angular/common';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';
import { ComprasArticuloComponent } from '../../compras/compras-detcompra/compras-detcompra.component';
import { InfoComponent } from '../../objects/info/info/info.component';
import { LoadingComponent } from '../../objects/loading/loading.component';
import { forkJoin, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-add-ajuste',
  templateUrl: './add-ajuste.component.html',
  styleUrls: ['./add-ajuste.component.css']
})
export class AddAjusteComponent implements OnInit {

  public funcion: Function;
  public isShow: boolean = false;
  public usuario: Usuario = new Usuario();
  public ajuste: Ajuste = new Ajuste();
  public tipos_opera: TipoOperacion[] = [];
  public detajustes: Detajuste[] = [];
  public detajustesAnteriores: Detajuste[] = [];
  public motivos: Motivo[] = [];
  public detajuste: Detajuste = new Detajuste();
  public articulo: Articulo = new Articulo();
  public monedas: Moneda[] = [];
  public alertType: AlertType = new AlertType();
  public options: ALertOption = new ALertOption();
  public isadddetajuste: boolean = false;
  public index: number = 0;
  public numitem: number = 0;
  public pagarticulo: any;
  public isedit: Boolean = false;
  public filtroguia: Filtro = new Filtro()
  @ViewChild('btnshowFactura', null) btnshowFactura: ElementRef;
  @ViewChild('btnclose', null) btnclose: ElementRef;
  @ViewChild('artloading', null) artloading: LoadingComponent;
  @ViewChild('artinfo', null) artinfo: InfoComponent;
  @ViewChild(AlertComponent, null) alert: AlertComponent;
  @ViewChildren('icon0, icon1, icon2, icon3') icons: QueryList<ElementRef>;
  @ViewChild('btnshow', null) btnshowcompr: ElementRef;
  @ViewChild('listadetajuste', null) listadetajuste: ElementRef;
  @ViewChild(ComprasArticuloComponent, null) public frmcomprasdetalles: ComprasArticuloComponent;
  @ViewChild(LoadingComponent, null) loading: LoadingComponent;
  @ViewChild(InfoComponent, null) info: InfoComponent;
  @ViewChild('txtdireccion', null) txtdireccion: ElementRef;



  constructor(private data: DataService, private datepipe: DatePipe, private auth: AuthService) {
    this.usuario = this.auth.getCurrentUser();
  }

  ngOnInit() {

  }

  public show(affterfunction: Function = null) {

    this.funcion = affterfunction;
    this.isShow = true;
    this.detajustes = [];
    this.detajustesAnteriores = [];
    setTimeout(async () => {
      this.btnshowFactura.nativeElement.click();
      this.artloading.show('Cargando datos');
      console.log(this.ajuste.fecha);
      //this.Enable()
      // this.GetTiposOperaciones();
      // this.GetMotivos();
      // this.getMonedas();
      if (this.isedit) {
        this.GetAjuste()
        this.ajuste.idsucursal = this.ajuste.idsucursal.idsucursal;
      }
      //this.PrepararData();
      this.artloading.hide();
    }, 10);
  }


  getMonedas() {
    this.data.GetSimple(this.data.api.moneda).subscribe(r => {
      console.log(r);
      this.monedas = r;
    })
  }

  GetTiposOperaciones() {
    this.data.GetSimple(this.data.api.tip_opetbl12).subscribe(r => {
      this.tipos_opera = r;
    }), (e => { console.log(e.eror.text) });
  }

  GetMotivos() {
    this.data.GetSimple(this.data.api.motivo).subscribe(r => {
      this.motivos = r;
    }), (e => { console.log(e.eror.text) });
  }


  GetAjuste() {
    console.log(this.ajuste.idajuste);
    
    this.data.GetFromId('ajuste', this.ajuste.idajuste.toString()).subscribe(
      (r) => {
        console.log(r);
        if (r.idajuste && r.detalles.length > 0) {
          const ajuste = r as Ajuste;
          const detalles = r.detalles as any[];
          this.ajuste = ajuste;
          this.detajustes = detalles.map(det => {
            const newdetalle: Detajuste = new Detajuste();
            newdetalle.idajuste = this.ajuste.idajuste;
            newdetalle.id_det = det.id;
            newdetalle.cantidad = det.cantidad;
            newdetalle.articulo = det.articulo;
            newdetalle.idproduct = det.idproduct;
            return newdetalle;
          });
          this.detajustesAnteriores = [...this.detajustes];
          console.log("Detalles anteriores:", this.detajustesAnteriores);
          
        }
        // r.data.forEach(det => {
        //   let newdetalle: Detajuste = new Detajuste()
        //   newdetalle.idajuste = this.ajuste.idajuste
        //   newdetalle.id_det = det.id_det
        //   newdetalle.cantidad = det.cantidad;
        //   newdetalle.articulo = det.idproduct;
        //   newdetalle.idproduct = det.idproduct.idproduct;
        //   this.detajustes.push(newdetalle);
        //   this.detajustesAnteriores.push(newdetalle);
        // });
      },
      (error) => {
        console.log(error);
      }
    )
  }

  ShowNewDetcompra() {

    this.frmcomprasdetalles.articulo = null;
    this.frmcomprasdetalles.show(() => {
      let newdetalle: Detajuste = new Detajuste();

      if (this.frmcomprasdetalles.articulo != null) {
        newdetalle.articulo = this.frmcomprasdetalles.articulo;
        newdetalle.idproduct = this.frmcomprasdetalles.articulo.idproduct;
        this.detajustes.push(newdetalle);
      }
    });
  }

  UpdateDetCompra(index: number, field: string, value: string) {
    this.detajustes[index][field] = value;
    if (field === 'cantidad' || field === 'texto' || field === 'valunit') {
      this.PrepararAjuste(index);
    }
  }

  async GuardarDetalle() {
    console.log(this.detajuste);
    if (this.detajuste.idproduct == undefined) {
      this.data.notify("Elemento vacio", "Error", this.alertType.warning);
    }
    else {
      this.index++
      this.detajustes.push(this.detajuste);
      this.isadddetajuste = false
    }
  }

  async CancelarDetalle() {
    this.isadddetajuste = false
  }

  ShowNewdetajuste() {

    this.frmcomprasdetalles.articulo = null;
    this.frmcomprasdetalles.show(() => {
      this.articulo = this.frmcomprasdetalles.articulo;

      if (this.articulo != null) {
        this.detajuste.articulo = this.articulo
        this.detajuste.idproduct = this.articulo.idproduct
      }
    });
  }




  PrepararAjuste(index: number) {
    const item = this.detajustes[index];
    this.ajuste.idsucursal = this.data.getSucursalId();
    
  }

  // async GuardarAjuste() {
  //   console.log(this.detajustes);
  //   await this.data.AsyncPost(this.data.api.ajuste, this.ajuste).then(r => {
  //     if (r.idajuste != null) {
  //       console.log("cabezera guardada");

  //       console.log(r);
  //       this.detajustes.forEach(detajuste => {

  //         detajuste.idajuste = r.idajuste
  //         this.data.AsyncPost(this.data.api.detajuste, detajuste).then(d => {

  //           console.log(d);
  //           if (d.length > 0) {
  //             console.log("detalle guardado");
  //             console.log(d);
  //           }
  //         }).catch(e => console.log(e))
  //       });
  //       this.data.notify("Elemento guardado", "Exito", this.alertType.success, this.options, () => { this.close() });

  //     } else {
  //       console.log("error");
  //       console.log(r);
  //     }
  //   }).catch(() => this.data.notify("Datos vacios o invalidos", "Error", this.alertType.warning, this.options, this.ajuste.fecha = null))

  // }

  // async ActualizarAjuste(idajuste: string) {
  //   console.log(this.detajustes);
  //   console.log(this.ajuste);

  //   console.log("Enviando Ajuste", this.ajuste);
  //   await this.data.AsyncPut(this.data.api.ajuste, idajuste, this.ajuste).then(r => {
  //     if (r.message != "error") {
  //       console.log("cabezera guardada");

  //       console.log(r);
  //       this.detajustes.forEach(detajuste => {

  //         //detajuste.idajuste = r.idajuste
  //         this.data.AsyncPut(this.data.api.detajuste, detajuste.id_det, detajuste).then(d => {

  //           console.log(d);
  //           if (d.length > 0) {
  //             console.log("detalle guardado");
  //             console.log(d);
  //           }
  //         }).catch(e => console.log(e))
  //       });
  //       this.data.notify("Elemento guardado", "Exito", this.alertType.success, this.options, () => { this.close() });

  //     } else {
  //       console.log("error");
  //       console.log(r);

  //     }
  //   }).catch(() => this.data.notify("Datos vacios o invalidos", "Error", this.alertType.warning, this.options, this.ajuste.fecha = null))

  // }

  guardarAjuste() {
    this.artloading.show("Guardando")
    console.log("Guardando ajuste", this.ajuste);
    
    const ajustePayload = {...this.ajuste};
    if (!ajustePayload.idsucursal) {
      this.data.notify("Sucursal no válida", "Error", this.alertType.error);
      return 
    }
    this.data.Post(this.data.api.ajuste, ajustePayload).pipe(
      switchMap((res: any) => {
        if (!res || !res.idajuste) {
          throw new Error('No se recibió idajuste');
        }
        const idajuste = res.idajuste;
        // Preparo cada detalle para enviarlo
        const calls = this.detajustes.map(det => {
          det.idajuste = idajuste;
          return this.data.Post(this.data.api.detajuste, det);
        });
        // ForkJoin para enviar todos los detalles en paralelo
        return calls.length ? forkJoin(calls) : of([]);
      }),
      catchError(err => {
        console.error('Error al guardar ajuste:', err);
        this.data.notify(
          'Error al guardar el ajuste',
          'Error',
          this.alertType.error
        );
        // Pasar un array vacío para que el subscribe se ejecute
        return of([]);
      })
    ).subscribe({
      next: _ => {
        this.artloading.hide()
        this.data.notify(
          'Ajuste registrado con éxito',
          'Éxito',
          this.alertType.success,
          this.options,
          () => this.close()
        );
      },
      error: _ => {
        // Ya manejado en catchError, pero por si acaso
        this.artloading.hide()
      }
    });
  }

  actualizarAjuste() {
    const idajuste = this.ajuste.idajuste;
    if (!idajuste) {
      this.data.notify(
        'No se puede editar el ajuste (falta idajuste)',
        'Error',
        this.alertType.error
      );
      return;
    }

    // Mostrar loading
    this.artloading.show("Guardando");
    //  la petición de actualización de cabecera
    this.data.Put(this.data.api.ajuste, idajuste.toString(), this.ajuste).pipe(
      switchMap((res: any) => {
        if (!res || res.message === 'error') {
          throw new Error('Error en la respuesta del servidor');
        }

        // DETALLES: nuevos vs existentes vs eliminados
        const actuales = this.detajustes;
        const anteriores = this.detajustesAnteriores; // Debes mantener esta lista antes de editar

        const nuevos = actuales.filter(d => !d.id_det);
        const existentes = actuales.filter(d => d.id_det);
        const eliminados = anteriores.filter(a => !actuales.some(c => c.id_det === a.id_det));
        console.log("Datos para procesar:", { nuevos, existentes, eliminados });
        
        
        // Construyo los llamados
        const callsNew = nuevos.map(det => {
          det.idajuste = idajuste;
          return this.data.Post(this.data.api.detajuste, det);
        });
        const callsUpdate = existentes.map(det =>
          this.data.Put(this.data.api.detajuste, det.id_det, det)
        );
        const callsDelete = eliminados.map(det =>
          this.data.Delete(this.data.api.detajuste, det.id_det)
        );

        const allCalls = [...callsNew, ...callsUpdate, ...callsDelete];
        return allCalls.length ? forkJoin(allCalls) : of([]);
      }),
      catchError(err => {
        console.error('Error al actualizar ajuste:', err);
        this.data.notify(
          'Error al actualizar el ajuste',
          'Error',
          this.alertType.error
        );
        return of([]);
      })
    ).subscribe({
      next: _ => {
        this.artloading.hide();
        this.data.notify(
          'Ajuste actualizado con éxito',
          'Éxito',
          this.alertType.success,
          this.options,
          () => this.close()
        );
      },
      error: _ => {
        this.artloading.hide();
      }
    });
  }


  refresh(): Function {
    this.ajuste = new Ajuste();
    this.detajustes = [];
    return null
  }

  Guardar() {
    if (this.ajuste.referencia && this.ajuste.fecha && this.detajustes.length > 0) {
      this.guardarAjuste()
    } else {
      this.data.notify("Faltan datos", "Atencion", this.data.alertType.info)
    }
  }

  Actualizar() {
    if (this.ajuste.referencia && this.ajuste.fecha) {
      console.log("actualizando");
      
      this.actualizarAjuste()
      // if (this.ajuste.total>0) {

      // }else{
      //   this.data.notify("El total no puede ser menor o igual a 0","Atencion",this.data.alertType.info)
      // }

    } else {
      this.data.notify("Faltan datos", "Atencion", this.data.alertType.info)
    }
  }


  async DeleteDetCompra(indice: number) {
    console.log(indice);
    this.detajustes.splice(indice, 1);
  }

  close() {
    this.detajustes = [];
    this.btnclose.nativeElement.click();
    setTimeout(() => {
      this.isShow = false;
      this.isedit = true;
    }, 500);
    setTimeout(() => { if (this.funcion != null) { this.funcion(); } }, 10);
  }

}
