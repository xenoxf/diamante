import { useState } from 'react';

const STRAPI_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_STRAPI_URL) ||
  'http://localhost:1337';

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
  const [captchaChecked, setCaptchaChecked] = useState(false);
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
    if (!captchaChecked) e.captcha = 'Complete la verificación anti-spam.';
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
        // 403 si public no tiene permiso upload, no es bloqueante
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
          ? 'Solicitud radicada correctamente. Nota: el archivo adjunto no pudo subirse (requiere permisos de Strapi), pero su solicitud fue registrada sin adjunto.'
          : 'Solicitud PQRSF radicada correctamente. Recibirá respuesta en los términos establecidos por la ley (Ley 1755 de 2015).'
      );
      // reset
      setNombre('');
      setEmail('');
      setTelefono('');
      setAsunto('');
      setDescripcion('');
      setAdjunto(null);
      setConsentimiento(false);
      setCaptchaChecked(false);
      setErrors({});
      // reset file input value via DOM
      const fileInput = document.getElementById('pqrsf-adjunto') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
    } catch (err: any) {
      console.error('[PqrsfForm]', err);
      const m =
        err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')
          ? 'No se pudo conectar con el servidor. Verifique conexión o CORS de Strapi (http://localhost:1337).'
          : err?.message || 'Error al radicar la solicitud. Intente de nuevo.';
      setStatus('error');
      setMessage(m);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="form" aria-label="Formulario PQRSF" style={{ position: 'relative' }}>
      {/* Honeypot */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden', opacity: 0 }}>
        <label htmlFor="pqrsf-website">No diligenciar</label>
        <input id="pqrsf-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <div className="field">
        <label htmlFor="pqrsf-tipo">Tipo de solicitud *</label>
        <select
          id="pqrsf-tipo"
          name="tipo"
          required
          aria-label="Tipo de solicitud PQRSF"
          aria-required="true"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as TipoPqrsf)}
          style={{ font: 'inherit', padding: '0.7rem 0.8rem', border: '1px solid var(--line-faint)', background: 'var(--surface)', color: 'var(--ink)' }}
        >
          <option value="peticion">Petición</option>
          <option value="queja">Queja</option>
          <option value="reclamo">Reclamo</option>
          <option value="sugerencia">Sugerencia</option>
          <option value="felicitacion">Felicitación</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="pqrsf-nombre">Nombre completo *</label>
        <input
          id="pqrsf-nombre"
          name="nombre"
          type="text"
          required
          autoComplete="name"
          aria-label="Nombre completo"
          aria-required="true"
          aria-invalid={!!errors.nombre}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Carlos Gómez"
        />
        {errors.nombre && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.nombre}</span>}
      </div>

      <div className="field">
        <label htmlFor="pqrsf-email">Correo electrónico *</label>
        <input
          id="pqrsf-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-label="Correo electrónico"
          aria-required="true"
          aria-invalid={!!errors.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@correo.com"
        />
        {errors.email && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.email}</span>}
      </div>

      <div className="field">
        <label htmlFor="pqrsf-telefono">Teléfono (opcional)</label>
        <input
          id="pqrsf-telefono"
          name="telefono"
          type="tel"
          autoComplete="tel"
          aria-label="Teléfono"
          aria-invalid={!!errors.telefono}
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Ej: 302 123 4567"
        />
        {errors.telefono && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.telefono}</span>}
      </div>

      <div className="field">
        <label htmlFor="pqrsf-asunto">Asunto *</label>
        <input
          id="pqrsf-asunto"
          name="asunto"
          type="text"
          required
          autoComplete="off"
          aria-label="Asunto"
          aria-required="true"
          aria-invalid={!!errors.asunto}
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Ej: Solicitud de certificado"
        />
        {errors.asunto && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.asunto}</span>}
      </div>

      <div className="field">
        <label htmlFor="pqrsf-descripcion">Descripción detallada *</label>
        <textarea
          id="pqrsf-descripcion"
          name="descripcion"
          rows={6}
          required
          aria-label="Descripción detallada de la solicitud"
          aria-required="true"
          aria-invalid={!!errors.descripcion}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describa con detalle su petición, queja, reclamo, sugerencia o felicitación..."
        />
        {errors.descripcion && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.descripcion}</span>}
      </div>

      <div className="field">
        <label htmlFor="pqrsf-adjunto">Adjunto (opcional, PDF/imagen)</label>
        <input
          id="pqrsf-adjunto"
          name="adjunto"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
          aria-label="Archivo adjunto"
          onChange={(e) => setAdjunto(e.target.files?.[0] ?? null)}
        />
        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.5 }}>
          Máximo 5MB. Si el adjunto no se envía, la solicitud se registrará sin archivo y podrá enviar soporte al correo institucional.
        </p>
      </div>

      <div className="field" style={{ border: '1px solid var(--line)', padding: '0.9rem 1rem', background: 'var(--wash)', borderRadius: '6px' }}>
        <label htmlFor="pqrsf-captcha" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600 }}>
          <input id="pqrsf-captcha" type="checkbox" checked={captchaChecked} onChange={(e) => setCaptchaChecked(e.target.checked)} aria-label="Verificación anti-spam" style={{ width: '18px', height: '18px' }} />
          <span>No soy un robot (placeholder)</span>
        </label>
        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', margin: '0.4rem 0 0' }}>Placeholder: integrar reCAPTCHA / Turnstile en producción.</p>
        {errors.captcha && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.captcha}</span>}
      </div>

      <div className="field">
        <label htmlFor="pqrsf-consentimiento" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', lineHeight: 1.6 }}>
          <input
            id="pqrsf-consentimiento"
            type="checkbox"
            required
            checked={consentimiento}
            onChange={(e) => setConsentimiento(e.target.checked)}
            aria-label="Autorizo tratamiento de datos para PQRSF"
            aria-required="true"
            style={{ marginTop: '0.3rem', width: '18px', height: '18px' }}
          />
          <span>
            Autorizo el tratamiento de mis datos personales para la gestión de esta PQRSF, conforme a la{' '}
            <a href="/manual-convivencia" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>
              política de privacidad
            </a>{' '}
            y Ley 1581 de 2012. *
          </span>
        </label>
        {errors.consentimiento && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.consentimiento}</span>}
        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', margin: '0.6rem 0 0', lineHeight: 1.6 }}>
          Aviso de privacidad: sus datos serán usados exclusivamente para tramitar y responder su solicitud en los términos de la Ley 1755 de 2015. No serán compartidos con terceros sin autorización.
        </p>
      </div>

      <button className="submit" type="submit" disabled={status === 'loading'} aria-busy={status === 'loading'} style={{ opacity: status === 'loading' ? 0.7 : 1 }}>
        {status === 'loading' ? 'Radicando…' : 'Radicar PQRSF'}
      </button>

      {message && (
        <div
          role={status === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          style={{
            padding: '0.9rem 1rem',
            border: `1px solid ${status === 'success' ? 'var(--primary)' : 'var(--destructive)'}`,
            background: status === 'success' ? 'var(--primary-wash)' : '#fef2f2',
            color: status === 'error' ? 'var(--destructive)' : 'var(--ink)',
            lineHeight: 1.6,
            fontSize: '0.92rem',
          }}
        >
          {message}
        </div>
      )}
    </form>
  );
}
