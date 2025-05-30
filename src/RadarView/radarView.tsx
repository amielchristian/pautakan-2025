import { useEffect, useRef, useMemo } from 'react';
import './radarView.css';
import './finalsMode.css';
import { College } from '../types';
import { useState } from 'react';
import { IpcRendererEvent } from 'electron';

function RadarView({
  colleges,
  collegeRadiusAdjustments,
  setCollegeRadiusAdjustments,
  circleRefs,
  activeRing,
  setActiveRing,
  smallestRingValue,
  setSmallestRingValue,
  prevScores,
  setPrevScores,
  onBoot,
  clincherColleges,
}: {
  colleges: College[];
  collegeRadiusAdjustments: Record<string, number>;
  setCollegeRadiusAdjustments: React.Dispatch<
    React.SetStateAction<Record<string, number>>
  >;
  circleRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  activeRing: number;
  setActiveRing: React.Dispatch<React.SetStateAction<number>>;
  smallestRingValue: number;
  setSmallestRingValue: React.Dispatch<React.SetStateAction<number>>;
  prevScores: Record<string, number>;
  setPrevScores: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  onBoot: (booted: boolean) => void;
  clincherColleges: College[];
}) {
  const [scaleFactor, setScaleFactor] = useState(1);
  const radarBaseRef = useRef<HTMLDivElement>(null);
  const [pings, setPings] = useState<number[]>([]);
  const [booted, setBooted] = useState(false);
  // Keep track of individual college radius adjustments
  // Keep track of previous scores to determine if score is increasing or decreasing
  // Track which colleges should show red logos with opacity for fading
  const [redLogoOpacity, setRedLogoOpacity] = useState<Record<string, number>>(
    {}
  );
  
  // Track if rank indicators have already been animated to avoid re-triggering
  const [rankIndicatorsAnimated, setRankIndicatorsAnimated] = useState(false);
  const isClincherMode = clincherColleges.length > 0;

  // Helper function to determine if a college is in clincher mode
  const isInClincherMode = (college: College) => {
    if (!isClincherMode) return true; // If not in clincher mode, all colleges are shown normally
    return clincherColleges.some(c => c.id === college.id);
  };

  useEffect(() => {
    onBoot(booted);
  }, [booted, onBoot]);

  useEffect(() => {
    function updateScale() {
      const scaleW = window.innerWidth / 1920;
      const scaleH = window.innerHeight / 1080;
      setScaleFactor(Math.min(scaleW, scaleH)); // Maintain aspect ratio
    }

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Sort colleges by score to determine rankings (top 5)
  const rankedColleges = useMemo(() => {
    return [...colleges].sort((a, b) => b.score - a.score);
  }, [colleges]);

  // Track previous rankings to detect changes - use a stable reference
  const prevRankingsRef = useRef<Record<string, number>>({});
  // Instead of state, use a ref for tracking rank change effects to avoid re-renders
  const rankChangeEffectsRef = useRef<Record<string, boolean>>({});

  // Initialize bootup sequence - this should only run once
  useEffect(() => {
    const totalBootupTime = 10 * 1000;

    // Bootup complete after timeout
    const bootupTimer = setTimeout(() => {
      setBooted(true);
      // Set rank indicators as animated after bootup
      setTimeout(() => {
        setRankIndicatorsAnimated(true);
      }, 2000); // Wait for initial animations to complete
    }, totalBootupTime + 200);

    return () => clearTimeout(bootupTimer);
  }, []); // Empty dependency array ensures this only runs once

  // Store initial scores - only run once on component mount
  useEffect(() => {
    if (colleges.length > 0) {
      const initialScores: Record<string, number> = {};
      colleges.forEach((college) => {
        initialScores[college.shorthand] = college.score;
      });
      setPrevScores(initialScores);
    }
  }, []); // Empty dependency array ensures this only runs once

  // Update previous rankings and detect changes - use a stable dependency list and refs
  useEffect(() => {
    if (colleges.length > 0 && booted) {
      const newRankings: Record<string, number> = {};
      const newEffects: Record<string, boolean> = {};

      // Assign rankings to top 5 colleges
      rankedColleges.slice(0, 5).forEach((college, index) => {
        // Only consider colleges with scores > 0 for rankings
        if (college.score <= 0) return;

        const newRank = index + 1;
        const prevRank = prevRankingsRef.current[college.shorthand] || 0;

        // Store the new rank
        newRankings[college.shorthand] = newRank;

        // If this isn't first render and rank changed, trigger effect
        if (prevRank !== 0 && prevRank !== newRank) {
          console.log(
            `Rank changed for ${college.shorthand}: ${prevRank} -> ${newRank}`
          );
          newEffects[college.shorthand] = true;
        }
      });

      // Only update if rankings have changed
      if (JSON.stringify(newRankings) !== JSON.stringify(prevRankingsRef.current)) {
        prevRankingsRef.current = newRankings;

        // Only set effects if there are any
        if (Object.keys(newEffects).length > 0) {
          rankChangeEffectsRef.current = newEffects;

          // Clear rank change effects after animation completes
          Object.keys(newEffects).forEach((shorthand) => {
            setTimeout(() => {
              rankChangeEffectsRef.current = {
                ...rankChangeEffectsRef.current,
                [shorthand]: false,
              };
            }, 2000);
          });
        }
      }
    }
  }, [rankedColleges, booted]); // Only depend on rankedColleges and booted state

  // Setup event listeners for score updates and resets
  useEffect(() => {
    // Set up event listener for when a college's score is updated
    const handleScoreUpdate = (
      _: IpcRendererEvent,
      shorthand: string,
      newScore: number
    ) => {
      // Get previous score to determine if we're increasing or decreasing
      const oldScore = prevScores[shorthand] || 0;
      console.log('PREVIOUS SCORE IS:', prevScores[shorthand]);

      setCollegeRadiusAdjustments((prev) => {
        console.log(
          'CURRENT COLLEGE RADIUS ADJUSTMENT',
          collegeRadiusAdjustments
        );
        const currentFactor = isFinalsMode
          ? prev[shorthand] || 0.78
          : prev[shorthand] || 1.0;
        console.log('COLLEGE SHORTHAND IS: ', shorthand);
        // If score is increasing, move toward center (reduce radius)
        // If score is decreasing, move away from center (increase radius)
        let newFactor;
        const ringToUse = activeRing;
        console.log('RING TO USE IS', ringToUse);

        if (newScore > oldScore) {
          // Score increasing - move toward center
          if (isFinalsMode) {
            newFactor = isClincherMode ? currentFactor - 0.093 : currentFactor - 0.046;
          } else {
            newFactor = isClincherMode ? currentFactor - 0.091 : currentFactor - 0.046;
          }
          if (ringToUse != -1 && newFactor < smallestRingValue) {
            circleRefs.current[ringToUse]!.style.transition =
              'opacity 0.5s ease';
            circleRefs.current[ringToUse]!.style.opacity = '1';
            setActiveRing(ringToUse - 1);
            setSmallestRingValue(newFactor);
          } else if (ringToUse >= -1 && newFactor >= smallestRingValue) {
            console.log('placeholder');
          } else {
            newFactor = currentFactor;
          }
        } else {
          // Score decreasing - move away from center
          // Cap at 1.0 to prevent going beyond original position
          if (isFinalsMode){
            newFactor = isClincherMode ? currentFactor + 0.093 : currentFactor + 0.046;
          } else {
            newFactor = isClincherMode ? currentFactor + 0.091 : currentFactor + 0.046;
          }
          
          const ringToHide = ringToUse + 1;
          const lastRing = isClincherMode ? 6 : 12
          const isSharedFactor = Object.entries(prev).some(([key, value]) => {
            return key !== shorthand && value === currentFactor;
          });
          console.log('IS SHARED FACTOR', isSharedFactor);
          if (
            ringToHide != lastRing &&
            currentFactor == smallestRingValue &&
            !isSharedFactor
          ) {
            circleRefs.current[ringToHide]!.style.transition =
              'opacity 0.5s ease';
            circleRefs.current[ringToHide]!.style.opacity = '0';
            setActiveRing(ringToHide);
            setSmallestRingValue(newFactor);
          } else if (ringToHide != lastRing && newFactor <= 1) {
            console.log('placeholder');
          } else {
            newFactor = currentFactor;
          }
        }

        console.log('SMALLEST RING VALUE IS', smallestRingValue);
        console.log('NEW FACTOR IS:', newFactor);

        return {
          ...prev,
          [shorthand]: newFactor,
        };
      });

      // Update the previous score for next comparison
      setPrevScores((prev) => ({
        ...prev,
        [shorthand]: newScore,
      }));

      // Fade in the red logo by setting opacity to 1
      setRedLogoOpacity((prev) => ({
        ...prev,
        [shorthand]: 1,
      }));

      // Create a smooth fade-out effect
      const fadeOutDuration = 2000; // 2 seconds total
      const fadeSteps = 20;
      const stepTime = fadeOutDuration / fadeSteps;

      // Start fading out after a small delay to ensure full visibility first
      setTimeout(() => {
        let step = 0;
        const fadeInterval = setInterval(() => {
          step++;
          setRedLogoOpacity((prev) => {
            // Calculate new opacity - gradually decreasing
            const newOpacity = 1 - step / fadeSteps;

            // Stop the interval when done fading
            if (step >= fadeSteps) {
              clearInterval(fadeInterval);
              return {
                ...prev,
                [shorthand]: 0,
              };
            }

            return {
              ...prev,
              [shorthand]: newOpacity,
            };
          });
        }, stepTime);
      }, 500); // Short delay before starting fade out

      // Log rank changes
      console.log(`Score updated for ${shorthand}: ${oldScore} -> ${newScore}`);
    };

    // Reset all adjustments when scores are reset
    const handleScoresReset = () => {
      setCollegeRadiusAdjustments({});
      // Reset previous scores too
      const resetScores: Record<string, number> = {};
      colleges.forEach((college) => {
        resetScores[college.shorthand] = 0;
      });
      setPrevScores(resetScores);
      // Clear all red logo opacities
      setRedLogoOpacity({});
      // Reset rank indicators ref
      prevRankingsRef.current = {};
      rankChangeEffectsRef.current = {};
      console.log('All college positions reset');
    };

    // Register event listeners
    window.ipcRenderer.on('score-updated', handleScoreUpdate);
    window.ipcRenderer.on('scores-reset', handleScoresReset);

    // Cleanup
    return () => {
      window.ipcRenderer.removeAllListeners('score-updated');
      window.ipcRenderer.removeAllListeners('scores-reset');
    };
  }, [
    prevScores,
    colleges,
    setActiveRing,
    activeRing,
    smallestRingValue,
    circleRefs,
    setSmallestRingValue,
    setCollegeRadiusAdjustments,
  ]); // Include dependencies but be cautious of constantly changing values

  // Ping sequence using React state - only run when booted changes
  useEffect(() => {
    if (!booted) return;

    let pingId = 0;
    let pingTimeout: NodeJS.Timeout;

    function createPingSequence() {
      // Original pattern: Three quick pulses followed by a pause
      setPings((p) => [...p, pingId++]);

      const timeout1 = setTimeout(() => setPings((p) => [...p, pingId++]), 300);
      const timeout2 = setTimeout(() => setPings((p) => [...p, pingId++]), 600);

      // Then wait before the next sequence
      pingTimeout = setTimeout(createPingSequence, 8000);

      return () => {
        clearTimeout(timeout1);
        clearTimeout(timeout2);
        clearTimeout(pingTimeout);
      };
    }

    const cleanup = createPingSequence();

    return () => {
      cleanup();
      setPings([]);
    };
  }, [booted]); // Only depend on booted state

  const isFinalsMode = colleges.length <= 5;
  // Base radius value
  const baseRadius = 430;
  const parentSize = 90;
  // Number of segments
  const numSegments = 320;
  const ringsToCreate = isClincherMode ? 6 : 12;

  return (
    <div
      className='radar-wrapper'
      style={{ transform: `scale(${scaleFactor})` }}
    >
      <div className='radar-container'>
        <div
          id='radarBase'
          ref={radarBaseRef}
          className={`radar-base ${isFinalsMode ? 'finals-mode' : ''}`}
        >
          {Array.from({ length: ringsToCreate }).map((_, i) => {
            const minSize = isFinalsMode ? 260 : 400;
            let gap
            if (isClincherMode){
              gap = isFinalsMode ? 100 : 80;
            } else {
              gap = isFinalsMode ? 50.5 : 38.5;
            }
            
            const size = minSize + i * gap;
            let startTime = 7;
            const customDelays: string[] = [];
            for (let i = 0; i < 12; i++) {
              const toString = startTime + 's';
              customDelays.push(toString);
              startTime += 0.1;
            }
            return (
              <div
                key={`red-circle-${i}`}
                ref={(el) => (circleRefs.current[i] = el)}
                className='white-circle'
                style={{
                  width: `${size}px`,
                  height: `${size}px`,
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  border: '0.1px solid rgba(255, 255, 255, 0.60)', // Set initial border width
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
                border: '3px solid rgba(160, 32, 240, 0.9)', // Ensure this is set inline
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
                let angle = (i * 360) / colleges.length;
                if (isFinalsMode) {
                  angle = angle + 54;
                }
                const angleRad = (angle * Math.PI) / 180;

                // Apply individual adjustment factor for this specific college
                const adjustmentFactor = isFinalsMode
                  ? collegeRadiusAdjustments[college.shorthand] || 0.78 // Custom closer-in value for finals mode
                  : collegeRadiusAdjustments[college.shorthand] || 1.0;
                const adjustedRadius = baseRadius * adjustmentFactor;

                const radiusPercentage = (adjustedRadius / parentSize) * 100;
                const logoX = radiusPercentage * Math.cos(angleRad);
                const logoY = radiusPercentage * Math.sin(angleRad);
                const logosPauseDelay = 2;
                const logosStartTime = 1 + logosPauseDelay;

                // Get the rank of this college if it's in the top 5 (1-indexed)
                const collegeRank =
                  rankedColleges.findIndex(
                    (c) => c.shorthand === college.shorthand
                  ) + 1;
                const isInTopFive = collegeRank > 0 && collegeRank <= 5;

                // Get the red logo opacity for this college (0 to 1)
                const redOpacity = redLogoOpacity[college.shorthand] || 0;

                // Regular image path and red image path
                const regularImagePath = college.imagePath;
                const redImagePath = college.imagePath.replace(
                  '.png',
                  '_RED.png'
                );

                // Check if this college has a rank change effect active
                const hasRankChangeEffect = rankChangeEffectsRef.current[college.shorthand];
                
                // Check if college is in clincher mode
                const isInClincher = isInClincherMode(college);
                // Base opacity depends on whether the college is in clincher mode
                const baseOpacity = isInClincher ? 1 : 0.5;

                return (
                  <div
                    key={i}
                    className={`logo-container ${
                      isInTopFive ? 'top-five' : ''
                    }`}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%',
                      transform: `translate(-50%, -50%) translate(${logoX}%, ${logoY}%)`,
                      animation: !rankIndicatorsAnimated ? 
                        `fadeIn 0.8s forwards ${logosStartTime + i * 0.2}s` : 'none',
                      opacity: rankIndicatorsAnimated ? (isInClincher ? 1 : 0.4) : undefined, // Modified for clincher mode
                      transition: 'transform 0.5s ease-out, opacity 0.5s ease-out', // Added opacity transition
                    }}
                  >
                    {/* Regular logo with adjusted opacity for clincher mode */}
                    <img
                      src={regularImagePath}
                      alt={`Logo ${i + 1}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: (1 - redOpacity) * baseOpacity, // Apply base opacity for clincher
                        transition: 'opacity 0.3s ease-in-out',
                        zIndex: 1,
                      }}
                    />

                    {/* Red logo with controlled opacity for fading */}
                    <img
                      src={redImagePath}
                      alt={`Logo ${i + 1} Red`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: redOpacity * baseOpacity, // Apply base opacity for clincher
                        transition: 'opacity 0.3s ease-in-out',
                        zIndex: 2,
                      }}
                    />

                    {/* Add rank indicator for top 5 colleges in all modes */}
                    {collegeRank > 0 && (
                      <div
                        className={`rank-indicator ${
                          hasRankChangeEffect ? 'rank-changed' : ''
                        }`}
                        style={{
                          position: 'absolute',
                          top: '0px',
                          right: '10px',
                          width: '40px',
                          height: '40px',
                          opacity: rankIndicatorsAnimated ? (isInClincher ? 1 : 0.4) : undefined, // Modified for clincher mode
                          animation: !rankIndicatorsAnimated ? 
                            `fadeIn 0.8s forwards ${logosStartTime + i * 0.2 + 0.5}s` : 
                            (hasRankChangeEffect ? 'rankChangeEffect 2s ease-in-out' : 'none'),
                          zIndex: 12,
                        }}
                      >
                        <img
                          src={`./images/ingameRanks/${collegeRank}.png`}
                          alt={`Rank ${collegeRank}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            filter: hasRankChangeEffect
                              ? 'brightness(1.5) drop-shadow(0 0 10px gold)'
                              : 'none',
                            transition: 'filter 0.3s ease-in-out',
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
              src='./images/CENTER VAULT.png'
              alt='Center Vault'
              className='center-image'
            />

            {/* Center border container */}
            <div
              id='centerBorderContainer'
              className='center-border-container'
            />
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
    </div>
  );
}

export default RadarView;