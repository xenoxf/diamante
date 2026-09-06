export interface Invitacion {
  numero: string;
  objeto: string;
  fecha: string;
  fechaPublicacion?: string;
  estado?: string;
  slug?: string;
  documentoUrl?: string;
  documentoMediaUrl?: string | null;
}
