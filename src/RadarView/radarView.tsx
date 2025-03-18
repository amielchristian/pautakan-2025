import React, { useEffect } from 'react';
import './radarView.css';
import { College } from '../types';

function RadarView({ colleges }: { colleges: College[] }) {
  useEffect(() => {
    const rotatingContainer = document.getElementById('rotatingContainer');
    const radialGridContainer = document.getElementById('radialGridContainer');
    const logosContainer = document.getElementById('logosContainer');
    const centerBorderContainer = document.getElementById(
      'centerBorderContainer'
    );
    const radarBase = document.getElementById('radarBase');

    if (
      !rotatingContainer ||
      !radialGridContainer ||
      !logosContainer ||
      !centerBorderContainer ||
      !radarBase
    )
      return;

    const numSegments = 220;
    const radius = 290;
    const bootupDuration = 0.5;
    const logosPauseDelay = 2;
    const logosStartTime = 3.5 + logosPauseDelay;
    const totalBootupTime = 10; // Total time for full radar setup before pings start

    // Creating radial lines and logos
    const collegeCount = colleges.length;
    for (let i = 0; i < collegeCount; i++) {
      const radialLine = document.createElement('div');
      radialLine.className = 'radial-line';
      let angle = i * (360 / collegeCount) - 90;
      radialLine.style.transform = `rotate(${angle}deg)`;
      radialLine.style.animationDelay = `${2.5 + i * 0.04}s`;
      radialGridContainer.appendChild(radialLine);

      angle = i * (360 / collegeCount);
      const angleRad = (angle * Math.PI) / 180;

      const logoContainer = document.createElement('div');
      logoContainer.className = 'logo-container';

      const logoImage = document.createElement('img');
      console.log(colleges[i]);
      logoImage.src = colleges[i].imagePath;
      logoImage.alt = `Logo ${i + 1}`;

      logoContainer.appendChild(logoImage);
      logoContainer.style.position = 'absolute';
      logoContainer.style.left = '50%';
      logoContainer.style.top = '50%';
      logoContainer.style.animation = `fadeIn 0.8s forwards ${
        logosStartTime + i * 0.2
      }s`;

      const parentSize = 90;
      const radiusPercentage = (radius / parentSize) * 100;

      const logoX = radiusPercentage * Math.cos(angleRad);
      const logoY = radiusPercentage * Math.sin(angleRad);

      logoContainer.style.transform = `translate(-50%, -50%) translate(${logoX}%, ${logoY}%)`;

      logosContainer.appendChild(logoContainer);
    }

    // Creating rotating segments
    for (let i = 0; i < numSegments; i++) {
      const segment = document.createElement('div');
      segment.className = 'line-segment';
      const angle = i * (360 / numSegments) - 90;
      segment.style.transform = `rotate(${angle}deg) translateX(${radius}px) rotate(90deg)`;
      segment.style.animation = `fadeIn 0.3s forwards ${
        3 + (i / numSegments) * bootupDuration
      }s`;
      rotatingContainer.appendChild(segment);
    }

    // TODO: I'm trying to make the rotating container a circle div with a dashed border instead of a div containing 220 divs

    // rotatingContainer.style.strokeWidth = '2px';
    // rotatingContainer.style.borderRadius = '50%';
    // rotatingContainer.style.width = `${radius * 2}px`;
    // rotatingContainer.style.height = `${radius * 2}px`;
    // rotatingContainer.style.borderWidth = '2px';
    // rotatingContainer.style.borderStyle = 'dashed';
    // rotatingContainer.style.strokeDasharray = `calc(2 * 3.14 * ${radius})`;
    // rotatingContainer.style.strokeDashoffset = `calc(2 * 3.14 * ${radius})`;
    // rotatingContainer.style.animation = `draw-circle ${bootupDuration}s linear 1 forwards`;

    rotatingContainer.style.animation = 'rotate 30s linear infinite';

    // **Start radar pings after boot-up time**
    setTimeout(createPatternedPings, totalBootupTime * 1000 + 200);

    // **Function to create radar pings with the pattern**
    function createPatternedPings() {
      function createPing() {
        const ping = document.createElement('div');
        ping.className = 'radar-ping';
        radarBase?.appendChild(ping);
        ping.style.animation = 'radar-ping 6s ease-out infinite';
      }

      function startPingSequence() {
        createPing(); // First ping

        setTimeout(() => {
          createPing(); // Second ping
        }, 300);

        setTimeout(() => {
          createPing(); // Third ping
        }, 600);

        // Long pause before repeating the sequence
      }

      // Start the initial sequence
      startPingSequence();
    }
  }, [colleges]);

  return (
    <div className='radar-container'>
      <div id='radarBase' className='radar-base'>
        <div id='radialGridContainer' className='radial-grid-container'></div>
        <div className='center-image-wrapper'>
          <div id='logosContainer' className='logos-container'></div>
          <img
            src='public/images/icon.png'
            alt='Center Vault'
            className='center-image'
          />
          <div
            id='centerBorderContainer'
            className='center-border-container'
          ></div>
        </div>
        <div id='rotatingContainer' className='rotating-container'></div>
      </div>
      <div className='clock-face'></div>
    </div>
  );
}

export default RadarView;
