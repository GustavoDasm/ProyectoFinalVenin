import { SafeUrl } from "@angular/platform-browser";

export class Empresa {
    n?:string;
    id?:string;
    nombre?:string;
    razonsocial?: string;
    logo: File | string | SafeUrl |null ;
    logo2?: File | string | null;
    logo3?: File | string | null;
    ruc?: string;
    nombrecomercial?:string;
    banco?: string;
    cuenta?: string;
    cci?: string;
    refran?: string;
    email?: string;
    telefono?:string;
    fax?:string;
    codigofis?:string;
    codigoubigeo?:string;
    dtr_bconac?:string;
    constructor(){}

}
