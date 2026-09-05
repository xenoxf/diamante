import styles from '../styles/galeria.module.css';
import { galeria } from '../data/galeria';

export function Galeria() {
  return (
    <section id="galeria" className={styles.section} aria-labelledby="galeria-titulo">
      <div className={styles.inner}>
        <p className={styles.kicker}>Galería</p>
        <h2 id="galeria-titulo" className={styles.title}>
          Nuestra Galería
        </h2>
        <div className={styles.rule} aria-hidden="true" />
        <ul className={styles.grid}>
          {galeria.map((item) => (
            <li key={item.id}>
              <a href="/galeria" className={styles.card} aria-label={`${item.titulo} — ver álbum`}>
                <div className={styles.thumb}>
                  {/* CMS: reemplazar placeholder por <img> */}
                  <span aria-hidden="true">Fotografía</span>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{item.titulo}</h3>
                  <span className={styles.badge}>{item.categoria}</span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
