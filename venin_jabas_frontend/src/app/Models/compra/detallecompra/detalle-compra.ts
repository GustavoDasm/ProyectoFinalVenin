import { Articulos } from "../../articulos/articulos";
import { Compra } from "../compra/compra";

export class DetalleCompra {
    n?:number;
    idproduct?:any;
    precio?:number;
    cantidad?:number;
    dcto1?:number;
    dcto2?:number;
    neto?:number;
    igv?:number=18;
    subtotal1?:number;
    subtotal2?:number;
    atendida?:number;
    desped?:number;
    flete?:number;
    otros?:number;
    precioreal?:number;
    canti_oc?:number;
    saldo_oc?:number;
    item?:number;
    igv_unit?:number;
    afectoigv?:number;
    serieoc?:string;
    numerooc?:string;
    idorden?:string;
    texto?:string;
    preciobrut?:number;
    idcompra?:any;
    id_det?:string;
    flet_subt?:number;
    fl_sub_uni?:number;
    notacredito?:number;
    personalc_id?:string;
    personalm_id?:string;
    dtmodificacion?:string;
    articulo?:Articulos;
    compra?:Compra;

    constructor(){
        this.articulo=new Articulos();
        this.compra=new Compra();
    }
}
