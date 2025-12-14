import { Nivel } from "../nivel/nivel";

export class Usuario {
    n?:string;
    id?:string;
    apodo?:string;
    nombre?:any;
    username?:string;
    password?:string;
    fechareg?:string;
    fechamod?:string;
    activo?:number;
    perfil?:Nivel;
    usuario_id?:string;
    personal_id?:string;
    sucursal_id?:string;
    is_staff: boolean;
    aprobador: any;
    nivel_usuario: any;
    constructor(){
        this.perfil = new Nivel();
    }
}