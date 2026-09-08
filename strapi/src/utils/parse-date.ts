export function parseSpanishDate(str: string): string {
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
  // "4 de agosto de 2026" -> "2026-08-04"
  const parts = str.trim().toLowerCase().split(' de ');
  if (parts.length === 3) {
    const dia = parts[0].padStart(2, '0');
    const mes = meses[parts[1]] || '01';
    const ano = parts[2];
    return `${ano}-${mes}-${dia}`;
  }
  // fallback: try Date parse
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return d.toISOString().split('T')[0];
  }
  return new Date().toISOString().split('T')[0];
}
