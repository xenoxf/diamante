import type { Schema, Struct } from '@strapi/strapi';

export interface AcademicoListaUtilesItem extends Struct.ComponentSchema {
  collectionName: 'components_academico_lista_utiles_items';
  info: {
    displayName: 'Lista \u00DAtiles Item';
    icon: 'book';
  };
  attributes: {
    archivo: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    descripcion: Schema.Attribute.Text;
    grado: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface AcademicoPuntoEspecialidad extends Struct.ComponentSchema {
  collectionName: 'components_academico_punto_especialidads';
  info: {
    displayName: 'Punto Especialidad';
    icon: 'check';
  };
  attributes: {
    texto: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface IdentidadValorInstitucional extends Struct.ComponentSchema {
  collectionName: 'components_identidad_valor_institucionals';
  info: {
    description: 'Valor con t\u00EDtulo y descripci\u00F3n';
    displayName: 'Valor Institucional';
    icon: 'star';
  };
  attributes: {
    descripcion: Schema.Attribute.Text & Schema.Attribute.Required;
    orden: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    titulo: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedCanalAtencion extends Struct.ComponentSchema {
  collectionName: 'components_shared_canal_atencions';
  info: {
    displayName: 'Canal Atenci\u00F3n';
    icon: 'headset';
  };
  attributes: {
    detalle: Schema.Attribute.Text & Schema.Attribute.Required;
    icono: Schema.Attribute.String;
    nombre: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedCarruselConfig extends Struct.ComponentSchema {
  collectionName: 'components_shared_carrusel_configs';
  info: {
    displayName: 'Carrusel Config';
    icon: 'sliders-h';
  };
  attributes: {
    autoplayMs: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 20000;
          min: 1000;
        },
        number
      > &
      Schema.Attribute.DefaultTo<4500>;
    transitionMs: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 5000;
          min: 200;
        },
        number
      > &
      Schema.Attribute.DefaultTo<1200>;
  };
}

export interface SharedEnlace extends Struct.ComponentSchema {
  collectionName: 'components_shared_enlaces';
  info: {
    displayName: 'Enlace';
    icon: 'link';
  };
  attributes: {
    abrirEnNuevaPestana: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    externo: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedHorarioAtencion extends Struct.ComponentSchema {
  collectionName: 'components_shared_horario_atencions';
  info: {
    displayName: 'Horario Atenci\u00F3n';
    icon: 'clock';
  };
  attributes: {
    dias: Schema.Attribute.String & Schema.Attribute.Required;
    horas: Schema.Attribute.String & Schema.Attribute.Required;
    sede: Schema.Attribute.String;
  };
}

export interface SharedRedSocial extends Struct.ComponentSchema {
  collectionName: 'components_shared_red_socials';
  info: {
    displayName: 'Red Social';
    icon: 'share-alt';
  };
  attributes: {
    plataforma: Schema.Attribute.Enumeration<
      ['facebook', 'instagram', 'youtube', 'twitter', 'tiktok']
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Metadatos SEO por p\u00E1gina/entidad';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Schema.Attribute.String;
    keywords: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 160;
      }>;
    metaImage: Schema.Attribute.Media<'images'>;
    metaTitle: Schema.Attribute.String &
      Schema.Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    noIndex: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'academico.lista-utiles-item': AcademicoListaUtilesItem;
      'academico.punto-especialidad': AcademicoPuntoEspecialidad;
      'identidad.valor-institucional': IdentidadValorInstitucional;
      'shared.canal-atencion': SharedCanalAtencion;
      'shared.carrusel-config': SharedCarruselConfig;
      'shared.enlace': SharedEnlace;
      'shared.horario-atencion': SharedHorarioAtencion;
      'shared.red-social': SharedRedSocial;
      'shared.seo': SharedSeo;
    }
  }
}
