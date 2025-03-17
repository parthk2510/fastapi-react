import React, { useState } from 'react';
import './styles/CloneDetection.css';

const CloneDetection = () => {
  const [originalURL, setOriginalURL] = useState('');
  const [copyURL, setCopyURL] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Use the new unified endpoint
      const formData = new FormData();
      formData.append('original_url', originalURL);
      formData.append('phishing_url', copyURL);

      const response = await fetch('http://localhost:8000/compare', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || `Request failed with status ${response.status}`);
        } catch (jsonError) {
          throw new Error(`Request failed with status ${response.status}: ${errorText}`);
        }
      }
      
      const data = await response.json();
      setResult(data);
      console.log("Success: ", data);
    } catch (err) {
      console.error("Error:", err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="clone-detection-container">
      <h2 className="clone-heading">🕵️‍♂️ Clone Detection Tool</h2>
      <p className="clone-description">
        Enter the URLs of the original and suspected copy for similarity analysis.
      </p>

      <form onSubmit={handleSubmit} className="clone-form">
        <div className="input-group">
          <label htmlFor="original" className="input-label">
            Original Webpage URL:
          </label>
          <input
            type="url"
            id="original"
            value={originalURL}
            onChange={(e) => setOriginalURL(e.target.value)}
            placeholder="https://example.com"
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="copy" className="input-label">
            Suspected Copy URL:
          </label>
          <input
            type="url"
            id="copy"
            value={copyURL}
            onChange={(e) => setCopyURL(e.target.value)}
            placeholder="https://suspicious-site.com"
            required
          />
        </div>

        <button type="submit" className="clone-submit-btn" disabled={loading}>
          {loading ? 'Analyzing...' : '🔍 Detect Similarity'}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}
      {result && (
        <div className="result-container">
          <h3>🔍 Similarity Analysis Results</h3>
          <div className="result-card">
            <div className="result-detail">
              <span className="result-label">Similarity:</span>
              <span className={`similarity-badge ${result.similarity_percentage > 85 ? 'high' : 'low'}`}>
                {result.similarity_percentage.toFixed(2)}%
              </span>
            </div>
            {result.is_potential_clone && (
              <div className="warning-message">
                ⚠️ Warning: High similarity detected! This may be a cloned website.
              </div>
            )}
            <div className="result-message">
              <p>{result.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CloneDetection;