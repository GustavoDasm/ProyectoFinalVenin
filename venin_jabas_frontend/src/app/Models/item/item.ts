export class Item {
    unidad_de_medida: string;
    codigo?: string ;
    descripcion: string;
    cantidad: number;
    valor_unitario: number;
    precio_unitario: number;
    descuento?: number ;
    subtotal: number;
    tipo_de_igv: number;
    tipo_de_ivap?: string ;
    igv: number;
    impuesto_bolsas?: number ;
    total: number;
    anticipo_regularizacion: boolean;
    anticipo_documento_serie?: string;
    anticipo_documento_numero?: string;
    codigo_producto_sunat?: string ;
    tipo_de_isc?: number ;
    isc?: number ;
}
