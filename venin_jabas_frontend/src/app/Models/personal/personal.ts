import { Cargo } from "../cargo/cargo";
import { Pension } from "../pension/pension";
import { Empresa } from "../empresa/empresa";
import { OperacionCliente } from "../operacioncliente/operacioncliente";
import { Options} from '../default/option/option';
import { Sexo } from '../sexo/sexo';
import { Nacionalidad } from '../nacionalidad/nacionalidad';
import { EstadoCivil } from '../estadocivil/estadocivil';
export class Personal {
    n?:string;
    idpersonal?:number;
    tipodocumento?:string;
    documento?:string;
    nombre?:string;
    sueldo?:number=0;
    celular?:string;
    direccion?:string;
    correo?:string;
    fecha_ingreso?:string;
    estado?:string;
    fechareg?:string;
    fechamod?:string;
    activo?:string;
    current_user?:string;
    cargo?:string;
    empresa?:string;
    sexo?:string;
    nacionalidad?:string;
    estadocivil?:string;
    option?:string;
    operacioncliente?:string;
    idusuario?:number;
    idsucursal?:number;
    constructor(){
    }
}
