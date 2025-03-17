import React, { useState } from 'react';
import './styles/PhishingAnalyzer.css';

const PhishingAnalyzer = () => {
  const [url, setUrl] = useState('');
  const [threatLevel, setThreatLevel] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setThreatLevel(null);

    try {
      const response = await fetch('http://localhost:8000/analyze/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setThreatLevel(data.threat_level);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="phishing-analyzer">
      <h1 id="analyzer-title">Phishing URL Analyzer</h1>
      <form id="analyzer-form" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="url-input" className="analyzer-label">Enter URL:</label>
          <input
            type="text"
            id="url-input"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <button
          id="analyze-btn"
          type="submit"
          disabled={loading}
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
      {error && <p id="error-message">{error}</p>}
      {threatLevel && (
        <div id="result-container">
          <h2 id="result-text">Threat Level: {threatLevel}</h2>
        </div>
      )}
    </div>
  );
};

export default PhishingAnalyzer;
