import { useState } from 'react';
import { STRAPI_URL } from '../lib/strapi';
import styles from '../styles/forms.module.css';

type Status = 'idle' | 'loading' | 'success' | 'error';

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function DenunciaForm() {
  const [anonima, setAnonima] = useState(true);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [adjuntos, setAdjuntos] = useState<FileList | null>(null);
  const [reservaIdentidad, setReservaIdentidad] = useState(true);
  const [consentimiento, setConsentimiento] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!descripcion.trim() || descripcion.trim().length < 20) e.descripcion = 'La descripción debe tener al menos 20 caracteres y ser lo más detallada posible.';
    if (!anonima) {
      if (nombre && nombre.trim().length > 0 && nombre.trim().length < 3) e.nombre = 'Nombre inválido.';
      if (email && email.trim().length > 0 && !validateEmail(email.trim())) e.email = 'Correo electrónico inválido.';
    }
    if (!consentimiento) e.consentimiento = 'Debe aceptar el tratamiento de datos.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const tryUploadMany = async (files: FileList): Promise<number[]> => {
    const ids: number[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file) continue;
      try {
        const fd = new FormData();
        fd.append('files', file);
        const res = await fetch(`${STRAPI_URL}/api/upload`, { method: 'POST', body: fd });
        if (!res.ok) {
          console.warn('[DenunciaForm] upload failed', res.status);
          continue;
        }
        const json = await res.json();
        const first = Array.isArray(json) ? json[0] : json?.[0] ?? json;
        if (first?.id) ids.push(first.id);
      } catch (err) {
        console.warn('[DenunciaForm] upload exception', err);
      }
    }
    return ids;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (honeypot.trim() !== '') {
      setStatus('success');
      setMessage('Denuncia recibida. Se garantiza la reserva de identidad y será evaluada con confidencialidad.');
      return;
    }
    if (!validate()) return;

    setStatus('loading');
    setMessage('');

    try {
      let adjuntoIds: number[] = [];
      if (adjuntos && adjuntos.length > 0) {
        adjuntoIds = await tryUploadMany(adjuntos);
      }

      const payload: any = {
        anonima,
        descripcion: descripcion.trim(),
        reservaIdentidad: anonima ? true : reservaIdentidad,
        consentimiento: true,
      };
      if (!anonima) {
        if (nombre.trim()) payload.nombre = nombre.trim();
        if (email.trim()) payload.email = email.trim();
      }
      if (adjuntoIds.length > 0) payload.adjuntos = adjuntoIds;

      const res = await fetch(`${STRAPI_URL}/api/denuncias-corrupcion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ data: payload }),
      });

      if (!res.ok) {
        let body = '';
        try {
          body = await res.text();
          const j = JSON.parse(body);
          body = j?.error?.message || j?.message || body;
        } catch {
          body = body.slice(0, 600);
        }
        throw new Error(typeof body === 'string' ? body.slice(0, 600) : `Error ${res.status}`);
      }

      setStatus('success');
      setMessage(
        adjuntos && adjuntos.length > 0 && adjuntoIds.length === 0
          ? 'Denuncia recibida. Nota: los adjuntos no pudieron subirse, pero la denuncia fue registrada. Puede enviar evidencias al correo institucional indicando el radicado.'
          : 'Denuncia recibida con éxito. Se garantiza la reserva de su identidad y la confidencialidad de la información. Será evaluada por las instancias competentes.'
      );
      setDescripcion('');
      if (!anonima) {
        setNombre('');
        setEmail('');
      }
      setAdjuntos(null);
      setConsentimiento(false);
      setErrors({});
      const fi = document.getElementById('denuncia-adjuntos') as HTMLInputElement | null;
      if (fi) fi.value = '';
    } catch (err: any) {
      console.error('[DenunciaForm]', err);
      const m =
        err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')
          ? 'No se pudo conectar con el servidor. Verifique conexión o intente más tarde.'
          : err?.message || 'Error al enviar la denuncia. Intente de nuevo.';
      setStatus('error');
      setMessage(m);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form} aria-label="Formulario de denuncia por hechos de corrupción" style={{ position: 'relative' }}>
      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden', opacity: 0 }}>
        <label htmlFor="denuncia-website">No diligenciar</label>
        <input id="denuncia-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <div className={styles.anonymousToggle}>
        <label htmlFor="denuncia-anonima">
          <input
            id="denuncia-anonima"
            type="checkbox"
            checked={anonima}
            onChange={(e) => setAnonima(e.target.checked)}
          />
          Presentar de forma anónima
        </label>
        <p>
          Si marca esta opción no es necesario diligenciar nombre ni correo. Se garantiza la reserva de identidad. Si desmarca, podrá dejar datos de contacto para seguimiento.
        </p>
      </div>

      {!anonima && (
        <>
          <div className={styles.fieldRow}>
            <div className={styles.field}>
              <label htmlFor="denuncia-nombre">Nombre (opcional)</label>
              <input
                id="denuncia-nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                aria-invalid={!!errors.nombre}
                aria-describedby={errors.nombre ? 'err-denuncia-nombre' : undefined}
                className={errors.nombre ? styles.fieldInputError : ''}
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Opcional"
              />
              {errors.nombre && <span id="err-denuncia-nombre" role="alert" className={styles.fieldError}>{errors.nombre}</span>}
            </div>

            <div className={styles.field}>
              <label htmlFor="denuncia-email">Correo electrónico (opcional)</label>
              <input
                id="denuncia-email"
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'err-denuncia-email' : undefined}
                className={errors.email ? styles.fieldInputError : ''}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Opcional para seguimiento"
              />
              {errors.email && <span id="err-denuncia-email" role="alert" className={styles.fieldError}>{errors.email}</span>}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="denuncia-reserva" className={styles.checkboxGroup}>
              <input
                id="denuncia-reserva"
                type="checkbox"
                checked={reservaIdentidad}
                onChange={(e) => setReservaIdentidad(e.target.checked)}
              />
              <div>
                <span className={styles.checkboxLabel}>Solicito reserva de identidad</span>
                <p className={styles.checkboxDescription}>
                  Su identidad será protegida y no será revelada en el proceso de investigación.
                </p>
              </div>
            </label>
          </div>
        </>
      )}

      <div className={styles.field}>
        <label htmlFor="denuncia-descripcion">
          Descripción detallada de los hechos
          <span className={styles.fieldRequired}>*</span>
        </label>
        <textarea
          id="denuncia-descripcion"
          name="descripcion"
          rows={6}
          required
          aria-invalid={!!errors.descripcion}
          aria-describedby={[errors.descripcion ? 'err-denuncia-descripcion' : null, 'ayuda-denuncia-descripcion'].filter(Boolean).join(' ')}
          className={errors.descripcion ? styles.fieldInputError : ''}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describa con el mayor detalle posible: qué ocurrió, cuándo, dónde, quiénes estarían involucrados, y cualquier prueba o indicio relevante..."
        />
        {errors.descripcion && <span id="err-denuncia-descripcion" role="alert" className={styles.fieldError}>{errors.descripcion}</span>}
        <p id="ayuda-denuncia-descripcion" className={styles.fieldHelp}>
          Evite incluir datos sensibles innecesarios. No presente denuncias temerarias o falsas; pueden acarrear sanciones legales.
        </p>
      </div>

      <div className={styles.field}>
        <label htmlFor="denuncia-adjuntos">Adjuntos / evidencias (opcional, múltiple)</label>
        <input
          id="denuncia-adjuntos"
          name="adjuntos"
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.mp4,.mp3"
          aria-describedby="ayuda-denuncia-adjuntos"
          className={styles.fileInput}
          onChange={(e) => setAdjuntos(e.target.files)}
        />
        <p id="ayuda-denuncia-adjuntos" className={styles.fieldHelp}>
          Puede adjuntar documentos, imágenes o grabaciones. Máximo 5MB por archivo. Si no se cargan, la denuncia igualmente se radica y puede enviar evidencias al correo institucional.
        </p>
      </div>

      <div className={styles.field}>
        <label htmlFor="denuncia-consentimiento" className={styles.consent}>
          <input
            id="denuncia-consentimiento"
            type="checkbox"
            required
            aria-invalid={!!errors.consentimiento}
            aria-describedby={[errors.consentimiento ? 'err-denuncia-consentimiento' : null, 'ayuda-denuncia-consentimiento'].filter(Boolean).join(' ')}
            checked={consentimiento}
            onChange={(e) => setConsentimiento(e.target.checked)}
          />
          <span>
            Autorizo el tratamiento de mis datos (si fueron proporcionados) y declaro que la información es veraz, conforme a la{' '}
            <a href="/manual-convivencia" target="_blank" rel="noopener noreferrer">
              política de privacidad
            </a>{' '}
            y Ley 1581 de 2012. Entiendo que las denuncias temerarias pueden tener consecuencias legales. *
          </span>
        </label>
        {errors.consentimiento && <span id="err-denuncia-consentimiento" role="alert" className={styles.fieldError}>{errors.consentimiento}</span>}
        <p id="ayuda-denuncia-consentimiento" className={styles.fieldHelp}>
          Aviso de privacidad: la denuncia se trata con confidencialidad y reserva. Solo personal autorizado accederá a la información. Este canal no reemplaza denuncia penal ante Fiscalía General de la Nación.
        </p>
      </div>

      <button className={styles.submit} type="submit" disabled={status === 'loading'} aria-busy={status === 'loading'}>
        {status === 'loading' && <span className={styles.loadingSpinner} />}
        {status === 'loading' ? 'Enviando…' : 'Enviar denuncia'}
      </button>

      {message && (
        <div
          role={status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`${styles.statusMessage} ${status === 'success' ? styles.statusSuccess : status === 'error' ? styles.statusError : ''}`}
        >
          {message}
        </div>
      )}
    </form>
  );
}
