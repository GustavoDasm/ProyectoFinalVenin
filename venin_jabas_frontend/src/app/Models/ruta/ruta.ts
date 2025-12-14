import { TipoRuta } from '../tiporuta/tipo-ruta';

export class Ruta {
    n?:string;
    id?:string;
    descripcion?:string;
    puntopartida?:string;
    puntosalida?:string;
    fechareg?:string;
    fechamod?:string;
    activo?:number;
    current_user?:string;
    tiporuta:TipoRuta;
    constructor(){
        this.tiporuta = new TipoRuta();
    }
}
