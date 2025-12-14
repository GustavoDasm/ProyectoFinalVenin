import { Articulos } from '../../articulos/articulos';
import { Precio } from '../../precio/precio';
import { Factura } from '../factura';

export class DetalleFactura {
    n?:number;
    id?:string;
    item?:string;
    idproduct?:string;
    cantidad?:any;
    valorunit?:string;
    descuento?:string;
    igv?:string;
    descrip?:string;
    impneto?:string;
    cmoneda?:string;
    preuni?:string;
    unidad?:string;
    unico?:string;
    idfactura?:string;
    id_det?:string;
    totdscto?:string;
    igvi?:string;
    afectoigv?:string;
    montoisc?:string;
    valgratui?:string;
    impnetoct?:string;
    preunict?:string;
    dcto_valor?:string;
    iddet?: string;
    idprecio?:string;
    factura?:Factura;
    articulo?:Articulos;
    precio?:Precio;
    impto_cbp?:string;
    icbp?:number;
    anticipo?:boolean;
    anticipo_serie?:string;
    anticipo_numero?:string;
    idunidad?:any;
    preciomin?: any;
    esCantidadInvalida?:boolean;
    constructor(){
        this.factura = new Factura();
        this.articulo = new Articulos();
        this.precio = new Precio();
    }
}
