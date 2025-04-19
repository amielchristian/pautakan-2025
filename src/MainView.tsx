import './App.css';
import { useEffect, useState, useRef } from 'react';
import { College } from './types';
import RadarView from './RadarView/radarView';

// Position-Locked Logo Grid Component - compressed and moved right
function FrameCollegeLogos({ colleges }: { colleges: College[] }) {
  const [visibleLogos, setVisibleLogos] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialRenderDone = useRef<boolean>(false);
  
  // Animation effect for logos
  useEffect(() => {
    // For 5 colleges, show all logos immediately to avoid flickering
    if (colleges.length === 5) {
      // If it's already been rendered once, don't change visibleLogos state
      if (!initialRenderDone.current) {
        // On first render, show all logos immediately
        setVisibleLogos([0, 1, 2, 3, 4]);
        initialRenderDone.current = true;
      }
    } else {
      // For other lengths, use the original staggered animation
      initialRenderDone.current = false;
      setVisibleLogos([]);
      colleges.forEach((_, index) => {
        setTimeout(() => {
          setVisibleLogos(prev => [...prev, index]);
        }, 300 * index);
      });
    }
  }, [colleges.length]); // Only depend on the length changing, not the colleges array itself
  
  // Special layout when there are exactly 5 colleges
  if (colleges.length === 5) {
    // Define exact fixed positions for each logo slot (percentages of container)
    const positions = [
      { top: '8%', left: '15%' },    // Position 1
      { top: '8%', left: '65%' },    // Position 2
      { top: '40%', left: '40%' },   // Position 3
      { top: '72%', left: '15%' },   // Position 4
      { top: '72%', left: '65%' }    // Position 5
    ];
    
    return (
      <div 
        ref={containerRef}
        className="absolute z-60" 
        style={{
          // Drastically compressed and moved right
          top: '32%',           // Keep vertical position
          right: '2%',          // Move much closer to right edge
          width: '18%',         // Drastically reduced width
          height: '28%',        // Drastically reduced height
          pointerEvents: 'none' // Allow clicking through
        }}
      >
        {/* Absolutely positioned logos */}
        {colleges.map((college, index) => {
          const fileName = college.imagePath.split('/').pop();
          const position = positions[index];
          
          return (
            <div 
              key={college.id} 
              className="absolute flex items-center justify-center"
              style={{
                top: position.top,
                left: position.left,
                width: '32%',   // Slightly smaller logos
                height: '32%',  // Square aspect ratio
                transform: 'translate(18%, -85%)' // Center on position point
              }}
            >
              <img 
                src={`/images/Top5/ICONS FOR RANKING/${fileName}`}
                alt={college.shorthand} 
                className={`w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
                  visibleLogos.includes(index) ? 'opacity-100' : 'opacity-0'
                }`}
              />
            </div>
          );
        })}
      </div>
    );
  }
  
  // For regular grid layout - position directly on the 4x4 grid
  const gridPositions = [
    // Row 1 - evenly decompressed and symmetrical
    { top: '4%', left: '10%' },
    { top: '4%', left: '30%' },
    { top: '4%', left: '50%' },
    { top: '4%', left: '70%' },
    // Row 2 - evenly decompressed and symmetrical
    { top: '28%', left: '10%' },
    { top: '28%', left: '30%' },
    { top: '28%', left: '50%' },
    { top: '28%', left: '70%' },
    // Row 3 - evenly decompressed and symmetrical
    { top: '52%', left: '10%' },
    { top: '52%', left: '30%' },
    { top: '52%', left: '50%' },
    { top: '52%', left: '70%' },
    // Row 4 - evenly decompressed and symmetrical
    { top: '76%', left: '10%' },
    { top: '76%', left: '30%' },
    { top: '76%', left: '50%' },
    { top: '76%', left: '70%' }
  ];
  
  return (
    <div 
      ref={containerRef}
      className="absolute z-60" 
      style={{
        // Even more drastically compressed and moved right
        top: '35%',          // Keep vertical position
        right: '1%',         // Even closer to right edge
        width: '15%',        // Further reduced width
        height: '28%',       // Further reduced height
        pointerEvents: 'none'
      }}
    >
      {colleges.slice(0, 16).map((college, index) => {
        const fileName = college.imagePath.split('/').pop();
        const position = gridPositions[index];
        
        return (
          <div 
            key={college.id} 
            className="absolute flex items-center justify-center"
            style={{
              top: position.top,
              left: position.left,
              width: '25%',    // Even smaller logos
              height: '25%',   // Maintain square aspect ratio
              transform: 'translate(-23%, -140%)' // Center on position point
            }}
          >
            <img 
              src={`/images/Top5/ICONS FOR RANKING/${fileName}`}
              alt={college.shorthand} 
              className={`w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
                visibleLogos.includes(index) ? 'opacity-100' : 'opacity-0'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}

function MainView() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [allColleges, setAllColleges] = useState<College[]>([]);
  const [difficulty, setDifficulty] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [lastNormalDifficulty, setLastNormalDifficulty] = useState<string>('');
  const [division, setDivision] = useState<string>('');  
  const [isFinalsMode, setIsFinalsMode] = useState<boolean>(false);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [topFiveColleges, setTopFiveColleges] = useState<College[]>([]);
  const [collegeRadiusAdjustments, setCollegeRadiusAdjustments] = useState<Record<string, number>>({});
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeRing, setActiveRing] = useState(11);
  const [smallestRingValue, setSmallestRingValue] = useState(1);
  const radialGridContainerRef = useRef<HTMLDivElement>(null);

  const getColleges = async () => {
    return await window.ipcRenderer.invoke('get-colleges');
  };

  // Create radial lines
  useEffect(() => {
    if (colleges.length > 0 && radialGridContainerRef.current) {
      // Clear existing radial lines
      while (radialGridContainerRef.current.firstChild) {
        radialGridContainerRef.current.removeChild(
          radialGridContainerRef.current.firstChild
        );
      }
      // Create radial lines
      const collegeCount = colleges.length;
      for (let i = 0; i < collegeCount; i++) {
        const radialLine = document.createElement('div');
        radialLine.className = 'radial-line';
        const angle = i * (360 / collegeCount);
        if (collegeCount === 5) {
          radialLine.style.transform = `rotate(${angle + 54}deg)`;
        } else {
          radialLine.style.transform = `rotate(${angle}deg)`;
        }
        radialLine.style.transition = radialLine.style.animationDelay = `${
          2 + i * 0.1
        }s`; // Staggered fade-in effect
        radialGridContainerRef.current.appendChild(radialLine);
      }
    }
  }, [colleges]);

  // Listen for updates - consolidated all IPC listeners in one effect
  useEffect(() => {
    // Setup all event handlers
    const handleDbUpdated = () => {
      getColleges().then((updatedColleges) => {
        setColleges(
          updatedColleges.map((updatedCollege: College, i: number) => {
            return updatedCollege.score !== colleges[i]?.score
              ? updatedCollege
              : colleges[i];
          })
        );
      });
    };

    const handleScoresReset = () => {
      getColleges().then((updatedColleges) => {
        setColleges(updatedColleges);
      });
    };

    const handleCategorySynced = (_: any, newCategory: string) => {
      setCategory(newCategory);
      if (newCategory === 'Eliminations') {
        setIsFinalsMode(false);
        getColleges().then((allColleges) => {
          setColleges(allColleges);
          setAllColleges(allColleges);
        });
      }
    };

    const handleSwitchToFinals = (_: any, topFiveColleges: College[]) => {
      setCategory('Finals');
      setIsFinalsMode(true);
      setColleges(topFiveColleges);
      console.log('Switched to Finals mode with top 5 colleges:', topFiveColleges);
    };

    const handleDifficultySynced = (_: any, newDifficulty: string) => {
      setDifficulty(newDifficulty);
      setCollegeRadiusAdjustments({});
      setActiveRing(11);
      setSmallestRingValue(1);
      circleRefs.current.forEach((circleRef) => {
        if (circleRef) {
          circleRef.style.opacity = "0";
        }
      });

      // Store last normal difficulty if it's not a special round
      if (['Easy', 'Average', 'Difficult'].includes(newDifficulty)) {
        setLastNormalDifficulty(newDifficulty);
      }
      
      console.log(`DIFFICULTY CHANGED: ${newDifficulty}`);
    };

    const handleDivisionSynced = (_: any, newDivision: string) => {
      setDivision(newDivision);
      console.log(`DIVISION CHANGED: ${newDivision}`);
    };

    const handleRefresh = () => {
      window.location.reload();
    };

    const handleTopFiveColleges = (_: any, topColleges: College[]) => {
      setIsPopupVisible(true);
      setTopFiveColleges(topColleges);
      topColleges.forEach((college: College, index: number) => {
        console.log(`${index + 1}. ${college.shorthand} (${college.name})`);
      });
    };

    const handleCloseTopFive = () => {
      setIsPopupVisible(false);
      console.log('Popup closed via ControlView.');
    };

    // Register all event listeners
    window.ipcRenderer.on('db-updated', handleDbUpdated);
    window.ipcRenderer.on('scores-reset', handleScoresReset);
    window.ipcRenderer.on('category-synced', handleCategorySynced);
    window.ipcRenderer.on('switch-to-finals', handleSwitchToFinals);
    window.ipcRenderer.on('difficulty-synced', handleDifficultySynced);
    window.ipcRenderer.on('division-synced', handleDivisionSynced);
    window.ipcRenderer.on('refresh', handleRefresh);
    window.ipcRenderer.on('top-five-colleges', handleTopFiveColleges);
    window.ipcRenderer.on('close-top-five', handleCloseTopFive);

    // Clean up all listeners when the component unmounts or re-renders
    return () => {
      window.ipcRenderer.removeAllListeners('db-updated');
      window.ipcRenderer.removeAllListeners('scores-reset');
      window.ipcRenderer.removeAllListeners('category-synced');
      window.ipcRenderer.removeAllListeners('switch-to-finals');
      window.ipcRenderer.removeAllListeners('difficulty-synced');
      window.ipcRenderer.removeAllListeners('division-synced');
      window.ipcRenderer.removeAllListeners('refresh');
      window.ipcRenderer.removeAllListeners('top-five-colleges');
      window.ipcRenderer.removeAllListeners('close-top-five');
    };
  }, [colleges]); // Only include stable dependencies

  // Initial load
  useEffect(() => {
    const retrieveCategoryAndDifficulty = async () => {
      const { category: currentCategory, topFiveColleges } =
        await window.ipcRenderer.invoke('sync-category');
      await window.ipcRenderer.invoke('sync-difficulty');
      await window.ipcRenderer.invoke('sync-division');
      
      // If we're already in Finals mode and have top 5 colleges, use those
      if (
        currentCategory === 'Finals' &&
        topFiveColleges &&
        topFiveColleges.length > 0
      ) {
        setIsFinalsMode(true);
        setColleges(topFiveColleges);
      } else {
        getColleges().then((colleges) => {
          setColleges(colleges);
          setAllColleges(colleges);
        });
      }
    };
    retrieveCategoryAndDifficulty();
  }, []);

  return (
    <>
      <div className="absolute bottom-87 right-30 flex flex-col items-center gap-18 z-[9999] w-[300px]">
        <div className='mt-4 text-transparent text-[80px] font-bold bg-clip-text font-[DS-Digital] bg-white drop-shadow-[0_0_0.1em_white]'>
          {division}
        </div>

        {/*Normal Difficulties*/}
        <div className='mt-4 text-green-500 text-8xl font-bold bg-clip-text font-[DS-Digital] bg-green-200 drop-shadow-[0_0_0.1em_green]'>
          {lastNormalDifficulty}
        </div>
      </div>

      <div className="absolute bottom-15 right-30 flex flex-col items-center gap-19 z-[9999] w-[300px]">
        {/*Special Difficulties*/}
        {['Clincher', 'Sudden Death'].includes(difficulty) && (
          <div className='mt-4 text-red-500 text-8xl text-center font-bold bg-clip-text font-[DS-Digital] bg-red-200 drop-shadow-[0_0_0.1em_red]'>
            {difficulty}
          </div>
        )}
      </div>
  
      {/* Full-screen frame */}
      <div className='fixed top-0 left-0 w-screen h-screen z-50 pointer-events-none'>
        <img
          src='./images/NEW SCREEN FRAME.png'
          alt='Screen Frame'
          className='w-screen h-screen object-fill'
        />
      </div>

      {/* College logos OVER the frame (z-index higher than frame) */}
      <FrameCollegeLogos colleges={isFinalsMode ? colleges : (allColleges.length > 0 ? allColleges : colleges)} />

      {/* Body - flex row */}
      <div className='overflow-hidden bg-black flex flex-row h-screen w-screen p-8 space-x-[1%]'>
        {/* Main */}
        <div
          className='flex flex-row w-[83%] p-5 space-x-4
          [--all:20px]'
        >
          {/* Scores */}
          <div
            className='sharp-edge-box p-5
            flex flex-col justify-evenly
            [--all:10px]
            [--border-width:2px] border-[2px]
            [--border-color:var(--red)] border-[var(--red)]'
          >
            {colleges.map((college: College) => (
              <Score key={college.id} college={college} />
            ))}
          </div>

          {/* Top 5 Pop-up */}
          {isPopupVisible && (
            <div className='fixed inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1.5px] z-100'>
              {/* Top Bar */}
              <div className='fixed top-[25%] left-1/2 transform -translate-x-1/2 w-full'>
                <img
                  src='/images/Top5/BAR TOP.png'
                  alt='BAR TOP'
                  className='w-full'
                />
                <div className='absolute top-1/2 left-[43%] transform -translate-x-1/2 -translate-y-1/2 flex justify-center'>
                  <h1 className='text-9xl font-[Starter] text-white bg-clip-text font-bold bg-red-200 drop-shadow-[0_0_0.1em_white]'>
                    TOP 5
                  </h1>
                </div>
              </div>

              {/* Bottom Bar */}
              <img
                src='/images/Top5/BAR BOT.png'
                alt='BAR BOT'
                className='absolute top-[70%] left-1/2 transform -translate-x-1/2 w-full'
              />

              {/* Podium Images with Top 5 Colleges */}
              <div className='fixed top-[58%] left-[42.5%] transform -translate-x-1/2 -translate-y-1/2'>
                <div className='flex justify-center space-x-4'>
                  {topFiveColleges.map((college, index) => {
                    // Extract the file name from the imagePath
                    const fileName = college.imagePath.split('/').pop(); // Example: 'CRS.png'
                    return (
                      <div
                        key={college.id}
                        className='flex flex-col items-center relative'
                      >
                        {/* Podium Image */}
                        <div className='relative'>
                          <img
                            src={`/images/Top5/${index + 1}.png`}
                            alt={`Podium ${index + 1}`}
                            className='podium'
                          />
                          {/* Ranking Icon */}
                          <img
                            src={`/images/Top5/ICONS FOR RANKING/${fileName}`}
                            alt={`Rank Icon for ${college.name}`}
                            className='absolute top-[53%] left-[56%] transform -translate-x-1/2 -translate-y-1/2 w-96 h-88'
                          />
                        </div>
                        {/* College Name */}
                        <div className='mt-4 flex items-center justify-center'>
                          <span className='text-4xl font-[Starter] text-white bg-clip-text font-bold bg-white-200 drop-shadow-[0_0_0.1em_red]'>
                            {college.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Main */}
          <div
            className='sharp-edge-box w-[98%]
            flex flex-col align-center justify-center items-center
            [--all:10px]
            [--border-width:2px] border-[2px] border-r-[3px]
            [--border-color:var(--red)] border-[var(--red)]
            relative'
          >
            {/* Radial grid container */}
            <div
              id='radialGridContainer'
              ref={radialGridContainerRef}
              className='radial-grid-container'
            ></div>
            <RadarView 
              colleges={colleges}
              collegeRadiusAdjustments={collegeRadiusAdjustments}
              setCollegeRadiusAdjustments={setCollegeRadiusAdjustments}
              circleRefs={circleRefs}
              activeRing={activeRing}
              setActiveRing={setActiveRing}
              smallestRingValue={smallestRingValue}
              setSmallestRingValue={setSmallestRingValue}>
              </RadarView>
            {isFinalsMode && (
              <div className='absolute top-0 left-0 w-full p-4 text-center'></div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Scores
function Score({ college }: { college: College }) {
  const [showGlow, setShowGlow] = useState(false);

  useEffect(() => {
    setShowGlow(true);
    const timeout = setTimeout(() => {
      setShowGlow(false);
    }, 1000);
    console.log(`Score modified for ${college.name}!`);
    return () => clearTimeout(timeout);
  }, [college]);

  return (
    <div className='flex flex-row space-x-4'>
      <div
        className='sharp-edge-box w-20 h-10 [--img:linear-gradient(#222,#111)] font-[DS-Digital] text-3xl
    inset-shadow-custom [--inset-shadow-color:var(--red)] [--inset-shadow-size:0.2em]
    flex items-center justify-center
    [--top-left:10px] [--bottom-right:10px]
    [--border-width:2px] border-[2px]
    [--border-color:var(--red)] border-[var(--red)]'
      >
        {college.score.toString().padStart(3, '0')}
      </div>
      <span
        className={`text-4xl font-[Starter] text-transparent bg-clip-text font-bold bg-red-200 drop-shadow-[0_0_0.1em_red] ${
          showGlow ? 'text-glow' : ''
        }`}
      >
        {college.shorthand}
      </span>
    </div>
  );
}

export default MainView;