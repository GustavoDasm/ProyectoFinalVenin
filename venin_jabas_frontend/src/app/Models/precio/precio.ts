import { Zona } from '../zona/zona';
import { UnidadMedida } from '../unidadmedida/unidad-medida';
import { Moneda } from '../moneda/moneda';
import { Articulo } from '../articulo/articulo';


export class Precio {
    n?:string;
    idprecio?:string;
    moneda?:Moneda;
    valvta?:string;
    igv?:string;
    impuesto?:string;
    preventa?:string;
    utilidad?:string;
    codbar?:string;
    precios?:number;
    usuario_id?:string;
    idzona?:string;
    zona?:Zona;
    preciomin: string;
    unidad?:UnidadMedida;
    idproduct?:Articulo;

    constructor(){
        this.moneda = new Moneda();
        this.unidad = new UnidadMedida();
        this.zona = new Zona();
        this.idproduct = new Articulo();
    }

    GetData(){
        let data = {
            idprecio:this.idprecio,
            idzona:this.idzona,
            moneda:this.moneda.idmoneda,
            valvta:this.valvta,
            igv:this.igv,
            impuesto:this.impuesto,
            preventa:this.preventa,
            utilidad:this.utilidad,
            codbar:this.codbar,
            precios:this.precios,
            usuario_id:this.usuario_id,
            zona:this.zona,
            unidad:this.unidad.idunidad,
            idproduct:this.idproduct.idproduct
        }
        return data;
    }
}