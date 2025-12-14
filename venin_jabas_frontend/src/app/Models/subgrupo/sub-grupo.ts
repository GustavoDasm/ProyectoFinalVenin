import { SubClase } from '../subclase/sub-clase';

export class SubGrupo {
    n?:string;
    idgrupo?:string;
    nombre?:string;
    inventario?:string;
    usuario_id?:string;
    idclase?:SubClase;
    constructor(){this.idclase= new SubClase();}
    getData(){
        var data = {
            idgrupo:this.idgrupo,
            nombre:this.nombre,
            inventario:this.inventario,
            idclase:this.idclase.idsubcla
        }
        return data;
    }
}