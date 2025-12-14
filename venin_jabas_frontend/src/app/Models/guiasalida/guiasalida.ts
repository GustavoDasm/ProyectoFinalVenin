

export interface GuiaSalida {
  idguiar: number;
  fecha?: string | null;
  hora?: string | null;
  estado?: string | null;
  referencia?: string | null;
  total?: number | null;
  idcliente: number;
  idtransporte: number;
  idsucursal: number;
}