import { GuiaSalida } from "../guiasalida";

export interface Detguia {
  idguiar: GuiaSalida;
  cantidad?: number | null;
  precio?: number | null;
  total?: number | null;
  idproduct: number;
}