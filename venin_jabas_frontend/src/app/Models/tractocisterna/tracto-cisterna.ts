import { Vehiculo } from '../vehiculo/vehiculo';
export class TractoCisterna {
    n?:string;
    id?:string;
    descripcion?:string;
    activo?:string;
    usuario_id?:string;
    fechareg?:string;
    fechamod?:string;
    tracto?:Vehiculo;
    semiremolque?:Vehiculo;
    constructor(){
        this.tracto = new Vehiculo();
        this.semiremolque = new Vehiculo();
    }
}
