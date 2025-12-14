import { Sucursal } from "../sucursal/sucursal";

export class Ajuste {
  idajuste: number;
  numero?: string | null;
  fecha?: string | null;
  referencia?: string | null;
  idsucursal:any | Sucursal;
}