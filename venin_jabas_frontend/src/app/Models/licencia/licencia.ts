import { ClaseLicencia } from './clase/claselicencia';
import { CategoriaLicencia } from './categoria/categorialicencia';
import { Personal } from '../personal/personal';
import { Options } from '../default/option/option';
import { Anexo } from '../anexo/anexo';
import { Requerimiento } from '../requerimiento/requerimiento';


export class Licencia {
    n?:string;
    id?:string;
    fechaexp?:string;
    fechaven?:string;
    url?:string;
    isfile?:boolean;
    isselect?:boolean;
    estado?:string;
    codigo?:string;
    sigla?:string;
    fechareg?:string;
    fechamod?:string;
    activo?:number;
    ext?:string;
    urlbase?:string;
    current_user?:string;
    clase?:ClaseLicencia;
    categoria?:CategoriaLicencia;
    personal?:Personal;
    requerimiento?:Requerimiento;
    option?:Options;
    constructor(){
        this.clase= new ClaseLicencia();
        this.categoria = new CategoriaLicencia();
        this.personal = new Personal();
        this.requerimiento = new Requerimiento();
        this.option = new Options();
    }
}