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

  // Get just the top 5 colleges
  const topFiveColleges = useMemo(() => {
    return rankedColleges.slice(0, 5).filter((college) => college.score > 0);
  }, [rankedColleges]);

  // Track previous rankings to detect changes
  const [prevRankings, setPrevRankings] = useState<Record<string, number>>({});
  const [rankChangeEffects, setRankChangeEffects] = useState<
    Record<string, boolean>
  >({});

  // Initialize bootup sequence - this should only run once
  useEffect(() => {
    const totalBootupTime = 10 * 1000;

    // Bootup complete after timeout
    const bootupTimer = setTimeout(() => {
      setBooted(true);
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

  // Update previous rankings and detect changes - use a stable dependency list
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
          console.log(
            `Rank changed for ${college.shorthand}: ${prevRank} -> ${newRank}`
          );
          newEffects[college.shorthand] = true;
        }
      });

      // Only update state if rankings have changed
      if (JSON.stringify(newRankings) !== JSON.stringify(prevRankings)) {
        setPrevRankings(newRankings);

        // Only set effects if there are any
        if (Object.keys(newEffects).length > 0) {
          setRankChangeEffects(newEffects);

          // Clear rank change effects after animation completes
          Object.keys(newEffects).forEach((shorthand) => {
            setTimeout(() => {
              setRankChangeEffects((prev) => ({
                ...prev,
                [shorthand]: false,
              }));
            }, 2000);
          });
        }
      }
    }
  }, [rankedColleges]); // Only depend on rankedColleges which is derived from colleges

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
          newFactor = currentFactor - 0.046;
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
          newFactor = currentFactor + 0.046;
          const ringToHide = ringToUse + 1;
          const isSharedFactor = Object.entries(prev).some(([key, value]) => {
            return key !== shorthand && value === currentFactor;
          });
          console.log('IS SHARED FACTOR', isSharedFactor);
          if (
            ringToHide != 12 &&
            currentFactor == smallestRingValue &&
            !isSharedFactor
          ) {
            circleRefs.current[ringToHide]!.style.transition =
              'opacity 0.5s ease';
            circleRefs.current[ringToHide]!.style.opacity = '0';
            setActiveRing(ringToHide);
            setSmallestRingValue(newFactor);
          } else if (ringToHide != 12 && newFactor <= 1) {
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

  // circleRefs.current[0]!.style.opacity = "1";
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
          {Array.from({ length: 12 }).map((_, i) => {
            const minSize = isFinalsMode ? 260 : 400;
            const gap = isFinalsMode ? 50.5 : 38.5;
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
                  topFiveColleges.findIndex(
                    (c) => c.shorthand === college.shorthand
                  ) + 1;
                const isInTopFive = collegeRank > 0 && collegeRank <= 5;

                // Get the red logo opacity for this college (0 to 1)
                const redOpacity = redLogoOpacity[college.shorthand] || 0;

                // Regular image path and red image path
                const regularImagePath = college.imagePath;
                const redImagePath = college.imagePath.replace(
                  '.png',
                  '-RED.png'
                );

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
                      animation: `fadeIn 0.8s forwards ${
                        logosStartTime + i * 0.2
                      }s`,
                      transition: 'transform 0.5s ease-out', // Smooth transition when radius changes
                    }}
                  >
                    {/* Regular logo with opposite opacity of red logo */}
                    <img
                      src={regularImagePath}
                      alt={`Logo ${i + 1}`}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        opacity: 1 - redOpacity,
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
                        opacity: redOpacity,
                        transition: 'opacity 0.3s ease-in-out',
                        zIndex: 2,
                      }}
                    />

                    {/* Add rank indicator for top 5 colleges in all modes */}
                    {isInTopFive && (
                      <div
                        className={`rank-indicator ${
                          rankChangeEffects[college.shorthand]
                            ? 'rank-changed'
                            : ''
                        }`}
                        style={{
                          position: 'absolute',
                          top: '0px',
                          right: '10px',
                          width: '40px',
                          height: '40px',
                          opacity: 1,
                          animation: rankChangeEffects[college.shorthand]
                            ? 'rankChangeEffect 2s ease-in-out'
                            : `fadeIn 0.8s forwards ${
                                logosStartTime + i * 0.2 + 0.5
                              }s`,
                          zIndex: 12,
                        }}
                      >
                        <img
                          src={`./images/ingameRanks/${collegeRank}.png`}
                          alt={`Rank ${collegeRank}`}
                          style={{
                            width: '100%',
                            height: '100%',
                            filter: rankChangeEffects[college.shorthand]
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
              src='./images/icon.png'
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
