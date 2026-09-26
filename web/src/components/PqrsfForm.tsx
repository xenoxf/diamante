import { useState } from 'react';
import { STRAPI_URL } from '../lib/strapi';
import styles from '../styles/forms.module.css';

type Status = 'idle' | 'loading' | 'success' | 'error';

type TipoPqrsf = 'peticion' | 'queja' | 'reclamo' | 'sugerencia' | 'felicitacion';

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function PqrsfForm() {
  const [tipo, setTipo] = useState<TipoPqrsf>('peticion');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [adjunto, setAdjunto] = useState<File | null>(null);
  const [consentimiento, setConsentimiento] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!nombre.trim() || nombre.trim().length < 3) e.nombre = 'Nombre requerido (mínimo 3 caracteres).';
    if (!email.trim() || !validateEmail(email.trim())) e.email = 'Correo electrónico válido requerido.';
    if (!asunto.trim() || asunto.trim().length < 5) e.asunto = 'Asunto requerido (mínimo 5 caracteres).';
    if (!descripcion.trim() || descripcion.trim().length < 15) e.descripcion = 'Descripción debe tener al menos 15 caracteres.';
    if (telefono && telefono.trim().length > 0 && !/^[\d\s+\-()]{7,20}$/.test(telefono.trim())) e.telefono = 'Teléfono inválido (solo dígitos, espacios, +, -).';
    if (!consentimiento) e.consentimiento = 'Debe autorizar el tratamiento de datos.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const tryUpload = async (file: File): Promise<number | null> => {
    try {
      const fd = new FormData();
      fd.append('files', file);
      const res = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        console.warn('[PqrsfForm] upload failed', res.status, await res.text().catch(() => ''));
        return null;
      }
      const json = await res.json();
      const first = Array.isArray(json) ? json[0] : json?.[0] ?? json;
      return first?.id ?? null;
    } catch (err) {
      console.warn('[PqrsfForm] upload exception', err);
      return null;
    }
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (honeypot.trim() !== '') {
      setStatus('success');
      setMessage('Solicitud radicada correctamente. Recibirá respuesta en los términos de ley.');
      return;
    }
    if (!validate()) return;

    setStatus('loading');
    setMessage('');

    try {
      let adjuntoId: number | null = null;
      if (adjunto) {
        adjuntoId = await tryUpload(adjunto);
      }

      const payload: any = {
        tipo,
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
        asunto: asunto.trim(),
        descripcion: descripcion.trim(),
        consentimiento: true,
      };
      if (adjuntoId) payload.adjunto = adjuntoId;

      const res = await fetch(`${STRAPI_URL}/api/solicitudes-pqrsf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
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
        adjunto && !adjuntoId
          ? 'Solicitud radicada correctamente. Nota: el archivo adjunto no pudo subirse, pero su solicitud fue registrada sin adjunto.'
          : 'Solicitud PQRSF radicada correctamente. Recibirá respuesta en los términos establecidos por la ley (Ley 1755 de 2015).'
      );
      setNombre('');
      setEmail('');
      setTelefono('');
      setAsunto('');
      setDescripcion('');
      setAdjunto(null);
      setConsentimiento(false);
      setErrors({});
      const fileInput = document.getElementById('pqrsf-adjunto') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      console.error('[PqrsfForm]', err);
      const m =
        err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')
          ? 'No se pudo conectar con el servidor. Verifique conexión o intente más tarde.'
          : err?.message || 'Error al radicar la solicitud. Intente de nuevo.';
      setStatus('error');
      setMessage(m);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.form} aria-label="Formulario PQRSF" style={{ position: 'relative' }}>
      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden', opacity: 0 }}>
        <label htmlFor="pqrsf-website">No diligenciar</label>
        <input id="pqrsf-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <div className={styles.field}>
        <label htmlFor="pqrsf-tipo">
          Tipo de solicitud
          <span className={styles.fieldRequired}>*</span>
        </label>
        <select
          id="pqrsf-tipo"
          name="tipo"
          required
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoPqrsf)}
        >
          <option value="peticion">Petición</option>
          <option value="queja">Queja</option>
          <option value="reclamo">Reclamo</option>
          <option value="sugerencia">Sugerencia</option>
          <option value="felicitacion">Felicitación</option>
        </select>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="pqrsf-nombre">
            Nombre completo
            <span className={styles.fieldRequired}>*</span>
          </label>
          <input
            id="pqrsf-nombre"
            name="nombre"
            type="text"
            required
            autoComplete="name"
            aria-invalid={!!errors.nombre}
            aria-describedby={errors.nombre ? 'err-pqrsf-nombre' : undefined}
            className={errors.nombre ? styles.fieldInputError : ''}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Carlos Gómez"
          />
          {errors.nombre && <span id="err-pqrsf-nombre" role="alert" className={styles.fieldError}>{errors.nombre}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="pqrsf-email">
            Correo electrónico
            <span className={styles.fieldRequired}>*</span>
          </label>
          <input
            id="pqrsf-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'err-pqrsf-email' : undefined}
            className={errors.email ? styles.fieldInputError : ''}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@correo.com"
          />
          {errors.email && <span id="err-pqrsf-email" role="alert" className={styles.fieldError}>{errors.email}</span>}
        </div>
      </div>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label htmlFor="pqrsf-telefono">Teléfono (opcional)</label>
          <input
            id="pqrsf-telefono"
            name="telefono"
            type="tel"
            autoComplete="tel"
            aria-invalid={!!errors.telefono}
            aria-describedby={errors.telefono ? 'err-pqrsf-telefono' : undefined}
            className={errors.telefono ? styles.fieldInputError : ''}
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej: 302 123 4567"
          />
          {errors.telefono && <span id="err-pqrsf-telefono" role="alert" className={styles.fieldError}>{errors.telefono}</span>}
        </div>

        <div className={styles.field}>
          <label htmlFor="pqrsf-asunto">
            Asunto
            <span className={styles.fieldRequired}>*</span>
          </label>
          <input
            id="pqrsf-asunto"
            name="asunto"
            type="text"
            required
            autoComplete="off"
            aria-invalid={!!errors.asunto}
            aria-describedby={errors.asunto ? 'err-pqrsf-asunto' : undefined}
            className={errors.asunto ? styles.fieldInputError : ''}
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            placeholder="Ej: Solicitud de certificado"
          />
          {errors.asunto && <span id="err-pqrsf-asunto" role="alert" className={styles.fieldError}>{errors.asunto}</span>}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="pqrsf-descripcion">
          Descripción detallada
          <span className={styles.fieldRequired}>*</span>
        </label>
        <textarea
          id="pqrsf-descripcion"
          name="descripcion"
          rows={5}
          required
          aria-invalid={!!errors.descripcion}
          aria-describedby={errors.descripcion ? 'err-pqrsf-descripcion' : undefined}
          className={errors.descripcion ? styles.fieldInputError : ''}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describa con detalle su petición, queja, reclamo, sugerencia o felicitación..."
        />
        {errors.descripcion && <span id="err-pqrsf-descripcion" role="alert" className={styles.fieldError}>{errors.descripcion}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="pqrsf-adjunto">Adjunto (opcional, PDF/imagen)</label>
        <input
          id="pqrsf-adjunto"
          name="adjunto"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          aria-describedby="ayuda-pqrsf-adjunto"
          className={styles.fileInput}
          onChange={(e) => setAdjunto(e.target.files?.[0] ?? null)}
        />
        <p id="ayuda-pqrsf-adjunto" className={styles.fieldHelp}>
          Máximo 5MB. Si el adjunto no se envía, la solicitud se registrará sin archivo y podrá enviar soporte al correo institucional.
        </p>
      </div>

      <div className={styles.field}>
        <label htmlFor="pqrsf-consentimiento" className={styles.consent}>
          <input
            id="pqrsf-consentimiento"
            type="checkbox"
            required
            aria-invalid={!!errors.consentimiento}
            aria-describedby={[errors.consentimiento ? 'err-pqrsf-consentimiento' : null, 'ayuda-pqrsf-consentimiento'].filter(Boolean).join(' ')}
            checked={consentimiento}
            onChange={(e) => setConsentimiento(e.target.checked)}
          />
          <span>
            Autorizo el tratamiento de mis datos personales para la gestión de esta PQRSF, conforme a la{' '}
            <a href="/manual-convivencia" target="_blank" rel="noopener noreferrer">
              política de privacidad
            </a>{' '}
            y Ley 1581 de 2012. *
          </span>
        </label>
        {errors.consentimiento && <span id="err-pqrsf-consentimiento" role="alert" className={styles.fieldError}>{errors.consentimiento}</span>}
        <p id="ayuda-pqrsf-consentimiento" className={styles.fieldHelp}>
          Aviso de privacidad: sus datos serán usados exclusivamente para tramitar y responder su solicitud en los términos de la Ley 1755 de 2015. No serán compartidos con terceros sin autorización.
        </p>
      </div>

      <button className={styles.submit} type="submit" disabled={status === 'loading'} aria-busy={status === 'loading'}>
        {status === 'loading' && <span className={styles.loadingSpinner} />}
        {status === 'loading' ? 'Radicando…' : 'Radicar PQRSF'}
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
