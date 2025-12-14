import { ClaseLicencia } from '../clase/claselicencia';

export class CategoriaLicencia {
    n?:string;
    id?:string;
    nombre?:string;
    fechareg?:string;
    fechamod?:string;
    activo?:number;
    clase?:ClaseLicencia;
    current_user?:string;
    constructor(){
        this.clase = new ClaseLicencia();
    }
}
