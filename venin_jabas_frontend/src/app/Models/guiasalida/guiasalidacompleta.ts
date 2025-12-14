import { DetallePago } from "../detallepago/detallepago";
import { Detguia } from "./detguia/detguia";

export interface GuiaSalida {
  idguiar: number;
  fecha?: string | null;
  hora?: string | null;
  estado?: string | null;
  referencia?: string | null;
  total?: number | null;
  pago?: number | null;
  idcliente: number;
  idtransporte: number;
  idsucursal: number;
  detalleVentas?: Detguia[];   // <-- nuevo
  detallePagos?: DetallePago[];     // <-- nuevo
}