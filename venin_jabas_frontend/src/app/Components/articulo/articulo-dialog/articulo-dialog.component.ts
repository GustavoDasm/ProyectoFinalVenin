
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Articulo } from 'src/app/Models/articulo/articulo';
import { Clase } from 'src/app/Models/clase/clase';
import { DetalleFactura } from 'src/app/Models/factura/detallefactura/detalle-factura';
import { Precio } from 'src/app/Models/precio/precio';
import { DataService } from 'src/app/Service/data.service';
import { AlertComponent } from '../../objects/alert/alert/alert.component';
import { InfoComponent } from '../../objects/info/info/info.component';
import { LoadingComponent } from '../../objects/loading/loading.component';

@Component({
    selector: 'app-articulo-dialog',
    templateUrl: './articulo-dialog.component.html',
    styleUrls: ['./articulo-dialog.component.css']
})
export class ArticuloDialogComponent implements OnInit {
    @ViewChild('btnshow', null) btnshow: ElementRef;
    @ViewChild('btnclose', null) btnclose: ElementRef;
    @ViewChild('txtdocumento', null) txtfirt: ElementRef;
    @ViewChild(AlertComponent, null) alert: AlertComponent;
    @ViewChild(LoadingComponent, null) loading: LoadingComponent;
    @ViewChild(InfoComponent, { static: true }) info: InfoComponent;
    public isShow: boolean = false;
    public pagina: number = 0;
    public articulos: any[] = [];
    public articulo: Articulo = new Articulo();
    public isEdit: boolean = false;
    public funcion: Function = null;
    public onArticuloSeleccionado: Function;
    public pagart: any;
    public pagprecio: any;
    public total: number = 0;
    public search = {
        top: 100, clase: undefined, subclase: undefined, subgrupo: undefined, text: '', scale: 'DESC', marca: '', opcion: 'idprecio', codigo: '', nombre: '',
        idsucursal: this.data.getSucursalId()
    };
    public modal = "modal-lg";
    public showdelete: boolean = false;
    public zindex: number = 999;
    public usuario = null;
    public precio: Precio = new Precio();
    public precios: Precio[] = [];
    public cantidad: number = 0;
    public clases: Clase[] = [];
    public zonas: any[] = [];
    public detfactus: DetalleFactura[] = []; /* detalle de factura temporal */
    debounceTimer: any;
    public idsucursal: number = 1;
    origin: string = ''
    constructor(private data: DataService) { }

    ngOnInit() {
    }
    public show(affterfunction: Function = null) {
        this.funcion = affterfunction;
        this.isShow = true;
        this.showTab(1);
        this.showdelete = false;
        console.log(parseInt(this.data.getSucursalId()));
        setTimeout(() => {
            this.btnshow.nativeElement.click();
            this.usuario = this.data.getCurrentUser();
            this.idsucursal = parseInt(this.data.getSucursalId())
            this.articulos = [];
            this.GetClase();
            this.GetData();
            this.GetZonas()
        }, 10);
    }

    GetZonas() {
        this.data.GetSimple(this.data.api.zona).subscribe(r => {
            this.zonas = r;
        }, e => { console.log(e.error); }, () => { });
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
        this.data.searchPrecios(this.search).subscribe(r => {

            if (r.message != "success") {
                console.log(r);
                this.articulos = [];
                this.loading.hide();
            } else {
                let items = r.data.map(item => ({
                    ...item,
                    cantidad: 1,
                    isSelected: false
                }));
                console.log("precios alterados", items);
                this.articulos = items;
                console.log("Lista articulos", this.articulos);
                this.total = this.articulos.length;
                this.loading.hide();
            }

        }, e => { this.loading.hide(); })
    }

    searchData() {
        clearTimeout(this.debounceTimer); // Resetea cualquier timer previo

        this.debounceTimer = setTimeout(() => {
            this.loading.show("cargando..");

            if (this.search.nombre.length < 2) {
                this.loading.hide();
                this.articulos = [];
                return;
            }

            this.data.searchPrecios(this.search).subscribe(r => {
                this.loading.hide();
                if (r.message != "success") {
                    console.log(r);
                    this.articulos = [];
                } else {
                    let items = r.data.map(item => ({
                        ...item,
                        cantidad: 1,
                        isSelected: false
                    }));
                    console.log("precios alterados", items);
                    this.articulos = items;
                    console.log("Lista articulos", this.articulos);
                    this.total = this.articulos.length;
                }
            }, e => {
                this.loading.hide();
                this.articulos = [];
            })
        }, 330);



    }
    // GetArticulo() {
    //     this.loading.show('cargando datos');
    //     this.articulos = [];
    //     console.log(this.search);

    //     this.data.searchArticulos(this.search).subscribe(r => {
    //         this.loading.hide();
    //         if (r.message != "success") {
    //             console.log(r);
    //             this.articulos = [];
    //         } else {
    //             this.articulos = r.data;
    //             console.log("Lista articulos", this.articulos);


