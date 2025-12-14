export class ALertOption {
    showCancelButton:boolean;
    confirmButtonText:string;
    cancelButtonText:string;
    showCloseButton:boolean;
    constructor(showCancelButton:boolean=false,showCloseButton:boolean=true,confirmButtonText:string='Aceptar',cancelButtonText:string='Cerrar'){
        this.showCancelButton = showCancelButton;
        this.confirmButtonText = confirmButtonText;
        this.cancelButtonText = cancelButtonText;
        this.showCloseButton = showCloseButton;
    }
}
