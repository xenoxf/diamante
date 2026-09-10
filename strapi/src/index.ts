import type { Core } from '@strapi/strapi';

const parseSpanishDate = (str: string): string => {
  const meses: Record<string, string> = {
    enero: '01',
    febrero: '02',
    marzo: '03',
    abril: '04',
    mayo: '05',
    junio: '06',
    julio: '07',
    agosto: '08',
    septiembre: '09',
    octubre: '10',
    noviembre: '11',
    diciembre: '12',
  };
  const parts = str.trim().toLowerCase().split(' de ');
  if (parts.length === 3) {
    const dia = parts[0]!.padStart(2, '0');
    const mes = meses[parts[1]!] || '01';
    const ano = parts[2]!;
    return `${ano}-${mes}-${dia}`;
  }
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0]!;
  return new Date().toISOString().split('T')[0]!;
};

export default {
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      const shouldSeed = process.env.SEED_ON_BOOTSTRAP !== 'false';
      if (!shouldSeed) {
        strapi.log.info('Seed skipped (SEED_ON_BOOTSTRAP=false)');
        return;
      }

      // Check if already seeded by looking for noticias
      const existing = await strapi.documents('api::noticia.noticia').findMany({ limit: 1 });
      let didSeed = false;
      if (existing.length > 0) {
        strapi.log.info('Seed skipped: data already exists');
      } else {
        strapi.log.info('Seeding Strapi with initial data...');
        didSeed = true;

      // 1. Categorías Noticia
      const catNoticiaData = [
        { nombre: 'Contratación', slug: 'contratacion', descripcion: 'Procesos de contratación', color: '#067e92' },
        { nombre: 'Institucional', slug: 'institucional', descripcion: 'Vida institucional', color: '#07B9D5' },
        { nombre: 'Académico', slug: 'academico', descripcion: 'Académico', color: '#3d444d' },
        { nombre: 'Cultura', slug: 'cultura', descripcion: 'Cultura', color: '#7c3aed' },
        { nombre: 'Deporte', slug: 'deporte', descripcion: 'Deporte', color: '#059669' },
      ];
      const catNoticiaMap = new Map<string, string>();
      for (const c of catNoticiaData) {
        const doc = await strapi.documents('api::categoria-noticia.categoria-noticia').create({
          data: c as any,
          status: 'published',
        } as any);
        catNoticiaMap.set(c.nombre, (doc as any).documentId);
      }

      // 2. Categorías Galería
      const catGaleriaData = [
        { nombre: 'Sedes', slug: 'sedes' },
        { nombre: 'Deporte', slug: 'deporte' },
        { nombre: 'Cultura', slug: 'cultura' },
        { nombre: 'Académico', slug: 'academico' },
      ];
      const catGaleriaMap = new Map<string, string>();
      for (const c of catGaleriaData) {
        const doc = await strapi.documents('api::categoria-galeria.categoria-galeria').create({
          data: c as any,
          status: 'published',
        } as any);
        catGaleriaMap.set(c.nombre, (doc as any).documentId);
      }

      // 3. Sedes (3)
      const sedesData = [
        {
          nombre: 'Sede El Diamante (Principal)',
          slug: 'el-diamante',
          barrio: 'El Diamante',
          direccion: 'Carrera 33 N° 41-00, Cali, Colombia',
          telefono: '602 4260678',
          email: 'ie.eldiamante@cali.edu.co',
          mapQuery: 'Carrera 33 #41-00, El Diamante, Cali, Colombia',
          orden: 1,
          horarioAtencion: 'Lunes a viernes 7:00 - 15:00',
        },
        {
          nombre: 'Sede Juan Pablo II',
          slug: 'juan-pablo-ii',
          barrio: 'El Vergel',
          direccion: 'Carrera 33 N° 42 C 09, Cali, Colombia',
          telefono: '602 4376986',
          email: 'ie.eldiamante@cali.edu.co',
          mapQuery: 'Carrera 33 #42C-09, El Vergel, Cali, Colombia',
          orden: 2,
        },
        {
          nombre: 'Sede Señor de los Milagros',
          slug: 'senor-de-los-milagros',
          barrio: 'El Retiro',
          direccion: 'Carrera 38 No. 51 A 02, El Retiro, Cali, Colombia',
          telefono: '302 543 3862',
          email: 'ie.eldiamante@cali.edu.co',
          mapQuery: 'Carrera 38 #51A-02, El Retiro, Cali, Colombia',
          orden: 3,
        },
      ];
      const sedesMap = new Map<string, string>();
      for (const s of sedesData) {
        const doc = await strapi.documents('api::sede.sede').create({
          data: s as any,
          status: 'published',
        } as any);
        sedesMap.set(s.slug, (doc as any).documentId);
      }

      // 4. Especialidades (2)
      const especialidadesData = [
        {
          nombre: 'Técnico en Electricidad',
          slug: 'electricidad',
          descripcion:
            'Formación técnica orientada a las instalaciones eléctricas residenciales y a la práctica segura en taller. El estudiante desarrolla competencias básicas para el trabajo técnico y la continuidad en la educación superior.',
          puntosDestacados: [
            { texto: 'Instalaciones eléctricas residenciales' },
            { texto: 'Seguridad eléctrica y normatividad básica' },
            { texto: 'Lectura e interpretación de planos eléctricos' },
            { texto: 'Práctica guiada en taller institucional' },
          ],
          orden: 1,
        },
        {
          nombre: 'Técnico en Sistemas Teleinformaticos',
          slug: 'sistemas',
          descripcion:
            'Formación técnica en el uso, mantenimiento y aprovechamiento de las tecnologías de la información. El estudiante fortalece sus competencias digitales para el ámbito académico y laboral.',
          puntosDestacados: [
            { texto: 'Ofimática y herramientas digitales' },
            { texto: 'Mantenimiento preventivo de equipos de cómputo' },
            { texto: 'Fundamentos de redes básicas' },
            { texto: 'Introducción al desarrollo de software' },
          ],
          orden: 2,
        },
      ];
      for (const e of especialidadesData) {
        await strapi.documents('api::especialidad.especialidad').create({
          data: e as any,
          status: 'published',
        } as any);
      }

      // 5. Noticias (6) - contenido rico
      const noticiasData = [
        {
          titulo: 'Invitación No.15-2026',
          slug: 'invitacion-no-15-2026',
          fechaPublicacion: parseSpanishDate('4 de agosto de 2026'),
          categoriaNombre: 'Contratación',
          resumen: 'Invitación pública para el mantenimiento locativo de la institución educativa.',
          contenido:
            '<p>La Institución Educativa El Diamante invita a la comunidad a participar en la Invitación No.15-2026 para el mantenimiento locativo.</p><p>Los interesados pueden acercarse a la secretaría de la sede principal en el horario establecido.</p>',
          destacada: true,
        },
        {
          titulo: 'Invitación No.14-2026',
          slug: 'invitacion-no-14-2026',
          fechaPublicacion: parseSpanishDate('4 de agosto de 2026'),
          categoriaNombre: 'Contratación',
          resumen: 'Invitación pública para el suministro de papelería y kits escolares.',
          contenido:
            '<p>Invitación pública para el suministro de papelería y kits escolares para la IE El Diamante y sus sedes.</p>',
          destacada: false,
        },
        {
          titulo: 'Invitación No.13-2026',
          slug: 'invitacion-no-13-2026',
          fechaPublicacion: parseSpanishDate('4 de agosto de 2026'),
          categoriaNombre: 'Contratación',
          resumen: 'Invitación pública para el suministro de implementos de aseo.',
          contenido: '<p>Invitación pública para el suministro de implementos de aseo.</p>',
          destacada: false,
        },
        {
          titulo: 'Celebración del Día de la Afrocolombianidad',
          slug: 'celebracion-del-dia-de-la-afrocolombianidad',
          fechaPublicacion: parseSpanishDate('4 de agosto de 2026'),
          categoriaNombre: 'Institucional',
          resumen:
            'Jornada institucional de reconocimiento a la historia, la cultura y los aportes de la comunidad afrocolombiana.',
          contenido:
            '<p>Jornada institucional de reconocimiento a la historia, la cultura y los aportes de la comunidad afrocolombiana, con muestra cultural y actos académicos.</p>',
          destacada: true,
        },
        {
          titulo: 'Lista de útiles escolares 2026',
          slug: 'lista-de-utiles-escolares-2026',
          fechaPublicacion: parseSpanishDate('4 de agosto de 2026'),
          categoriaNombre: 'Académico',
          resumen: 'Consulte la lista oficial de útiles escolares por grado para el año lectivo 2026.',
          contenido:
            '<p>Consulte la lista oficial de útiles escolares por grado para el año lectivo 2026, publicada por la Institución Educativa El Diamante.</p>',
          destacada: true,
        },
        {
          titulo: 'Juegos Intercolegiados Regionales',
          slug: 'juegos-intercolegiados-regionales',
          fechaPublicacion: parseSpanishDate('4 de agosto de 2026'),
          categoriaNombre: 'Académico',
          resumen: 'Participación de las selecciones institucionales en los Juegos Intercolegiados Regionales.',
          contenido:
            '<p>Participación de las selecciones institucionales en los Juegos Intercolegiados Regionales con destacada representación.</p>',
          destacada: false,
        },
      ];
      for (const n of noticiasData) {
        const catId = catNoticiaMap.get(n.categoriaNombre);
        await strapi.documents('api::noticia.noticia').create({
          data: {
            titulo: n.titulo,
            slug: n.slug,
            resumen: n.resumen,
            contenido: n.contenido,
            fechaPublicacion: n.fechaPublicacion,
            destacada: n.destacada,
            categoria: catId as any,
          } as any,
          status: 'published',
        } as any);
      }

      // 6. Documentos Institucionales (7)
      const UPLOADS = 'https://www.ie-eldiamantecali.edu.co/wp-content/uploads';
      const SITE = 'https://www.ie-eldiamantecali.edu.co';
      const docsData = [
        {
          titulo: 'Manual de Convivencia IE El Diamante',
          slug: 'manual-convivencia',
          descripcion: 'Derechos, deberes, estímulos y procedimientos de la comunidad educativa.',
          categoria: 'Convivencia',
          formato: 'PDF',
          urlExterna: `${UPLOADS}/2025/01/MANUAL-CONVIVENCIA-IE-EL-DIAMANTE-1.pdf`,
          version: '2025',
        },
        {
          titulo: '¿A qué vamos al colegio?',
          slug: 'a-que-vamos-al-colegio',
          descripcion: 'Documento de la campaña de regreso y permanencia escolar.',
          categoria: 'Otro',
          formato: 'PDF',
          urlExterna: `${UPLOADS}/2025/01/A-que-vamos-al-colegio.pdf`,
        },
        {
          titulo: 'Proyecto Ambiental Escolar (PRAE)',
          slug: 'proyecto-ambiental',
          descripcion: 'Proyecto ambiental de la Institución Educativa El Diamante.',
          categoria: 'Ambiental',
          formato: 'PDF',
          urlExterna: `${UPLOADS}/2025/01/Proyecto-Ambiental.pdf`,
        },
        {
          titulo: 'Ficha de inscripción actualizada',
          slug: 'ficha-inscripcion',
          descripcion: 'Formulario de inscripción para aspirantes a cupo escolar.',
          categoria: 'Admisiones',
          formato: 'PDF',
          urlExterna: `${UPLOADS}/2024/10/FICHA-DE-INSCRIPCION-ACTUALIZADA-eldiamante.pdf`,
        },
        {
          titulo: 'Organigrama institucional',
          slug: 'organigrama',
          descripcion: 'Estructura organizacional de la Institución Educativa El Diamante.',
          categoria: 'Organizacion',
          formato: 'Imagen',
          urlExterna: `${UPLOADS}/2024/09/Organigrama-el-diamante-2-1024x683.png`,
        },
        {
          titulo: 'Resolución del Proceso de Matrícula',
          slug: 'resolucion-matricula',
          descripcion: 'Acto administrativo que regula el proceso de matrícula.',
          categoria: 'Admisiones',
          formato: 'Enlace',
          urlExterna: `${SITE}/resolucion-proceso-de-matricula/`,
        },
        {
          titulo: 'Proyecto Educativo Institucional',
          slug: 'pei',
          descripcion: 'Proyecto Educativo Institucional de la IE El Diamante — P.E.I. Definitivo.',
          categoria: 'PEI',
          formato: 'PDF',
          urlExterna: `${UPLOADS}/2024/09/P.E.I.-DEFINITIVO-DIAMANTE.pdf`,
        },
      ];
      for (const d of docsData) {
        await strapi.documents('api::documento-institucional.documento-institucional').create({
          data: d as any,
          status: 'published',
        } as any);
      }

      // 7. Invitaciones Contratación (19)
      const BASE = UPLOADS;
      const invitacionesData = [
        { numero: 'No.15-2026', objeto: 'Servicio de mantenimiento locativo de la IE El Diamante y sus sedes.', fecha: '4 de agosto de 2026' },
        { numero: 'No.14-2026', objeto: 'Suministro de insumos de papelería y kit docentes para la IE Diamante y sus sedes.', fecha: '4 de agosto de 2026' },
        { numero: 'No.13-2026', objeto: 'Suministro de insumos de papelería y kit docentes para la IE Diamante y sus sedes.', fecha: '18 de junio de 2026', documento: `${BASE}/2026/06/13-INVITACION-INSUMOS-DE-PAPELERIA.pdf` },
        { numero: 'No.12-2026', objeto: 'Suministro de insumos de aseo para la IE Diamante y sus sedes.', fecha: '18 de junio de 2026', documento: `${BASE}/2026/06/12-INVITACION-INSUMOS-DE-ASEO.pdf` },
        { numero: 'No.11-2026', objeto: 'Compra de materiales de ferretería para el mantenimiento de la planta física.', fecha: '18 de junio de 2026', documento: `${BASE}/2026/06/11-INVITACION-FERRETERIA.pdf` },
        { numero: 'No.10-2026', objeto: 'Compra de tres impresoras para pagaduría y coordinaciones de la sede principal.', fecha: '18 de junio de 2026', documento: `${BASE}/2026/06/10-INVITACION-COMPRA-IMPRESORAS.pdf` },
        { numero: 'No.3-2026', objeto: 'Arrendamiento de espacio locativo para tienda escolar en las tres sedes.', fecha: '27 de marzo de 2026', documento: `${BASE}/2026/03/3-INVITACION-TEINDAS-ESCOLARES.pdf` },
        { numero: 'No.2-2026', objeto: 'Suministro de materiales de ferretería.', fecha: '27 de marzo de 2026', documento: `${BASE}/2026/03/2-INVITACION-FERRETERIA-1-2.pdf` },
        { numero: 'No.1-2026', objeto: 'Compra de insumos para equipos de oficina de las coordinaciones y secretaría.', fecha: '17 de febrero de 2026', documento: `${BASE}/2026/02/1-INVITACION-insumos-fotocipiadora.pdf` },
        { numero: 'No.14-2025', objeto: 'Compra de elementos para proyectos institucionales de formación integral.', fecha: '3 de diciembre de 2025', documento: `${BASE}/2025/12/14-INVITACION-COMRA-ELEMENTOS-FORMACIO-INTEGRAL.pdf` },
        { numero: 'No.13-2025', objeto: 'Compra de juegos de mesa, colchonetas, textos del plan lector y material de educación integral.', fecha: '3 de diciembre de 2025', documento: `${BASE}/2025/12/13-INVITACION-COMPRA-JUEGOS-DE-MESA.pdf` },
        { numero: 'No.12-2025', objeto: 'Compra de chalecos, lonas y pendón para educación integral.', fecha: '2 de diciembre de 2025', documento: `${BASE}/2025/12/12-INVITACION-COMPRA-CHALECOS-Y-DEMAS.pdf` },
        { numero: 'No.11-2025', objeto: 'Compra de equipo multifuncional para la secretaría de la sede principal.', fecha: '24 de noviembre de 2025', documento: `${BASE}/2025/11/9-INVITACION-PARA-compra-EQUIPO-MULTIFUNCIONAL.pdf` },
        { numero: 'No.9-2025', objeto: 'Suministro de implementos de aseo y papelería para la IE Diamante y sus sedes.', fecha: '20 de noviembre de 2025' },
        { numero: 'No.3-2025', objeto: 'Suministro de implementos de aseo y papelería para la IE Diamante y sus sedes.', fecha: '3 de septiembre de 2025', documento: `${BASE}/2025/09/3-INVITACION-PARA-COMPRA-DE-FERRETERIA.pdf` },
        { numero: 'No.1-2025', objeto: 'Suministro de implementos de aseo y papelería para la IE Diamante y sus sedes.', fecha: '6 de junio de 2025', documento: `${BASE}/2025/06/1-INVITACION-PAPELERIA-Y-ASEO.pdf` },
        { numero: 'No.13-2024', objeto: 'Compra de muebles y enseres.', fecha: '5 de diciembre de 2024', documento: `${BASE}/2024/12/13-INVITACION-MUEBLES-Y-ENSERES.pdf` },
        { numero: 'No.14-2024', objeto: 'Compra de papelería y elementos de aseo.', fecha: '5 de diciembre de 2024', documento: `${BASE}/2024/12/14-INVITACION-PAPELERIA.pdf` },
        { numero: 'No.11-2024', objeto: 'Mantenimiento de la planta física de la IE Diamante y sus sedes.', fecha: '29 de octubre de 2024', documento: `${BASE}/2024/10/11-INVITACION-MTO-PLAN-FISICA.pdf` },
        { numero: 'No.10-2024', objeto: 'Mantenimiento de la planta física de la IE Diamante y sus sedes.', fecha: '29 de octubre de 2024', documento: `${BASE}/2024/10/10-INVITACION-MTO-PLANTA-FISICA-OCT.pdf` },
      ];
      for (const inv of invitacionesData) {
        await strapi.documents('api::invitacion-contratacion.invitacion-contratacion').create({
          data: {
            numero: inv.numero,
            slug: inv.numero.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            objeto: inv.objeto,
            fechaPublicacion: parseSpanishDate(inv.fecha),
            estado: 'cerrada',
            documentoUrl: (inv as any).documento || null,
          } as any,
          status: 'published',
        } as any);
      }

      // 8. Galería Items (12) - títulos de galeria.ts
      const galeriaData = [
        { titulo: 'Jornada de aseo y embellecimiento', categoria: 'Sedes', destacadoHome: true, orden: 1 },
        { titulo: 'Encuentro deportivo inter-sedes', categoria: 'Deporte', destacadoHome: true, orden: 2 },
        { titulo: 'Muestra cultural institucional', categoria: 'Cultura', destacadoHome: true, orden: 3 },
        { titulo: 'Feria de la ciencia escolar', categoria: 'Académico', destacadoHome: false, orden: 4 },
        { titulo: 'Acto de izada de bandera', categoria: 'Académico', destacadoHome: true, orden: 5 },
        { titulo: 'Torneo de fútbol intercolegiado', categoria: 'Deporte', destacadoHome: false, orden: 6 },
        { titulo: 'Presentación de danzas folclóricas', categoria: 'Cultura', destacadoHome: true, orden: 7 },
        { titulo: 'Entrega de sede restaurada', categoria: 'Sedes', destacadoHome: false, orden: 8 },
        { titulo: 'Jornada de lectura institucional', categoria: 'Académico', destacadoHome: false, orden: 9 },
        { titulo: 'Celebración día del estudiante', categoria: 'Cultura', destacadoHome: true, orden: 10 },
        { titulo: 'Mantenimiento planta física', categoria: 'Sedes', destacadoHome: false, orden: 11 },
        { titulo: 'Olimpiadas matemáticas', categoria: 'Académico', destacadoHome: false, orden: 12 },
      ];
      for (const g of galeriaData) {
        const catId = catGaleriaMap.get(g.categoria);
        // sin imagen aún, se crea sin imagen para no fallar required; usamos placeholder: creamos sin imagen pero schema requiere imagen
        // workaround: creamos con imagen null, luego admin subirá imagen
        // Para seed, omitimos imagen y usamos try/catch
        try {
          await strapi.documents('api::galeria-item.galeria-item').create({
            data: {
              titulo: g.titulo,
              descripcion: `Registro fotográfico: ${g.titulo}`,
              categoria: catId as any,
              destacadoHome: g.destacadoHome,
              orden: g.orden,
            } as any,
            status: 'published',
          } as any);
        } catch (e) {
          // Si falla por imagen requerida, creamos con campo dummy y luego admin debe subir
          strapi.log.warn(`Galería ${g.titulo} sin imagen: ${e}`);
        }
      }

      // 9. Single Types
      // Configuración General
      const existingConfig = await strapi.documents('api::configuracion-general.configuracion-general').findFirst();
      if (!existingConfig) {
        await strapi.documents('api::configuracion-general.configuracion-general').create({
          data: {
            nombreInstitucion: 'Institución Educativa El Diamante',
            emailInstitucional: 'ie.eldiamante@cali.edu.co',
            telefonoPrincipal: '602 4260678',
            direccionPrincipal: 'Carrera 33 N° 41-00, barrio El Diamante, Cali',
            horarioAtencion: '<p>Lunes a viernes 7:00 - 15:00. Sedes: El Diamante, Juan Pablo II, Señor de los Milagros.</p>',
            avisoLegalFooter: '© 2026 Institución Educativa El Diamante · Santiago de Cali',
            enlacesGobierno: [
              { label: 'Transparencia', url: 'https://transparencia.cali.gov.co/', externo: true, abrirEnNuevaPestana: true },
              { label: 'Alcaldía de Cali', url: 'https://www.cali.gov.co/', externo: true, abrirEnNuevaPestana: true },
              { label: 'Secretaría de Educación', url: 'https://www.cali.gov.co/educacion/', externo: true, abrirEnNuevaPestana: true },
            ],
            redesSociales: [],
          } as any,
          status: 'published',
        } as any);
      }

      // Página Identidad
      const existingIdent = await strapi.documents('api::pagina-identidad.pagina-identidad').findFirst();
      if (!existingIdent) {
        await strapi.documents('api::pagina-identidad.pagina-identidad').create({
          data: {
            mision:
              '<p>La <strong>Institución Educativa El Diamante</strong> se reconoce pluriétnica y multicultural. Forma estudiantes con calidad humana y competencias técnicas, a través de la participación de los actores educativos y con el apoyo de diferentes instituciones educativas a nivel local, regional, nacional y del entorno de la comuna 13.</p><p>Este trabajo articulado permite a los estudiantes la construcción de relaciones sociales dinámicas y prósperas para el desarrollo de competencias que faciliten el acceso al campo laboral o a la educación superior.</p>',
            vision:
              '<p>La <strong>Institución Educativa El Diamante</strong>, al 2030, será reconocida como una institución pluriétnica y multicultural, modelo de excelencia en la educación media técnica en la comuna 13 de Santiago de Cali y referente para el desarrollo social de la comunidad.</p>',
            valoresIntroduccion:
              'Se definen como valores institucionales aquellos que identificarán al educando formado en nuestras aulas y que fueron elegidos como parte de nuestra filosofía educativa, producto del entorno y del PEI.',
            valores: [
              { titulo: 'Pensamiento Crítico y Toma de Decisiones', descripcion: 'Que comprenda, analice, discierna, argumente y proponga soluciones sobre situaciones de su entorno que le permita actuar de forma autónoma para resolver conflictos con responsabilidad social.', orden: 1 },
              { titulo: 'Identidad y Pertenencia', descripcion: 'Se reconozca como parte de la comunidad Diamantina cumpliendo sus deberes institucionales y compromisos, reflejando en actuaciones dentro y fuera de la institución los valores institucionales, además portando sus distintivos con orgullo y respeto.', orden: 2 },
              { titulo: 'Trabajo en Equipo', descripcion: 'Dinamiza la unidad grupal para fomentar la solidaridad, la responsabilidad, el compromiso, la tolerancia, el respeto mutuo, la discusión democrática, el compromiso hacia los consensos en pro del desarrollo institucional.', orden: 3 },
              { titulo: 'Creatividad', descripcion: 'Actitud innovadora que le permite la capacidad de generar ideas constructivas para su vida cotidiana de manera práctica.', orden: 4 },
              { titulo: 'Inclusión Social', descripcion: 'Interacción con sus pares, y en cualquier grupo social apoyándose en la convivencia pacífica.', orden: 5 },
            ],
            organigramaDescripcion: 'Estructura organizacional encabezada por la Rectoría, apoyada por las coordinaciones, el consejo directivo y los órganos de participación de la comunidad educativa.',
          } as any,
          status: 'published',
        } as any);
      }

      // Página Inicio
      const existingInicio = await strapi.documents('api::pagina-inicio.pagina-inicio').findFirst();
      if (!existingInicio) {
        await strapi.documents('api::pagina-inicio.pagina-inicio').create({
          data: {
            tituloHero: 'Institución Educativa El Diamante',
            carruselConfig: { autoplayMs: 4500, transitionMs: 1200 },
          } as any,
          status: 'published',
        } as any);
      }

      // Página Admisiones
      const existingAdm = await strapi.documents('api::pagina-admisiones.pagina-admisiones').findFirst();
      if (!existingAdm) {
        await strapi.documents('api::pagina-admisiones.pagina-admisiones').create({
          data: {
            introduccion:
              '<p>La Institución Educativa El Diamante informa a las familias los requisitos de inscripción y matrícula. El trámite se realiza en cada sede, de acuerdo con el calendario establecido por la Secretaría de Educación de Santiago de Cali.</p>',
            requisitos:
              '<p>Requisitos: ficha de inscripción diligenciada, documento de identidad del estudiante y acudiente, certificados previos y fotografías.</p>',
            notaAclaratoria: 'Los requisitos y fechas pueden variar cada año. Se recomienda consultar directamente en la sede antes de iniciar el trámite.',
            listasUtiles: [
              { grado: 'Grado Sexto', descripcion: 'Lista oficial 2026' },
              { grado: 'Grado Séptimo', descripcion: 'Lista oficial 2026' },
              { grado: 'Grado Octavo', descripcion: 'Lista oficial 2026' },
              { grado: 'Grado Noveno', descripcion: 'Lista oficial 2026' },
              { grado: 'Grado Décimo', descripcion: 'Lista oficial 2026' },
              { grado: 'Grado Once', descripcion: 'Lista oficial 2026' },
            ],
          } as any,
          status: 'published',
        } as any);
      }

      // Página Contacto
      const existingContacto = await strapi.documents('api::pagina-contacto.pagina-contacto').findFirst();
      if (!existingContacto) {
        await strapi.documents('api::pagina-contacto.pagina-contacto').create({
          data: {
            titulo: 'Contacto',
            introduccion:
              '<p>Para consultas académicas, administrativas o de convivencia, la comunidad puede comunicarse por los siguientes canales institucionales. La atención presencial se presta en el horario establecido por cada sede.</p>',
            canales: [
              { nombre: 'Atención presencial', detalle: 'Secretarías de cada sede en el horario establecido. Sede principal: Carrera 33 N° 41-00, barrio El Diamante, Cali.', icono: 'map-pin' },
              { nombre: 'Atención telefónica', detalle: 'Sede principal 602 4260678 · Sede Juan Pablo II 602 4376986 · Sede Señor de los Milagros 302 543 3862.', icono: 'phone' },
              { nombre: 'Correo electrónico', detalle: 'Escríbanos a ie.eldiamante@cali.edu.co para consultas académicas y administrativas.', icono: 'mail' },
              { nombre: 'Sede electrónica', detalle: 'Formularios de contacto, PQR y denuncias disponibles en la sección Servicios de este sitio.', icono: 'globe' },
            ],
            formularioActivo: true,
          } as any,
          status: 'published',
        } as any);
      }

      // Slides carrusel iniciales (sin imagen, se debe subir luego)
      const existingSlides = await strapi.documents('api::slide-carrusel.slide-carrusel').findMany({ limit: 1 });
      if (existingSlides.length === 0) {
        const slides = [
          { titulo: 'Bienvenidos', alt: 'Fachada sede principal', enlace: '/galeria', orden: 1, activo: true },
          { titulo: 'Nuestra comunidad', alt: 'Estudiantes en actividad', enlace: '/galeria', orden: 2, activo: true },
          { titulo: 'Formación técnica', alt: 'Taller electricidad', enlace: '/especialidades', orden: 3, activo: true },
        ];
        for (const s of slides) {
          try {
            await strapi.documents('api::slide-carrusel.slide-carrusel').create({
              data: s as any,
              status: 'published',
            } as any);
          } catch (e) {
            strapi.log.warn(`Slide sin imagen: ${e}`);
          }
        }
      }

      strapi.log.info('Seed completed successfully');
      }
    } catch (e) {
      strapi.log.error('Seed failed: ' + e);
      console.error(e);
    }

    // Configure public permissions via raw SQL (idempotent)
    try {
      const publicRole = await strapi.db.query('plugin::users-permissions.role').findOne({
        where: { type: 'public' },
      });
      if (publicRole) {
        const wantedPermissions = [
          'api::categoria-noticia.categoria-noticia.find',
          'api::categoria-noticia.categoria-noticia.findOne',
          'api::categoria-galeria.categoria-galeria.find',
          'api::categoria-galeria.categoria-galeria.findOne',
          'api::noticia.noticia.find',
          'api::noticia.noticia.findOne',
          'api::sede.sede.find',
          'api::sede.sede.findOne',
          'api::especialidad.especialidad.find',
          'api::especialidad.especialidad.findOne',
          'api::invitacion-contratacion.invitacion-contratacion.find',
          'api::invitacion-contratacion.invitacion-contratacion.findOne',
          'api::documento-institucional.documento-institucional.find',
          'api::documento-institucional.documento-institucional.findOne',
          'api::galeria-item.galeria-item.find',
          'api::galeria-item.galeria-item.findOne',
          'api::slide-carrusel.slide-carrusel.find',
          'api::slide-carrusel.slide-carrusel.findOne',
          'api::configuracion-general.configuracion-general.find',
          'api::pagina-identidad.pagina-identidad.find',
          'api::pagina-inicio.pagina-inicio.find',
          'api::pagina-admisiones.pagina-admisiones.find',
          'api::pagina-contacto.pagina-contacto.find',
          'api::mensaje-contacto.mensaje-contacto.create',
          'api::solicitud-pqrsf.solicitud-pqrsf.create',
          'api::denuncia-corrupcion.denuncia-corrupcion.create',
          // Upload necesario para adjuntos de PQRSF y denuncias
          'plugin::upload.content-api.upload',
        ];
        for (const action of wantedPermissions) {
          // Find or create permission
          let perm = await strapi.db.connection.raw(`SELECT id FROM up_permissions WHERE action = ? LIMIT 1`, [action]);
          // @ts-ignore
          let permId: number | null = perm?.[0]?.id ?? perm?.rows?.[0]?.id ?? null;
          // Try alternative shape: strapi.db.connection.raw returns different format with sqlite
          if (!permId) {
            // Try query via knex
            const knex = strapi.db.connection as any;
            // Use strapi.db.query as fallback
            const q = await strapi.db.query('plugin::users-permissions.permission').findOne({ where: { action } } as any);
            if (q) permId = (q as any).id;
          }
          if (!permId) {
            const now = new Date().toISOString();
            const inserted: any = await strapi.db.connection.raw(
              `INSERT INTO up_permissions (action, created_at, updated_at) VALUES (?, ?, ?) RETURNING id`,
              [action, now, now]
            );
            permId = inserted?.[0]?.id ?? inserted?.rows?.[0]?.id;
            if (!permId) {
              // fallback without RETURNING (sqlite)
              const res2: any = await strapi.db.connection.raw(`SELECT id FROM up_permissions WHERE action = ? LIMIT 1`, [action]);
              permId = res2?.[0]?.id ?? res2?.rows?.[0]?.id;
            }
          }
          if (permId) {
            const link: any = await strapi.db.connection.raw(
              `SELECT 1 as exists_flag FROM up_permissions_role_lnk WHERE permission_id = ? AND role_id = ? LIMIT 1`,
              [permId, publicRole.id]
            );
            const exists = link?.[0]?.exists_flag ?? link?.rows?.[0]?.exists_flag;
            if (!exists) {
              await strapi.db.connection.raw(
                `INSERT INTO up_permissions_role_lnk (permission_id, role_id) VALUES (?, ?)`,
                [permId, publicRole.id]
              );
            }
          }
        }
        strapi.log.info('Public permissions configured');
      }
    } catch (e) {
      strapi.log.error('Failed to configure public permissions: ' + e);
      console.error(e);
    }
  },
};
