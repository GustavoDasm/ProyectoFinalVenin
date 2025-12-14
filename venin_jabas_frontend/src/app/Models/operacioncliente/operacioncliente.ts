import { Cliente } from "../cliente/cliente";
import { Operacion } from "../operacion/operacion";
import { Terminal } from "../terminal/terminal";

export class OperacionCliente {
    n?:string;
    id?:string;
    nombre?:string;
    fechareg?:string;
    fechamod?:string;
    activo?:number;
    current_user?:string;
    cliente?:Cliente;
    operacion?:Operacion;
    terminal?:Terminal;
    constructor(){
        this.cliente = new Cliente();
        this.operacion = new Operacion();
        this.terminal = new Terminal();
    }
}