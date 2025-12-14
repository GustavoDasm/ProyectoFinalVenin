import { Vehiculo } from '../vehiculo/vehiculo';

export class Soat {
    id?:string;
    fechaexp?:string;
    fechaven?:string;
    url?:string;
    isselect?:boolean;
    isfile?:boolean;
    ext?:string;
    activo?:string;
    codigo?:string;
    fechareg?:string;
    fechamod?:string;
    vehiculo?:Vehiculo;
    usuario_id?:string;
    temp_placa?:string;
    constructor(){this.vehiculo = new Vehiculo();}
}
