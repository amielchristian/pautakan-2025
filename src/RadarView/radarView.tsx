import { useEffect, useRef, useMemo } from 'react';
import './radarView.css';
import './finalsMode.css';
import { College } from '../types';
import React, { useState } from 'react';

function RadarView({ colleges }: { colleges: College[] }) {
  const radarBaseRef = useRef<HTMLDivElement>(null);
  const [pings, setPings] = useState<number[]>([]);
  const [booted, setBooted] = useState(false);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  // Keep track of individual college radius adjustments
  const [collegeRadiusAdjustments, setCollegeRadiusAdjustments] = useState<Record<string, number>>({});
  // Keep track of previous scores to determine if score is increasing or decreasing
  const [prevScores, setPrevScores] = useState<Record<string, number>>({});
  // NEW: Track which colleges should show red logos
  const [redLogoColleges, setRedLogoColleges] = useState<Record<string, boolean>>({});
  
  // Sort colleges by score to determine rankings (top 5)
  const rankedColleges = useMemo(() => {
    return [...colleges].sort((a, b) => b.score - a.score);
  }, [colleges]);

  // Get just the top 5 colleges
  const topFiveColleges = useMemo(() => {
    return rankedColleges.slice(0, 5).filter(college => college.score > 0);
  }, [rankedColleges]);
  
  // Track previous rankings to detect changes
  const [prevRankings, setPrevRankings] = useState<Record<string, number>>({});
  const [rankChangeEffects, setRankChangeEffects] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const totalBootupTime = 10 * 1000;

    // Bootup complete after timeout
    const bootupTimer = setTimeout(() => {
      setBooted(true);
    }, totalBootupTime + 200);

    return () => clearTimeout(bootupTimer);
  }, []);

  // Update previous rankings and detect changes - for ALL modes
  useEffect(() => {
    if (colleges.length > 0) {
      const newRankings: Record<string, number> = {};
      const newEffects: Record<string, boolean> = {};
      
      // Assign rankings to top 5 colleges
      rankedColleges.slice(0, 5).forEach((college, index) => {
        // Only consider colleges with scores > 0 for rankings
        if (college.score <= 0) return;
        
        const newRank = index + 1;
        const prevRank = prevRankings[college.shorthand] || 0;
        
        // Store the new rank
        newRankings[college.shorthand] = newRank;
        
        // If this isn't first render and rank changed, trigger effect
        if (prevRank !== 0 && prevRank !== newRank) {
          console.log(`Rank changed for ${college.shorthand}: ${prevRank} -> ${newRank}`);
          newEffects[college.shorthand] = true;
          
          // Clear the effect after animation completes
          setTimeout(() => {
            setRankChangeEffects(prev => ({
              ...prev,
              [college.shorthand]: false
            }));
          }, 2000);
        }
      });
      
      setPrevRankings(newRankings);
      
      // Only set effects if there are any
      if (Object.keys(newEffects).length > 0) {
        setRankChangeEffects(newEffects);
      }
    }
  }, [rankedColleges, colleges]);

  // Store prev scores on initial load
  useEffect(() => {
    const initialScores: Record<string, number> = {};
    colleges.forEach(college => {
      initialScores[college.shorthand] = college.score;
    });
    setPrevScores(initialScores);
  }, []);

  // Add a listener for college-specific radius updates
  useEffect(() => {
    // Set up event listener for when a college's score is updated
    window.ipcRenderer.on('score-updated', (_, shorthand, newScore) => {
      // Get previous score to determine if we're increasing or decreasing
      const oldScore = prevScores[shorthand] || 0;
      
      setCollegeRadiusAdjustments(prev => {
        const currentFactor = prev[shorthand] || 1.0;
        
        // If score is increasing, move toward center (reduce radius)
        // If score is decreasing, move away from center (increase radius)
        let newFactor;
        
        if (newScore > oldScore) {
          // Score increasing - move toward center
          newFactor = Math.max(currentFactor * 0.95, 0.05);
          console.log(`College ${shorthand} moving inward: ${currentFactor} -> ${newFactor}`);
        } else {
          // Score decreasing - move away from center
          // Cap at 1.0 to prevent going beyond original position
          newFactor = Math.min(currentFactor * 1.05, 1.0);
          console.log(`College ${shorthand} moving outward: ${currentFactor} -> ${newFactor}`);
        }
        
        return {
          ...prev,
          [shorthand]: newFactor
        };
      });
      
      // Update the previous score for next comparison
      setPrevScores(prev => ({
        ...prev,
        [shorthand]: newScore
      }));
      
      // NEW: Set the red logo flag for this college
      setRedLogoColleges(prev => ({
        ...prev,
        [shorthand]: true
      }));
      
      // NEW: Set a timeout to revert back to the original logo after 2 seconds
      setTimeout(() => {
        setRedLogoColleges(prev => ({
          ...prev,
          [shorthand]: false
        }));
      }, 2000);
      
      // Log rank changes
      console.log(`Score updated for ${shorthand}: ${oldScore} -> ${newScore}`);
    });

    // Reset all adjustments when scores are reset
    window.ipcRenderer.on('scores-reset', () => {
      setCollegeRadiusAdjustments({});
      // Reset previous scores too
      const resetScores: Record<string, number> = {};
      colleges.forEach(college => {
        resetScores[college.shorthand] = 0;
      });
      setPrevScores(resetScores);
      // NEW: Clear all red logo flags
      setRedLogoColleges({});
      console.log("All college positions reset");
    });

    // Cleanup
    return () => {
      window.ipcRenderer.removeAllListeners('score-updated');
      window.ipcRenderer.removeAllListeners('scores-reset');
    };
  }, [prevScores, colleges]);

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
  
  // circleRefs.current[6].style.opacity = '0.6'; SAMPLE OF HOW TO SET A RED CIRCLE VISIBLE MANUALLY

  return (
    <div className='radar-container'>
      <div
        id='radarBase'
        ref={radarBaseRef}
        className={`radar-base ${isFinalsMode ? 'finals-mode' : ''}`}
      >
      {Array.from({ length: 12 }).map((_, i) => {
        const minSize = 180;
        const gap = 75;
        const size = minSize + i * gap;
        let startTime = 7;
        const customDelays: string[] = []
        for (let i = 0; i < 12; i++) { 
          const toString = startTime + 's'
          customDelays.push(toString);
          startTime += 0.1;
        }
        return (
          <div
            key={`red-circle-${i}`}
            ref={(el) => circleRefs.current[i] = el}
            className="red-circle"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              position: 'absolute',
              top: '50%',
              left: '50%',
              border: '2px solid red', // Set initial border width
              borderRadius: '50%',
              transform: `translate(-50%, -50%)`,
              zIndex: 5,
              opacity: 0, // Initial opacity, will animate with the `pulseBorder` animation
              animation: 'pulseBorder 1s ease-in-out', // Apply the pulse animation to border-width
              animationDelay: customDelays[i], // Use custom delays from the array
            }}
          />
        );
      })}

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
              let angle = ((i * 360) / colleges.length);
              if(isFinalsMode){
                angle = angle + 54;
              }
              const angleRad = (angle * Math.PI) / 180;
              
              // Apply individual adjustment factor for this specific college
              const adjustmentFactor = isFinalsMode 
                ? 0.78  // Custom closer-in value for finals mode
                : (collegeRadiusAdjustments[college.shorthand] || 1.0);
              const adjustedRadius = baseRadius * adjustmentFactor;
              
              const radiusPercentage = (adjustedRadius / parentSize) * 100;
              const logoX = radiusPercentage * Math.cos(angleRad);
              const logoY = radiusPercentage * Math.sin(angleRad);
              const logosPauseDelay = 2;
              const logosStartTime = 1 + logosPauseDelay;

              // Get the rank of this college if it's in the top 5 (1-indexed)
              const collegeRank = topFiveColleges.findIndex(c => c.shorthand === college.shorthand) + 1;
              const isInTopFive = collegeRank > 0 && collegeRank <= 5;
              
              // NEW: Determine if this college should use the red logo
              const useRedLogo = redLogoColleges[college.shorthand] || false;
              
              // NEW: Modify the image path to use the red version if needed
              const imagePath = useRedLogo 
                ? college.imagePath.replace('.png', '-RED.png') 
                : college.imagePath;

              return (
                <div
                  key={i}
                  className={`logo-container ${isInTopFive ? 'top-five' : ''}`}
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
                  <img 
                    src={imagePath} 
                    alt={`Logo ${i + 1}`} 
                    style={{
                      transition: 'all 0.3s ease' // Smooth transition for image changes
                    }}
                  />
                  
                  {/* Add rank indicator for top 5 colleges in all modes */}
                  {isInTopFive && (
                    <div 
                      className={`rank-indicator ${rankChangeEffects[college.shorthand] ? 'rank-changed' : ''}`}
                      style={{
                        position: 'absolute',
                        top: '0px',
                        right: '10px',
                        width: '40px',
                        height: '40px',
                        opacity: 1,
                        animation: rankChangeEffects[college.shorthand] 
                          ? 'rankChangeEffect 2s ease-in-out'
                          : `fadeIn 0.8s forwards ${logosStartTime + i * 0.2 + 0.5}s`,
                        zIndex: 12
                      }}
                    >
                      <img 
                        src={`./images/ingameRanks/${collegeRank}.png`} 
                        alt={`Rank ${collegeRank}`} 
                        style={{ 
                          width: '100%', 
                          height: '100%',
                          filter: rankChangeEffects[college.shorthand] ? 'brightness(1.5) drop-shadow(0 0 10px gold)' : 'none',
                          transition: 'filter 0.3s ease-in-out'
                        }}
                      />
                    </div>
                  )}
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