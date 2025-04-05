import { useEffect, useRef } from 'react';
import './radarView.css';
import { College } from '../types';
import React, { useState } from 'react';

function RadarView({ colleges }: { colleges: College[] }) {
  const radarBaseRef = useRef<HTMLDivElement>(null);
  const [pings, setPings] = useState<number[]>([]);
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    const totalBootupTime = 10 * 1000;

    // Bootup complete after timeout
    const bootupTimer = setTimeout(() => {
      setBooted(true);
    }, totalBootupTime + 200);

    return () => clearTimeout(bootupTimer);
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
  // DRAMATICALLY increased radius for a much bigger circle
  const radius = 530; // Significantly increased for a much larger circle
  const parentSize = 90;
  // Increased number of segments for more dense lines on the larger circle
  const numSegments = 320; // More segments for the larger circle

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
            style={{ animation: 'radar-ping 6s ease-out' }}
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
              const radiusPercentage = (radius / parentSize) * 100;
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
                  }}
                >
                  <img src={college.imagePath} alt={`Logo ${i + 1}`} />
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

        {/* Rotating segments - increased length for bigger circle */}
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
                  transform: `rotate(${angle}deg) translateX(${radius}px) rotate(90deg)`,
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