    //             this.total = this.articulos.length;
    //         }
    //     }, e => {
    //         this.loading.hide();
    //         console.log(e)
    //     });
    // }
    showTab(i) {

        this.pagina = i;
        if (this.pagina == 1) { this.modal = 'modal-lg'; }
        else { this.modal = ''; }
    }
    preventDecimal(event: KeyboardEvent) {
        if (event.key === '.' || event.key === ',' || event.key === '-') {
            event.preventDefault();
        }
    }
    close() {
        this.btnclose.nativeElement.click(); // si usas un botón oculto para cerrar
        this.isShow = false;
    }
    SelectItem(i) {
        // this.articulo = i as Articulo;
        // this.showTab(2);
        // this.data.GetFromValue(this.data.api.precio, 'idproduct', this.articulo.idproduct).subscribe((r) => {
        //     this.precios = r;
        //     console.log(this.precios);


        //     if (this.precios.length > 0) {
        //         this.cantidad = 1;
        //     }
        // });

        console.log("Item seleccionado", i);
        this.precio = i as Precio;
        //this.precio.idproduct = i.idproduct.idproduct;
        console.log("Articulo seleccionado", i.idproduct as Articulo);
        this.articulo = i.idproduct as Articulo;
        console.log("Cantidad seleccionada", i.cantidad);
        this.cantidad = i.cantidad;
        this.btnclose.nativeElement.click();


    }

    seleccionarArticulo(i) {
        i.isSelected = true
        let articulo: Articulo = i.idproduct as Articulo;
        let precio: Precio = i as Precio
        console.log("Precio seleccionado: ", precio);
        if (this.origin === 'ventas') {
            if (!this.IsStock(precio) && articulo.tipo != 'SER') {
                i.isSelected = false;
                this.data.notify("Stock de producto agotado para la unidad seleccionada.", "Stock Agotado", 0);
                return
            }
        }

        if (this.onArticuloSeleccionado) {
            this.onArticuloSeleccionado({ articulo, precio });
        }
    }

    getNombreZona(idzona:any){
        const res = this.zonas.find(zona => zona.idzona = idzona)
        if (!res) {
            return '--'
        }
        return res.descripcion
    }

    CalculaStock(precio: Precio): number {
        let b = this.detfactus.find(b => b.precio.idproduct.idproduct = precio.idproduct.idproduct);
        let a = 0;
        //let saldo = (precio.idproduct.atributo == '1' ? precio.idproduct.saldo00002 : precio.idproduct.saldo00001);

        const idsucursal: number = parseInt(this.data.getSucursalId())
        let saldo: any;
        
        switch (idsucursal) {
            case 1:
                saldo = precio.idproduct.saldo00001;
                break;
            case 2:
                saldo = precio.idproduct.saldo00002;
                break;
            case 3:
                saldo = precio.idproduct.saldo00003;
                break;
            case 4:
                saldo = precio.idproduct.saldo00004;
                break;
            case 5:
                saldo = precio.idproduct.saldo00005;
                break;
            case 6:
                saldo = precio.idproduct.saldo00006;
                break;
            case 7:
                saldo = precio.idproduct.saldo00007;
                break;
            default:
                // Manejar el caso en el que idsucursal no sea válido
                saldo = '0';
                console.warn(`Sucursal con id ${idsucursal} no válida`);
                break;
        }

        if (b == undefined) {
            a = ((parseFloat(saldo) * parseFloat(precio.idproduct.unidad.equivale)) / parseFloat(precio.unidad.equivale)) - parseFloat(this.cantidad + "");
        } else {
            a = ((parseFloat(saldo) * parseFloat(precio.idproduct.unidad.equivale)) / parseFloat(precio.unidad.equivale)) - (parseFloat(this.cantidad + "") + parseFloat(b.cantidad));
        }
        console.log("Calculos: ", [a, b]);

        return a;
    }

    IsStock(_precio: Precio): boolean {
        let stock = this.CalculaStock(_precio);
        let res = true
        console.log("Sock calculado: ", stock);

        if (stock <= 0) {
            res = false;
        }
        return res

        // if ((stock) >= 0) {
        //     if (parseFloat(stock + "") >= (parseFloat(stock + "") / parseFloat(_precio.unidad.equivale))) {
        //         return true;
        //     } else { return false; }
        // } else { return false }
    }
    IsExists(_precio: Precio): boolean {
        let b = this.detfactus.find(b => b.precio.idprecio == _precio.idprecio);
        return (b == undefined ? false : true);
    }

    //old
    // SelectItemPrecio(i){
    //     if(this.IsStock(i as Precio)){
    //         if(!this.IsExists(i as Precio)){
    //             this.precio = i as Precio;
    //             this.btnclose.nativeElement.click();
    //         } else {
    //             this.data.notify("El precio con la unidad : [" + i.unidad.unidad +"], ya está agregada a la lista de compras. ","Precio ya existe",0);
    //         } 
    //     } else {
    //         this.data.notify("Stock de producto agotado para la unidad seleccionada. ","Stock Agotado",0);
    //     }
    // }

    //new
    SelectItemPrecio(i) {
        if (!this.IsExists(i as Precio)) {
            this.precio = i as Precio;
            this.btnclose.nativeElement.click();
        } else {
            this.data.notify("El precio con la unidad : [" + i.unidad.unidad + "], ya está agregada a la lista de compras. ", "Precio ya existe", 0);
        }
    }

    restaStock(item: any): void {
        const cantidad = Number(item.cantidad) || 0;
        const stock = Number(item.idproduct.saldo00001) || 0;
        item.idproduct.saldo00001 = stock - cantidad;
        item.stockInvalido = cantidad > stock;
    }
}
