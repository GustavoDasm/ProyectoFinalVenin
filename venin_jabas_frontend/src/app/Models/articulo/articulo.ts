import { SubGrupo } from '../subgrupo/sub-grupo';
import { SubClase } from '../subclase/sub-clase';
import { Clase } from '../clase/clase';
import { UnidadMedida } from '../unidadmedida/unidad-medida';
import { CatalogoProducto } from '../catalogoproducto/catalogo-producto';
import { AfectoIgv } from '../afectoigv/afecto-igv';

export class Articulo {
    n?:string;
    idproduct?:string;
    codigo?:string;
    nombre?:string;
    modelo?:string;
    marca?:string;
    idprovee?:string;
    codpro?:string;
    pais?:string;
    stockmini?:string;
    stockmax?:string;
    valvta?:string;
    moneda?:string;
    tipo?:string;
    moncosto?:string;
    igv?:string;
    costopro?:number;
    ultcosto?:number;
    utilipor?:number;
    tcambio?:number;
    personalc_id?:string;
    personalm_id?:string;
    igvt?:string;
    total?:string;
    pesouni?:string;
    color?:string;
    flete?:string;
    stockmin?:string;
    otrocosto?:string;
    tipo_exis?:string;
    otros?:string;
    saldo00001?:string;
    saldo00002?:string;
    saldo00003?:string;
    saldo00004?:string;
    saldo00005?:string;
    saldo00006?:string;
    saldo00007?:string;
    dtmodificacion?:string;
    codsunat?:string;
    atributo: string;
    s_image: string;
    n_image: string;
    afectoigv?:string;
    codigo_fe?:string;
    impto_cbp?:string;
    idclase?:Clase;
    idsubcla?:SubClase;
    clase3?:SubGrupo;
    unidad?:UnidadMedida;
    data:any;
    constructor(){
        //this.afectoigv = new AfectoIgv();
        this.idclase = new Clase();
        this.idsubcla = new SubClase();
        this.clase3 = new SubGrupo();
        this.unidad = new UnidadMedida();
        this.data = this.GetData();
    }

    
    /**
     * GetData
     */
    

    public GetData(){
        let data = {
            idproduct:this.idproduct,
            codigo:this.codigo,
            nombre:this.nombre,
            modelo:this.modelo,
            marca:this.marca,
            idprovee:this.idprovee,
            codpro:this.codpro,
            pais:this.pais,
            stockmini:this.stockmini,
            stockmax:this.stockmax,
            valvta:this.valvta,
            moneda:this.moneda,
            tipo:this.tipo,
            moncosto:this.moncosto,
            igv:this.igv,
            costopro:this.costopro,
            ultcosto:this.ultcosto,
            utilipor:this.utilipor,
            tcambio:this.tcambio,
            personalc_id:this.personalc_id,
            personalm_id:this.personalm_id,
            igvt:this.igvt,
            total:this.total,
            pesouni:this.pesouni,
            color:this.color,
            flete:this.flete,
            stockmin:this.stockmin,
            otrocosto:this.otrocosto,
            tipo_exis:this.tipo_exis,
            otros:this.otros,
            saldo00001:this.saldo00001,
            saldo00002:this.saldo00002,
            dtmodificacion:this.dtmodificacion,
            codsunat:this.codsunat,
            atributo: this.atributo,
            s_image: this.s_image,
            n_image: this.n_image,
            afectoigv:this.afectoigv,
            codigo_fe:this.codigo_fe,
            impto_cbp:this.impto_cbp,
            idclase:this.idclase.idclase,
            idsubcla:this.idsubcla.idsubcla,
            clase3:this.clase3.idgrupo,
            unidad:this.unidad.idunidad
        };
        return data;
    }

    public async AGetData(){
        let data = {
            idproduct:this.idproduct,
            codigo:this.codigo,
            nombre:this.nombre,
            modelo:this.modelo,
            marca:this.marca,
            idprovee:this.idprovee,
            codpro:this.codpro,
            pais:this.pais,
            stockmini:this.stockmini,
            stockmax:this.stockmax,
            valvta:this.valvta,
            moneda:this.moneda,
            tipo:this.tipo,
            moncosto:this.moncosto,
            igv:this.igv,
            costopro:this.costopro,
            ultcosto:this.ultcosto,
            utilipor:this.utilipor,
            tcambio:this.tcambio,
            personalc_id:this.personalc_id,
            personalm_id:this.personalm_id,
            igvt:this.igvt,
            total:this.total,
            pesouni:this.pesouni,
            color:this.color,
            flete:this.flete,
            stockmin:this.stockmin,
            otrocosto:this.otrocosto,
            tipo_exis:this.tipo_exis,
            otros:this.otros,
            saldo00001:this.saldo00001,
            saldo00002:this.saldo00002,
            dtmodificacion:this.dtmodificacion,
            codsunat:this.codsunat,
            atributo: this.atributo,
            s_image: this.s_image,
            n_image: this.n_image,
            afectoigv:this.afectoigv,
            codigo_fe:this.codigo_fe,
            impto_cbp:this.impto_cbp,
            idclase:this.idclase.idclase,
            idsubcla:this.idsubcla.idsubcla,
            clase3:this.clase3.idgrupo,
            unidad:this.unidad.idunidad
        };
        return data;
    }
}
