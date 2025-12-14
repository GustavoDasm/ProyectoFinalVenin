import { TipoVehiculo } from '../tipovehiculo/tipo-vehiculo';
export class Modelo {
    n?:string;
    id?:string;
    nombre?:string;
    descripcion?:string;
    fechareg?:string;
    fechamod?:string;
    activo?:number;
    current_user?:string;
    tipovehiculo?:TipoVehiculo;
    constructor(){
        this.tipovehiculo = new TipoVehiculo();
    }
}
