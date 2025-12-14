import { Clase } from '../clase/clase';

export class SubClase {
    n?:string;
    idsubcla?:string;
    nombre?:string;
    inventario?:string;
    usuario_id?:string;
    idclase?:Clase;

    constructor(){this.idclase= new Clase();
    
    }

    getData(){
        var data = {
            idsubcla:this.idsubcla,
            nombre:this.nombre,
            inventario:this.inventario,
            idclase:this.idclase.idclase
        }
        return data;
    }
}