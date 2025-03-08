import './App.css';
import { useState, useEffect } from 'react';

function ControlView() {
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadColleges();

    const unsubscribeScoreUpdated = window.Electron.onScoreUpdated(
      (shortHand, newScore) => {
        setColleges((prevColleges) => {
          const updatedColleges = prevColleges.map((college) =>
            college.shortHand === shortHand
              ? { ...college, score: newScore }
              : college
          );
          return updatedColleges.sort((a, b) => b.score - a.score);
        });
      }
    );

    const unsubscribeScoresReset = Electron.onScoresReset(() => {
      loadColleges();
    });

    return () => {
      unsubscribeScoreUpdated();
      unsubscribeScoresReset();
    };
  }, []);

  const loadColleges = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await window.electronAPI.getAllColleges();
      setColleges(data.sort((a, b) => b.score - a.score));
    } catch (err) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleScoreUpdate = async (shortHand, value) => {
    try {
      await window.electronAPI.incrementScore(shortHand, value);
    } catch (error) {
      alert(`Failed to update score: ${error.message || 'Unknown error'}`);
    }
  };

  const handleResetScores = async () => {
    if (window.confirm('Are you sure you want to reset all scores to zero?')) {
      try {
        await window.electronAPI.resetScores();
      } catch (error) {
        alert(`Failed to reset scores: ${error.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div>
      <header>
        <h1>Pautakan 2025 Control Panel</h1>
        <div className='actions'>
          <button onClick={loadColleges}>Refresh Data</button>
          <button onClick={handleResetScores}>Reset All Scores</button>
        </div>
      </header>
      <main>
        <div className='college-grid'>
          {loading ? (
            <div className='loading'>Loading colleges...</div>
          ) : error ? (
            <div className='error'>Failed to load colleges: {error}</div>
          ) : (
            colleges.map((college) => (
              <div key={college.shortHand} className='college-card'>
                <div className='college-header'>
                  <img
                    src={college.imagePath}
                    alt={college.name}
                    className='college-logo'
                  />
                  <div className='college-info'>
                    <h3>{college.name}</h3>
                    <div className='college-shorthand'>{college.shortHand}</div>
                  </div>
                </div>
                <div
                  className='college-score'
                  data-shorthand={college.shortHand}
                >
                  {college.score}
                </div>
                <div className='score-controls'>
                  <div className='score-btn-group'>
                    <button
                      onClick={() => handleScoreUpdate(college.shortHand, -5)}
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleScoreUpdate(college.shortHand, -1)}
                    >
                      -1
                    </button>
                  </div>
                  <div className='score-btn-group'>
                    <button
                      onClick={() => handleScoreUpdate(college.shortHand, 1)}
                    >
                      +1
                    </button>
                    <button
                      onClick={() => handleScoreUpdate(college.shortHand, 5)}
                    >
                      +5
                    </button>
                    <button
                      onClick={() => handleScoreUpdate(college.shortHand, 10)}
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

export default ControlView;
