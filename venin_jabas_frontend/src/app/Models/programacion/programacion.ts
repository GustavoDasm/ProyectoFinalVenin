import { Cliente } from "../cliente/cliente";
import { OperacionCliente } from "../operacioncliente/operacioncliente";
import { Options} from '../default/option/option';
export class Programacion {
    n?:string;
    id?:string;
    codigo?:string;
    cantidad?:number=0;
    estado?:string;
    fechaprog?:string;
    fechacier?:string;
    fechareg?:string;
    fechamod?:string;
    activo?:string;
    isescolta?:string;
    cantidadescolta?:number=0;
    usuario_id?:string;
    estado_id?:string;
    cliente?:Cliente;
    operacioncliente?:OperacionCliente;
    option:Options;
    constructor(){
        this.cliente = new Cliente();
        this.operacioncliente = new OperacionCliente();
        this.option = new Options();
    }
}
