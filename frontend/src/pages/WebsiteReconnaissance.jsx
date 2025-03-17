import React, { useState } from 'react';

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
    <div className="phishing-analyzer">
      <h1>Phishing URL Analyzer</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="url">Enter URL:</label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {threatLevel && (
        <div className="result">
          <h2>Threat Level: {threatLevel}</h2>
        </div>
      )}
    </div>
  );
};

export default PhishingAnalyzer;
