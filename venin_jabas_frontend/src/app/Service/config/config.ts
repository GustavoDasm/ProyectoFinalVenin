import { HttpHeaders } from '@angular/common/http';

/**
 * Configuration service class for managing API endpoints and HTTP headers.
 *
 * @remarks
 * This class centralizes all API endpoint paths and base URLs used throughout the application.
 * It also provides a utility method for generating HTTP headers, including authorization tokens (unused).
 *
 */
export class Config {
   // public apiBaseUrl:string = "https://apikarenprod.veninmaster.com/";
   // public apiBaseUrl: string = "http://192.168.0.167:8000/";   
   // public apiBaseUrl: string = "http://192.168.0.159:8000/";   
   public apiBaseUrl: string = "http://127.0.0.1:8000/";
   // public apiBaseUrl: string = "http://192.168.0.158:8081/";   
   public apiUrl: string = this.apiBaseUrl + "api/";

   public apiWeb: string = 'localhost:4200/';

   public getHeaders(type = 'application/json'): HttpHeaders {
      return new HttpHeaders({
         'content-type': type,
         'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0aWVtcG9pbmljaW8iOjE1Njg2MDQ4NTMsInRpZW1wb2ZpbiI6MTU2ODYwODQ1MywiaWR1c3VhcmlvIjoidXN1YXJpb3NzIn0.3Mrhe9lYNRC9GNl8JQ4-4lhxWcZNl5Vdr2VsvVpSiYs'
      });
   }
   /* propiedades nombres de base de api */
   /*Nuevos */
   public login: string = 'auth/login';
   public precio = 'precios';
   public moneda = 'monedas';
   public sucursal = 'sucursal';
   public clase = 'clase';
   public subclase = 'subclase';
   public subgrupo = 'subgrupo';
   public articulos = 'articulos';
   public proveedor = 'proveedor';
   public zona = 'zonas';
   public afectoigv = 'catalog07';
   public tipoexistencia = 'tipo_exis';
   public unidadmedida = 'unidades';
   public catalogoproducto = 'catalogproduct';
   public cliente = 'cliente';
   public factura = 'factura';
   public caracteristica = 'caracteristicas';
   public valor_caracteristicas = 'valor_caracteristicas';
   public detfactura = 'detfactu';
   public cotizacion = 'cotizacion';
   public detcotiza = 'detcotiza';
   public compra = 'compras';
   public detcompra = 'detcompra' 
   public detcompraDoc = 'detcompradocs'
   public tip_opetbl12 = 'tip_opetbl12';
   public motivo = 'motivo';
   public ajuste = 'ajuste'
   public detajuste = 'detajuste'
   public numero = 'numero';
   public detraccion = 'catalog54'
   public kardex = 'kardex';
   public kardex_valorado = 'kardex_val';
   public kardex_general = 'kardex_general';
   public tipodocumento = 'tipodocumento';
   public unidadsunat = 'unidadsunat';
   public guia = 'docrelaci'
   public guiacompra = 'guiacompra'
   
   public cuota = 'docredito'
   public bajadocumento = 'bajadocumento'
   public ingreso = 'ingreso'
   public detcajaing = 'detcajaing'
   public mediopago = 'mediopago'
   public bancos = 'bancos'
   public catalog10 = 'catalog10'
   public catalog17 = 'catalog17'
   public docredito = 'docredito'
   public guiamot = 'guiamot'
   public guiarem = 'guiarem'
   public detguia = 'detguia'
   public ubigeos = 'ubigeo'
   public transportista = 'transportes'
   public aprobadores = 'aprobadores';
   public vehiculo: string = 'vehiculo';
   public aprobaciones: string = 'aprobaciones';
   public preciocodbar = "preciocodbar";
   /*Antiguos */
   public tractosisterna: string = 'tractosisterna';
   public departamento: string = 'programacion';

   public conductor: string = 'choferes';
   public empresa: string = 'empresa';
   public pension: string = 'pension';
   public cargo: string = 'cargo';
   public viaje: string = 'viaje';
   public status: string = 'status';
   public certificadomedico: string = 'certificadomedico';
   public certificado: string = 'certificado';
   public tipocertificado: string = 'tipocertificado';
   public claselicencia: string = 'claselicencia';
   public categorialicencia: string = 'categorialicencia';
   public licencia: string = 'licencia';

   //public cliente:string='clientes';
   public operacion: string = 'operacion';
   public operacioncliente: string = 'operacioncliente';
   public usuario: string = 'usuario';
   public nivel: string = 'nivel';
   public perfil: string = 'perfil';
   public personal: string = 'personal';
   public sexo: string = 'sexo';
   public nacionalidad: string = 'nacionalidad';
   public estadocivil: string = 'estadocivil';
   public requerimiento: string = 'requerimiento';
   public anexo: string = 'anexo';
   public area: string = 'area';
   public tipovehiculo = 'tipovehiculo';
   public configuracionvehicular = "configuracionvehicular";
   public adquisicion = "adquisicion";
   public marca = "marca";
   public modelo = "modelo";
   public region = "region";
   public tipoproducto = "tipoproducto";
   public ruta = "ruta";
   public tiporuta = "tiporuta";
   public regionempresa = "regionempresa";
   public compartimento = "compartimento";
   public tipocargo = "tipocargo";
   public tipo_ope = "tipo_ope";
   public programacion = "programacion";
   public programaciondetalle = "programaciondetalle";
   public tractocisterna = "tractocisterna";
   public terminal = "terminal";
   public soat = "soat";
   public entidad = "entidad";
   public lugar = 'lugar';
   public seguimiento = 'seguimiento';

   //nuevos

   public clientedireccion = 'clientedireccion';
   public empleado = 'empleado'
   public facturatemp = 'facturatemp';
   public detallefacturatemp = 'detallefacturatemp';
   public guiasalida = 'guiasalida';
   public detalleguia = 'detalleguia';
   public detallepago = 'detallepago';
   
}
