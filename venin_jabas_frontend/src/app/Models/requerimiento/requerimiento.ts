import { Anexo } from '../anexo/anexo';
import { Cargo } from '../cargo/cargo';
import { Licencia } from '../licencia/licencia';
import { Entidad } from '../entidad/entidad';
import { TipoVehiculo } from '../tipovehiculo/tipo-vehiculo';

export class Requerimiento {
    n?:string;
    id?:string;
    codigo?:string;
    vinculo?:string;
    cargo?:Cargo;
    anexo?:Anexo;
    fechareg?:string;
    fechamod?:string;
    activo?:number;
    current_user?:string;
    entidad?:Entidad;
    tipovehiculo?:TipoVehiculo;

    documento?:string;
    estado?:string;
    estadodes?:string;
    class?:string;
    btntext?:string;
    btnclass?:string;
    constructor(){
        this.cargo = new Cargo();
        this.anexo = new Anexo();
        this.entidad = new Entidad();
        this.tipovehiculo = new TipoVehiculo();
    }
}

