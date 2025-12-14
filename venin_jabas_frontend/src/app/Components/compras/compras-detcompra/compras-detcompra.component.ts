import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { InfoComponent } from '../../objects/info/info/info.component';
import { LoadingComponent } from '../../objects/loading/loading.component';
import { AuthService } from 'src/app/Service/auth.service';
import { DataService } from 'src/app/Service/data.service';
import { AlertComponent } from '../../objects/alert/alert/alert.component';
import { Articulo } from 'src/app/Models/articulo/articulo';
import { Clase } from 'src/app/Models/clase/clase';
import { DetalleFactura } from 'src/app/Models/factura/detallefactura/detalle-factura';
import { Precio } from 'src/app/Models/precio/precio';
import { Subscription } from 'rxjs/internal/Subscription';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
    selector: 'app-compras-detcompra',
    templateUrl: './compras-detcompra.component.html',
    styleUrls: ['./compras-detcompra.component.css']
})
export class ComprasArticuloComponent implements OnInit {
    @ViewChild('btnshow', null) btnshow: ElementRef;
    @ViewChild('btnclose', null) btnclose: ElementRef;
    @ViewChild('txtdocumento', null) txtfirt: ElementRef;
    @ViewChild(AlertComponent, null) alert: AlertComponent;
    @ViewChild(LoadingComponent, null) loading: LoadingComponent;
    @ViewChild(InfoComponent, null) info: InfoComponent;
    public isShow: boolean = false;
    public pagina: number = 0;
    public articulos: Articulo[] = [];
    public articulo: Articulo = new Articulo();
    public isEdit: boolean = false;
    public funcion: Function = null;
    public pagart: any;
    public pagprecio: any;
    public total: number = 0;
    public search = { top: 100, clase: undefined, subclase: undefined, subgrupo: undefined, text: '', scale: 'DESC', opcion: 'nombre', marca: '', codigo: '', nombre: '', idsucursal: this.data.getSucursalId() };
    public modal = "modal-lg";
    public showdelete: boolean = false;
    public zindex: number = 10000;
    public usuario = null;
    public precio: Precio = new Precio();
    public precios: Precio[] = [];
    public cantidad: number = 0;
    public clases: Clase[] = [];
    public detfactus: DetalleFactura[] = []; /* detalle de factura temporal */
    private searchSubject = new Subject<string>();
    private searchSub: Subscription;
    constructor(private data: DataService) {
        this.searchSub = this.searchSubject.pipe(
            debounceTime(350)   // <-- ajusta a 250 o 300 ms según prefieras
        ).subscribe(term => {
            this.search.nombre = term;
            this.GetData();     // llamamos exactamente a tu método sin modificar
        });
    }

    ngOnInit() {
    }
    public show(affterfunction: Function = null) {
        this.funcion = affterfunction;
        this.isShow = true;
        this.showTab(1);
        this.showdelete = false;
        setTimeout(() => {
            this.btnshow.nativeElement.click();
            this.info.hide();
            this.usuario = this.data.getCurrentUser();
            console.log(this.search.idsucursal);


            this.GetClase();
            if (this.search.text != '') {
                this.GetData();
            }
        }, 10);
    }

    GetClase() {
        this.data.GetSimple(this.data.api.clase).subscribe(r => {
            this.clases = r;
        }, e => { console.log(e.error.text); }, () => { });
    }
    changeClase() {
        if (this.search.marca != '0') {
            this.GetData();
        }
    }
    GetData() {
        this.articulos = [];
        this.loading.show("cargando..");
        this.data.searchArticulos(this.search).subscribe(r => {
            console.log(r.data);

            this.loading.hide();
            if (r.data) {
                this.articulos = r.data; this.total = this.articulos.length;
            }
        }, e => { this.loading.hide(); })
    }
    showTab(i) {

        this.pagina = i;
        if (this.pagina == 1) { this.modal = 'modal-lg'; }
        else { this.modal = ''; }
    }
    search_keypress(e) {

    }
    onSearchInput(value: string) {
    this.searchSubject.next(value);
  }

  ngOnDestroy() {
    if (this.searchSub) this.searchSub.unsubscribe();
  }
    close() {
        this.btnclose.nativeElement.click();
        setTimeout(() => { this.isShow = false; }, 1000);
        setTimeout(() => { if (this.funcion != null) { this.funcion(); } }, 10);
    }
    SelectItem(i) {
        this.articulo = i as Articulo;
        this.btnclose.nativeElement.click();
    }

    CalculaStock(precio: Precio): number {
        let b = this.detfactus.find(b => b.precio.idproduct.idproduct = precio.idproduct.idproduct);
        let a = 0;
        let saldo = (precio.idproduct.atributo == '1' ? precio.idproduct.saldo00002 : precio.idproduct.saldo00001);

        if (b == undefined) {
            a = ((parseFloat(saldo) * parseFloat(precio.idproduct.unidad.equivale)) / parseFloat(precio.unidad.equivale)) - parseFloat(this.cantidad + "");
        } else {
            a = ((parseFloat(saldo) * parseFloat(precio.idproduct.unidad.equivale)) / parseFloat(precio.unidad.equivale)) - (parseFloat(this.cantidad + "") + parseFloat(b.cantidad));
        }
        return a;
    }

    IsStock(_precio: Precio): boolean {
        let stock = this.CalculaStock(_precio);
        if ((stock) >= 0) {
            if (parseFloat(stock + "") >= (parseFloat(stock + "") / parseFloat(_precio.unidad.equivale))) {
                return true;
            } else { return false; }
        } else { return false; }
    }
    IsExists(_precio: Precio): boolean {
        let b = this.detfactus.find(b => b.precio.idprecio == _precio.idprecio);
        return (b == undefined ? false : true);
    }
    SelectItemPrecio(i) {
        if (this.IsStock(i as Precio)) {
            if (!this.IsExists(i as Precio)) {
                this.precio = i as Precio;
                this.btnclose.nativeElement.click();
            } else {
                this.data.notify("El precio con la unidad : [" + i.unidad.unidad + "], ya está agregada a la lista de compras. ", "Precio ya existe", 0);
            }
        } else {
            this.data.notify("Stock de producto agotado para la unidad seleccionada. ", "Stock Agotado", 0);
        }
    }
}
