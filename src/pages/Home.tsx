import { NitroFormEmbed } from '../components/NitroFormEmbed';

export function Home() {
  const formId = 'form_1769170007125_viww0x8vj';

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: '#333' }}>
          Worsell Customer Demo
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>
          Get in touch with us today
        </p>
      </header>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: '#333' }}>
          Contact Us
        </h2>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '1rem' }}>
          Fill out the form below and we'll get back to you as soon as possible.
        </p>
        <NitroFormEmbed formId={formId} />
      </section>
    </div>
  );
}
