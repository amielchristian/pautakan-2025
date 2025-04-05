import { useEffect, useRef } from 'react';
import './radarView.css';
import { College } from '../types';
import React, { useState } from 'react';

function RadarView({ colleges }: { colleges: College[] }) {
  const radarBaseRef = useRef<HTMLDivElement>(null);
  const [pings, setPings] = useState<number[]>([]);
  const [booted, setBooted] = useState(false);
  // Keep track of individual college radius adjustments
  const [collegeRadiusAdjustments, setCollegeRadiusAdjustments] = useState<Record<string, number>>({});

  useEffect(() => {
    const totalBootupTime = 10 * 1000;

    // Bootup complete after timeout
    const bootupTimer = setTimeout(() => {
      setBooted(true);
    }, totalBootupTime + 200);

    return () => clearTimeout(bootupTimer);
  }, []);

  // Add a listener for college-specific radius updates
  useEffect(() => {
    // Set up event listener for when a college's score is updated
    window.ipcRenderer.on('score-updated', (_, shorthand, newScore) => {
      setCollegeRadiusAdjustments(prev => {
        const currentFactor = prev[shorthand] || 1.0;
        // Reduce by 5% each time (multiply by 0.95)
        // Allow movement all the way to the center (minimum 0.05 or 5% of original radius)
        const newFactor = Math.max(currentFactor * 0.95, 0.05);
        console.log(`College ${shorthand} radius adjustment: ${currentFactor} -> ${newFactor}`);
        return {
          ...prev,
          [shorthand]: newFactor
        };
      });
    });

    // Reset all adjustments when scores are reset
    window.ipcRenderer.on('scores-reset', () => {
      setCollegeRadiusAdjustments({});
      console.log("All college positions reset");
    });

    // Cleanup
    return () => {
      window.ipcRenderer.removeAllListeners('score-updated');
      window.ipcRenderer.removeAllListeners('scores-reset');
    };
  }, []);

  // Ping sequence using React state
  useEffect(() => {
    if (!booted) return;

    let pingId = 0;

    function createPingSequence() {
      // Original pattern: Three quick pulses followed by a pause
      setPings((p) => [...p, pingId++]);
      setTimeout(() => setPings((p) => [...p, pingId++]), 300);
      setTimeout(() => setPings((p) => [...p, pingId++]), 600);

      // Then wait before the next sequence
      setTimeout(createPingSequence, 8000);
    }

    createPingSequence();

    return () => {
      setPings([]);
    };
  }, [booted]);

  const isFinalsMode = colleges.length <= 5;
  // Base radius value 
  const baseRadius = 530;
  const parentSize = 90;
  // Number of segments
  const numSegments = 320;

  return (
    <div className='radar-container'>
      <div
        id='radarBase'
        ref={radarBaseRef}
        className={`radar-base ${isFinalsMode ? 'finals-mode' : ''}`}
      >
        {/* Radar Pings */}
        {pings.map((id) => (
          <div
            key={id}
            className='radar-ping'
            style={{ 
              animation: 'radar-ping 4s ease-out',
              border: '3px solid rgba(160, 32, 240, 0.9)' // Ensure this is set inline
            }}
            onAnimationEnd={() =>
              setPings((p) => p.filter((pingId) => pingId !== id))
            }
          />
        ))}

        <div className='center-image-wrapper'>
          {/* Logos */}
          <div id='logosContainer' className='logos-container'>
            {colleges.map((college, i) => {
              const angle = (i * 360) / colleges.length;
              const angleRad = (angle * Math.PI) / 180;
              
              // Apply individual adjustment factor for this specific college
              const adjustmentFactor = collegeRadiusAdjustments[college.shorthand] || 1.0;
              const adjustedRadius = baseRadius * adjustmentFactor;
              
              const radiusPercentage = (adjustedRadius / parentSize) * 100;
              const logoX = radiusPercentage * Math.cos(angleRad);
              const logoY = radiusPercentage * Math.sin(angleRad);
              const logosPauseDelay = 2;
              const logosStartTime = 3.5 + logosPauseDelay;

              return (
                <div
                  key={i}
                  className='logo-container'
                  style={{
                    position: 'absolute',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${logoX}%, ${logoY}%)`,
                    animation: `fadeIn 0.8s forwards ${
                      logosStartTime + i * 0.2
                    }s`,
                    transition: 'transform 0.5s ease-out' // Smooth transition when radius changes
                  }}
                >
                  <img src={college.imagePath} alt={`Logo ${i + 1}`} />
                  {/* Removed the violet underline indicator */}
                </div>
              );
            })}
          </div>

          {/* Center image */}
          <img
            src='./images/icon.png'
            alt='Center Vault'
            className='center-image'
          />

          {/* Center border container */}
          <div id='centerBorderContainer' className='center-border-container' />
        </div>

        {/* Rotating segments - fixed radius for lines */}
        <div
          id='rotatingContainer'
          className='rotating-container'
          style={{ animation: 'rotate 30s linear infinite' }}
        >
          {[...Array(numSegments)].map((_, i) => {
            const angle = (i * 360) / numSegments - 90;
            const delay = 3 + (i / numSegments) * 0.5;

            return (
              <div
                key={i}
                className='line-segment'
                style={{
                  transform: `rotate(${angle}deg) translateX(${baseRadius}px) rotate(90deg)`,
                  animation: `fadeIn 0.3s forwards ${delay}s`,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className='clock-face'></div>
    </div>
  );
}

export default RadarView;