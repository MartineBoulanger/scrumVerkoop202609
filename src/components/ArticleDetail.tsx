import { useState } from 'react';
import { api } from '../lib/api';
export function ArticleDetail({
  article,
  onBack,
  refresh,
}: {
  article: any;
  onBack: () => void;
  refresh: () => Promise<void>;
}) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  async function save(a: any) {
    try {
      await api(`/articles/${a.id}`, 'PUT', a);
      await refresh();
      setError('');
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  }
  return (
    <div className='page-shell'>
      <button className='back-button' onClick={onBack}>
        ← Terug naar artikelen
      </button>
      <p className='eyebrow'>Artikeldetail · {article.id}</p>
      <h1 className='page-title'>{article.name}</h1>
      {error && (
        <p role='alert' className='error-notice'>
          {error}
        </p>
      )}
      {article && (
        <>
          <section className='detail-card module-section'>
            <h2>Artikelgegevens</h2>
            <div className='fact-grid'>
              <div>
                <label>Categorie</label>
                <p>{article.category}</p>
              </div>
              <div>
                <label>Leverancier</label>
                <p>{article.supplier}</p>
              </div>
            </div>
          </section>
          <div className='detail-grid'>
            <section className='detail-card module-section'>
              <h2>Reviews</h2>
              {!article.reviews.length && <p>Geen reviews voor dit artikel.</p>}
              {article.reviews.map((r: any) => (
                <div className='review-row' key={r.id}>
                  <strong>
                    {r.author} · {r.rating}/5
                  </strong>
                  <p>{r.text}</p>
                  <button
                    className='action-button danger-button'
                    onClick={() => {
                      if (window.confirm('Deze review als spam verwijderen?'))
                        save({
                          ...article,
                          reviews: article.reviews.filter(
                            (x: any) => x.id !== r.id,
                          ),
                        });
                    }}
                  >
                    Spam verwijderen
                  </button>
                </div>
              ))}
            </section>
            <section className='detail-card module-section'>
              <h2>Veelgestelde vragen</h2>
              {!article.faqs.length && <p>Nog geen vragen.</p>}
              {article.faqs.map((f: any) => (
                <div className='faq-entry' key={f.id}>
                  <h3>{f.question}</h3>
                  <p>{f.answer}</p>
                </div>
              ))}
              <form
                className='module-form'
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (
                    await save({
                      ...article,
                      faqs: [
                        ...article.faqs,
                        {
                          id: crypto.randomUUID(),
                          question: question.trim(),
                          answer: answer.trim(),
                        },
                      ],
                    })
                  ) {
                    setQuestion('');
                    setAnswer('');
                  }
                }}
              >
                <label>
                  Vraag
                  <input
                    required
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                  />
                </label>
                <label>
                  Antwoord
                  <textarea
                    required
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                  />
                </label>
                <button
                  className='action-button'
                  disabled={!question.trim() || !answer.trim()}
                >
                  Vraag en antwoord toevoegen
                </button>
              </form>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
