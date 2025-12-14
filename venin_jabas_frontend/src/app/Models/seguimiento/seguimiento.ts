import { Lugar } from '../lugar/lugar';
import { ProgramacionDetalle } from '../programaciondetalle/programacion-detalle';
import { Programacion } from '../programacion/programacion';

export class Seguimiento {
    n?:string;
    id?:string;
    fechapartida?:string;
    fechallegada?:string;
    horapartida?:string;
    horallegada?:string;
    fechareg?:string;
    fechamod?:string;
    activo?:boolean;
    tramo?:number=0;
    usuario_id?:string;
    puntopartida?:Lugar;
    puntollegada?:Lugar;
    programaciondetalle?:ProgramacionDetalle;
    programacion?:Programacion;

    constructor(){
        this.puntollegada = new Lugar();
        this.puntopartida = new Lugar();
        this.programaciondetalle = new ProgramacionDetalle();
        this.programacion = new Programacion();
    }
}