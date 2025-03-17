import React, { useState, FormEvent } from 'react';

const UIDetector: React.FC = () => {
  const [originalUrl, setOriginalUrl] = useState('');
  const [phishingUrl, setPhishingUrl] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('original_url', originalUrl);
      formData.append('phishing_url', phishingUrl);

      const response = await fetch('http://localhost:8000/compare', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Error performing comparison.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '2rem' }}>
      <h2>UI Detector</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="originalUrl">Original Website URL:</label>
          <input
            type="url"
            id="originalUrl"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="phishingUrl">Phishing Website URL:</label>
          <input
            type="url"
            id="phishingUrl"
            value={phishingUrl}
            onChange={(e) => setPhishingUrl(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', marginTop: '0.5rem' }}
          />
        </div>
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          {loading ? 'Comparing...' : 'Compare'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {result && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3>Comparison Results</h3>
          <p>
            <strong>Original URL:</strong> {result.original_url}
          </p>
          <p>
            <strong>Phishing URL:</strong> {result.phishing_url}
          </p>
          <p>
            <strong>Similarity:</strong> {result.similarity_percentage.toFixed(2)}%
          </p>
          <p>
            <strong>Message:</strong> {result.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default UIDetector;
