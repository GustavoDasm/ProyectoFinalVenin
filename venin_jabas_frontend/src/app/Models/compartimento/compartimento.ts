import { TipoVehiculo } from '../tipovehiculo/tipo-vehiculo';
import { Vehiculo } from '../vehiculo/vehiculo';
import { UnidadMedida } from '../unidadmedida/unidad-medida';
import { TipoProducto } from '../tipoproducto/tipo-producto';

export class Compartimento {
    n?:string;
    id?:string;
    cantidad?:number;
    activo?:boolean;
    fechareg?:string;
    fechamod?:string;
    current_user?:string;
    tipoproducto?:TipoProducto;
    vehiculo?:Vehiculo;
    unidadmedida?:UnidadMedida;
    descripcion?:string;
    constructor(){
        this.tipoproducto = new TipoProducto();
        this.vehiculo = new Vehiculo();
        this.unidadmedida = new  UnidadMedida();
    }
}

