import { TractoCisterna } from '../tractocisterna/tracto-cisterna';
import { Personal } from '../personal/personal';
import { Programacion } from '../programacion/programacion';
import { Terminal } from '../terminal/terminal';
import { Vehiculo } from '../vehiculo/vehiculo';
export class ProgramacionDetalle {
    n?:string;
    id?:string;
   
    recorrido?:string;
    fechareg?:string;
    fechamod?:string;
    fechacarg?:string;
    activo?:string;
    estado?:string;
    isescolta?:boolean;
    usuario_id?:string;

    serie_guiar?:string;
    serie_guiat?:string;
    numero_guiar?:string;
    numero_guiat?:string;

    tractocisterna:TractoCisterna;
    conductor?:Personal;
    programacion?:Programacion;
    terminal?:Terminal;
    escolta?:Vehiculo;
    constructor(){
        this.tractocisterna = new TractoCisterna();
        this.conductor = new Personal();
        this.programacion = new Programacion();
        this.terminal= new Terminal();
        this.escolta = new Vehiculo();
    }
}
