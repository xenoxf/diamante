import { useState } from 'react';

const STRAPI_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_STRAPI_URL) ||
  'http://localhost:1337';

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
  const [captchaChecked, setCaptchaChecked] = useState(false);
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
    if (!captchaChecked) e.captcha = 'Complete la verificación anti-spam.';
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
          ? 'Denuncia recibida. Nota: los adjuntos no pudieron subirse (requiere permisos en Strapi), pero la denuncia fue registrada. Puede enviar evidencias al correo institucional indicando el radicado.'
          : 'Denuncia recibida con éxito. Se garantiza la reserva de su identidad y la confidencialidad de la información. Será evaluada por las instancias competentes.'
      );
      setDescripcion('');
      if (!anonima) {
        setNombre('');
        setEmail('');
      }
      setAdjuntos(null);
      setConsentimiento(false);
      setCaptchaChecked(false);
      setErrors({});
      const fi = document.getElementById('denuncia-adjuntos') as HTMLInputElement | null;
      if (fi) fi.value = '';
    } catch (err: any) {
      console.error('[DenunciaForm]', err);
      const m =
        err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')
          ? 'No se pudo conectar con el servidor. Verifique conexión o configuración CORS de Strapi.'
          : err?.message || 'Error al enviar la denuncia. Intente de nuevo.';
      setStatus('error');
      setMessage(m);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="form" aria-label="Formulario de denuncia por hechos de corrupción" style={{ position: 'relative' }}>
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden', opacity: 0 }}>
        <label htmlFor="denuncia-website">No diligenciar</label>
        <input id="denuncia-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <div className="field" style={{ border: '1px solid var(--line)', padding: '1rem', background: 'var(--wash)' }}>
        <label htmlFor="denuncia-anonima" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, cursor: 'pointer' }}>
          <input
            id="denuncia-anonima"
            type="checkbox"
            checked={anonima}
            onChange={(e) => setAnonima(e.target.checked)}
            aria-label="Presentar denuncia de forma anónima"
            style={{ width: '18px', height: '18px' }}
          />
          Presentar de forma anónima
        </label>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted-foreground)', margin: '0.5rem 0 0', lineHeight: 1.6 }}>
          Si marca esta opción no es necesario diligenciar nombre ni correo. Se garantiza la reserva de identidad. Si desmarca, podrá dejar datos de contacto para seguimiento.
        </p>
      </div>

      {!anonima && (
        <>
          <div className="field">
            <label htmlFor="denuncia-nombre">Nombre (opcional si no es anónima)</label>
            <input
              id="denuncia-nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              aria-label="Nombre del denunciante"
              aria-invalid={!!errors.nombre}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Opcional"
            />
            {errors.nombre && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.nombre}</span>}
          </div>

          <div className="field">
            <label htmlFor="denuncia-email">Correo electrónico (opcional)</label>
            <input
              id="denuncia-email"
              name="email"
              type="email"
              autoComplete="email"
              aria-label="Correo electrónico del denunciante"
              aria-invalid={!!errors.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Opcional para seguimiento"
            />
            {errors.email && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.email}</span>}
          </div>

          <div className="field">
            <label htmlFor="denuncia-reserva" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
              <input
                id="denuncia-reserva"
                type="checkbox"
                checked={reservaIdentidad}
                onChange={(e) => setReservaIdentidad(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
              Solicito reserva de identidad
            </label>
          </div>
        </>
      )}

      <div className="field">
        <label htmlFor="denuncia-descripcion">Descripción detallada de los hechos *</label>
        <textarea
          id="denuncia-descripcion"
          name="descripcion"
          rows={8}
          required
          aria-label="Descripción detallada de los hechos denunciados"
          aria-required="true"
          aria-invalid={!!errors.descripcion}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describa con el mayor detalle posible: qué ocurrió, cuándo, dónde, quiénes estarían involucrados, y cualquier prueba o indicio relevante..."
        />
        {errors.descripcion && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.descripcion}</span>}
        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.5 }}>
          Evite incluir datos sensibles innecesarios. No presente denuncias temerarias o falsas; pueden acarrear sanciones legales.
        </p>
      </div>

      <div className="field">
        <label htmlFor="denuncia-adjuntos">Adjuntos / evidencias (opcional, múltiple)</label>
        <input
          id="denuncia-adjuntos"
          name="adjuntos"
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xls,.xlsx,.mp4,.mp3"
          aria-label="Archivos adjuntos de la denuncia"
          onChange={(e) => setAdjuntos(e.target.files)}
        />
        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', margin: 0, lineHeight: 1.5 }}>
          Puede adjuntar documentos, imágenes o grabaciones. Máximo 5MB por archivo. Si no se cargan, la denuncia igualmente se radica y puede enviar evidencias al correo institucional.
        </p>
      </div>

      <div className="field" style={{ border: '1px solid var(--line)', padding: '0.9rem 1rem', background: 'var(--wash)', borderRadius: '6px' }}>
        <label htmlFor="denuncia-captcha" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontWeight: 600 }}>
          <input id="denuncia-captcha" type="checkbox" checked={captchaChecked} onChange={(e) => setCaptchaChecked(e.target.checked)} aria-label="Verificación anti-spam" style={{ width: '18px', height: '18px' }} />
          <span>No soy un robot (placeholder)</span>
        </label>
        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', margin: '0.4rem 0 0' }}>Placeholder para reCAPTCHA / Turnstile.</p>
        {errors.captcha && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.captcha}</span>}
      </div>

      <div className="field">
        <label htmlFor="denuncia-consentimiento" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', cursor: 'pointer', lineHeight: 1.6 }}>
          <input
            id="denuncia-consentimiento"
            type="checkbox"
            required
            checked={consentimiento}
            onChange={(e) => setConsentimiento(e.target.checked)}
            aria-label="Autorizo tratamiento de datos para denuncia"
            aria-required="true"
            style={{ marginTop: '0.3rem', width: '18px', height: '18px' }}
          />
          <span>
            Autorizo el tratamiento de mis datos (si fueron proporcionados) y declaro que la información es veraz, conforme a la{' '}
            <a href="/manual-convivencia" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>
              política de privacidad
            </a>{' '}
            y Ley 1581 de 2012. Entiendo que las denuncias temerarias pueden tener consecuencias legales. *
          </span>
        </label>
        {errors.consentimiento && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.consentimiento}</span>}
        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', margin: '0.6rem 0 0', lineHeight: 1.6 }}>
          Aviso de privacidad: la denuncia se trata con confidencialidad y reserva. Solo personal autorizado accederá a la información. Este canal no reemplaza denuncia penal ante Fiscalía General de la Nación.
        </p>
      </div>

      <button className="submit" type="submit" disabled={status === 'loading'} aria-busy={status === 'loading'} style={{ opacity: status === 'loading' ? 0.7 : 1 }}>
        {status === 'loading' ? 'Enviando…' : 'Enviar denuncia'}
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
