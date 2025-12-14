import { Entidad } from '../entidad/entidad';

export class Anexo {
    n?:string;
    id?:string;
    nombre?:string;
    descripcion?:string;
    sigla?:string;
    codigo?:string;
    fechareg?:string;
    fechamod?:string;
    activo?:number;
    current_user?:string;
    entidad?:Entidad;
    constructor(){ this.entidad = new Entidad();}
}
