import { useState } from 'react';

const STRAPI_URL =
  (typeof import.meta !== 'undefined' && (import.meta as any).env?.PUBLIC_STRAPI_URL) ||
  'http://localhost:1337';

type Status = 'idle' | 'loading' | 'success' | 'error';

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

interface PQRSFormData {
  tipo: 'peticion' | 'queja' | 'reclamo' | 'sugerencia' | 'felicitacion';
  nombre: string;
  email: string;
  telefono?: string;
  asunto: string;
  descripcion: string;
  consentimiento: boolean;
}

export default function PQRSForm() {
  const [tipo, setTipo] = useState<'peticion' | 'queja' | 'reclamo' | 'sugerencia' | 'felicitacion'>('peticion');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [consentimiento, setConsentimiento] = useState(false);
  const [captchaChecked, setCaptchaChecked] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const tipOptions = [
    { label: 'Petición', value: 'peticion' },
    { label: 'Queja', value: 'queja' },
    { label: 'Reclamo', value: 'reclamo' },
    { label: 'Sugerencia', value: 'sugerencia' },
    { label: 'Felicitación', value: 'felicitacion' },
  ];

  const validate = () => {
    const e: Record<string, string> = {};
    if (!tipo) e.tipo = 'Seleccione el tipo de solicitud';
    if (!nombre.trim() || nombre.trim().length < 3) e.nombre = 'Ingrese su nombre completo (mínimo 3 caracteres)';
    if (!email.trim() || !validateEmail(email.trim())) e.email = 'Ingrese un correo electrónico válido';
    if (!asunto.trim() || asunto.trim().length < 3) e.asunto = 'Ingrese el asunto (mínimo 3 caracteres)';
    if (!descripcion.trim() || descripcion.trim().length < 10) e.descripcion = 'La descripción debe tener al menos 10 caracteres';
    if (!consentimiento) e.consentimiento = 'Debe aceptar el tratamiento de datos';
    if (!captchaChecked) e.captcha = 'Complete la verificación anti-spam';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (honeypot.trim() !== '') {
      setStatus('success');
      setMessage('Solicitud recibida. Nos pondremos en contacto a través de los datos proporcionados.');
      return;
    }
    if (!validate()) return;

    setStatus('loading');
    setMessage('');

    try {
      const payload: any = {
        tipo,
        nombre: nombre.trim(),
        email: email.trim(),
        asunto: asunto.trim(),
        descripcion: descripcion.trim(),
        consentimiento: true,
      };
      if (telefono.trim()) payload.telefono = telefono.trim();

      const res = await fetch(`${STRAPI_URL}/api/solicitudes-pqrsf`, {
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
      setMessage('Solicitud PQRSF recibida con éxito. Recibirá respuesta en el correo electrónico proporcionado.');
      setTipo('peticion');
      setNombre('');
      setEmail('');
      setTelefono('');
      setAsunto('');
      setDescripcion('');
      setConsentimiento(false);
      setCaptchaChecked(false);
      setErrors({});
      const fi = document.getElementById('pqrsf-asunto') as HTMLInputElement | null;
      if (fi) fi.value = '';
    } catch (err: any) {
      console.error('[PQRSForm]', err);
      const m =
        err?.message?.includes('Failed to fetch') || err?.message?.includes('NetworkError')
          ? 'No se pudo conectar con el servidor. Verifique conexión o configuración CORS de Strapi.'
          : err?.message || 'Error al enviar la solicitud PQRSF. Intente de nuevo.';
      setStatus('error');
      setMessage(m);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="form" aria-label="Formulario PQRSF">
      <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', overflow: 'hidden', opacity: 0 }}>
        <label htmlFor="pqrsf-website">No diligenciar</label>
        <input id="pqrsf-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <div className="field">
        <label>Tipo de solicitud *</label>
        <select
          id="pqrsf-tipo"
          value={tipo}
          onChange={(e) => setTipo(e.target.value as any)}
          aria-label="Tipo de solicitud PQRSF"
          required
        >
          {tipOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {errors.tipo && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.tipo}</span>}
      </div>

      <div className="field">
        <label>Nombre completo *</label>
        <input
          id="pqrsf-nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          aria-label="Nombre completo"
          aria-invalid={!!errors.nombre}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej: Juan Pérez"
        />
        {errors.nombre && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.nombre}</span>}
      </div>

      <div className="field">
        <label>Correo electrónico *</label>
        <input
          id="pqrsf-email"
          name="email"
          type="email"
          autoComplete="email"
          aria-label="Correo electrónico"
          aria-invalid={!!errors.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Ej: juan.perez@email.com"
        />
        {errors.email && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.email}</span>}
      </div>

      <div className="field">
        <label>Teléfono (opcional)</label>
        <input
          id="pqrsf-telefono"
          name="telefono"
          type="tel"
          autoComplete="tel"
          aria-label="Teléfono de contacto"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="Ej: 602 426 0678"
        />
      </div>

      <div className="field">
        <label>Asunto *</label>
        <input
          id="pqrsf-asunto"
          name="asunto"
          type="text"
          autoComplete="text"
          aria-label="Asunto de la solicitud"
          aria-invalid={!!errors.asunto}
          value={asunto}
          onChange={(e) => setAsunto(e.target.value)}
          placeholder="Ej: Solicitud de información académica"
        />
        {errors.asunto && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.asunto}</span>}
      </div>

      <div className="field">
        <label>Descripción detallada *</label>
        <textarea
          id="pqrsf-descripcion"
          name="descripcion"
          rows={5}
          aria-label="Descripción de la solicitud PQRSF"
          aria-required="true"
          aria-invalid={!!errors.descripcion}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Describa su solicitud, queja, reclamo o felicitación con el mayor detalle posible"
        />
        {errors.descripcion && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.descripcion}</span>}
      </div>

      <div className="field">
        <label>
          <input
            type="checkbox"
            checked={consentimiento}
            onChange={(e) => setConsentimiento(e.target.checked)}
            aria-label="Autorizo tratamiento de datos"
            aria-required="true"
            style={{ marginTop: '0.3rem', width: '18px', height: '18px' }}
          />
          <span>
            Autorizo el tratamiento de mis datos y declaro que la información es veraz, conforme a la ley
            <a href="/manual-convivencia" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-dark)', textDecoration: 'underline' }}>
              y la política de privacidad
            </a>.
          </span>
        </label>
        {errors.consentimiento && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.consentimiento}</span>}
      </div>

      <div className="field">
        <label>
          <input
            id="pqrsf-captcha"
            type="checkbox"
            checked={captchaChecked}
            onChange={(e) => setCaptchaChecked(e.target.checked)}
            aria-label="Verificación anti-spam"
            style={{ width: '18px', height: '18px' }}
          />
          <span>No soy un robot (placeholder)</span>
        </label>
        <p style={{ fontSize: '0.78rem', color: 'var(--muted-foreground)', margin: '0.4rem 0 0' }}>Placeholder para reCAPTCHA / Turnstile.</p>
        {errors.captcha && <span role="alert" style={{ color: 'var(--destructive)', fontSize: '0.85rem' }}>{errors.captcha}</span>}
      </div>

      <button className="submit" type="submit" disabled={status === 'loading'} aria-busy={status === 'loading'} style={{ opacity: status === 'loading' ? 0.7 : 1 }}>
        {status === 'loading' ? 'Enviando…' : 'Enviar solicitud'}
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