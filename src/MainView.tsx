import './App.css';
import { useEffect, useState, useRef } from 'react';
import { College } from './types';
import RadarView from './RadarView/radarView';
import { AnimatePresence, motion } from 'framer-motion';
import { IpcRendererEvent } from 'electron';

function FrameCollegeLogos({ colleges, clincherColleges }: { colleges: College[], clincherColleges: College[] }) {
  const [visibleLogos, setVisibleLogos] = useState<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialRenderDone = useRef<boolean>(false);
  const isClincherMode = clincherColleges.length > 0;

  useEffect(() => {
    if (colleges.length === 5) {
      if (!initialRenderDone.current) {
        setVisibleLogos([0, 1, 2, 3, 4]);
        initialRenderDone.current = true;
      }
    } else {
      initialRenderDone.current = false;
      setVisibleLogos([]);
      colleges.forEach((_, index) => {
        setTimeout(() => {
          setVisibleLogos((prev) => [...prev, index]);
        }, 300 * index);
      });
    }
  }, [colleges.length]);

  // Helper function to determine if a college is in clincher mode
  const isInClincherMode = (college: College) => {
    if (!isClincherMode) return true; // If not in clincher mode, all colleges are shown normally
    return clincherColleges.some(c => c.id === college.id);
  };
  
  if (colleges.length === 5) {
    const positions = [
      { top: '8%', left: '15%' },
      { top: '8%', left: '65%' },
      { top: '40%', left: '40%' },
      { top: '72%', left: '15%' },
      { top: '72%', left: '65%' },
    ];

    return (
      <div
        ref={containerRef}
        className='absolute z-60'
        style={{
          top: '32%',
          right: '2%',
          width: '18%',
          height: '28%',
          pointerEvents: 'none',
        }}
      >
        {/* Absolutely positioned logos */}
        {colleges.map((college, index) => {
          const fileName = college.imagePath.replace('.png', '_norings.png');
          const position = positions[index];
          const isInClincher = isInClincherMode(college);

          return (
            <div
              key={college.id}
              className='absolute flex items-center justify-center'
              style={{
                top: position.top,
                left: position.left,
                width: '32%',
                height: '32%',
                transform: 'translate(18%, -85%)',
              }}
            >
              <img
                src={fileName}
                alt={college.shorthand}
                className={`w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
                  visibleLogos.includes(index) ? 'opacity-100' : 'opacity-0'
                }`}
                style={{
                  opacity: isInClincher ? 1 : 0.4, // Apply 40% opacity to non-clincher colleges
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  const gridPositions = [
    { top: '4%', left: '10%' },
    { top: '4%', left: '30%' },
    { top: '4%', left: '50%' },
    { top: '4%', left: '70%' },

    { top: '28%', left: '10%' },
    { top: '28%', left: '30%' },
    { top: '28%', left: '50%' },
    { top: '28%', left: '70%' },

    { top: '52%', left: '10%' },
    { top: '52%', left: '30%' },
    { top: '52%', left: '50%' },
    { top: '52%', left: '70%' },

    { top: '76%', left: '10%' },
    { top: '76%', left: '30%' },
    { top: '76%', left: '50%' },
    { top: '76%', left: '70%' },
  ];

  return (
    <div
      ref={containerRef}
      className='absolute z-60'
      style={{
        top: '35%',
        right: '1%',
        width: '15%',
        height: '28%',
        pointerEvents: 'none',
      }}
    >
      {colleges.slice(0, 16).map((college, index) => {
        const fileName = college.imagePath.replace('.png', '_norings.png');
        const position = gridPositions[index];
        const isInClincher = isInClincherMode(college);

        return (
          <div
            key={college.id}
            className='absolute flex items-center justify-center'
            style={{
              top: position.top,
              left: position.left,
              width: '25%',
              height: '25%',
              transform: 'translate(-23%, -140%)',
            }}
          >
            <img
              src={fileName}
              alt={college.shorthand}
              className={`w-full h-full object-contain transition-opacity duration-500 ease-in-out ${
                visibleLogos.includes(index) ? 'opacity-100' : 'opacity-0'
              }`}
              style={{
                opacity: isInClincher ? 1 : 0.4, // Apply 40% opacity to non-clincher colleges
              }}
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
  const [isDifficultyBannerVisible, setIsDifficultyBannerVisible] =
    useState(false);
  const [topFiveColleges, setTopFiveColleges] = useState<College[]>([]);
  const [collegeRadiusAdjustments, setCollegeRadiusAdjustments] = useState<
    Record<string, number>
  >({});
  const [clincherColleges, setClincherColleges] = useState<College[]>([]);
  const circleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [activeRing, setActiveRing] = useState(11);
  const [smallestRingValue, setSmallestRingValue] = useState(1);
  const [prevScores, setPrevScores] = useState<Record<string, number>>({});
  const radialGridContainerRef = useRef<HTMLDivElement>(null);
  const [booted, setBooted] = useState(false);

  const getColleges = async () => {
    return await window.ipcRenderer.invoke('get-colleges');
  };
  function handleBoot(booted: boolean) {
    setBooted(booted);
  }

  useEffect(() => {
    if (colleges.length > 0 && radialGridContainerRef.current) {
      while (radialGridContainerRef.current.firstChild) {
        radialGridContainerRef.current.removeChild(
          radialGridContainerRef.current.firstChild
        );
      }

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
        }s`;
        radialGridContainerRef.current.appendChild(radialLine);
      }
    }
  }, [colleges]);

  useEffect(() => {
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
        setAllColleges(updatedColleges);
      });
      setCollegeRadiusAdjustments({});
      setActiveRing(11);
      setSmallestRingValue(1);
      circleRefs.current.forEach((circleRef) => {
        if (circleRef) {
          circleRef.style.opacity = '0';
        }
      });
      setPrevScores((prev) => {
        const resetScores: Record<string, number> = {};
        Object.keys(prev).forEach((key) => {
          resetScores[key] = 0;
        });
        return resetScores;
      });

      setIsFinalsMode(false);
    };

    const handleCategorySynced = (_: IpcRendererEvent, newCategory: string) => {
      // Close any open leaderboard if category changes
      if (category !== newCategory) {
        setIsPopupVisible(false);
      }

      setCategory(newCategory);

      if (newCategory === 'Finals') {
        setIsFinalsMode(true);
      } else {
        setIsFinalsMode(false);

        getColleges().then((allColleges) => {
          setColleges(allColleges);
          setAllColleges(allColleges);
        });
      }
    };

    const handleSwitchToFinals = (
      _: IpcRendererEvent,
      topFiveColleges: College[]
    ) => {
      let isAlreadyFinals = false;
      if (category === 'Finals') isAlreadyFinals = true;

      // Close any open leaderboard
      setIsPopupVisible(false);

      setCategory('Finals');
      console.log(
        'Switched to Finals mode with top 5 colleges:',
        topFiveColleges
      );

      setTopFiveColleges(topFiveColleges);

      if (!isAlreadyFinals) {
        setIsFinalsMode(true);
        setColleges(topFiveColleges);

        setCollegeRadiusAdjustments({});
        setActiveRing(11);
        setSmallestRingValue(1);
        circleRefs.current.forEach((circleRef) => {
          if (circleRef) {
            circleRef.style.opacity = '0';
          }
        });

        setPrevScores((prev) => {
          const resetScores: Record<string, number> = {};
          Object.keys(prev).forEach((key) => {
            resetScores[key] = 0;
          });
          return resetScores;
        });

        setLastNormalDifficulty('Easy');
      }
    };

    const handleDifficultySynced = (
      _: IpcRendererEvent,
      newDifficulty: string,
      clincherCollegesData?: College[]
    ) => {
      setDifficulty(newDifficulty);
      setCollegeRadiusAdjustments({});
      if (newDifficulty === 'Clincher' || newDifficulty === 'Sudden Death'){
        setActiveRing(5);
      } else {
        setActiveRing(11);
      }
      setSmallestRingValue(1);
      circleRefs.current.forEach((circleRef) => {
        if (circleRef) {
          circleRef.style.opacity = '0';
        }
      });
    
      if (['Easy', 'Average', 'Difficult'].includes(newDifficulty)) {
        setLastNormalDifficulty(newDifficulty);
        // Reset clincher colleges when returning to normal difficulties
        setClincherColleges([]);
      } else if ((newDifficulty === 'Clincher' || newDifficulty === 'Sudden Death') && 
                 clincherCollegesData && clincherCollegesData.length > 0) {
        // Store the clincher colleges when difficulty is set to Clincher or Sudden Death
        setClincherColleges(clincherCollegesData);
      }
    
      console.log(`DIFFICULTY CHANGED: ${newDifficulty}`);
    };
    

    const handleDivisionSynced = (_: IpcRendererEvent, newDivision: string) => {
      setDivision(newDivision);
      console.log(`DIVISION CHANGED: ${newDivision}`);

      // Close any open leaderboard
      setIsPopupVisible(false);

      setCollegeRadiusAdjustments({});
      setActiveRing(11);
      setSmallestRingValue(1);
      circleRefs.current.forEach((circleRef) => {
        if (circleRef) {
          circleRef.style.opacity = '0';
        }
      });
      setPrevScores((prev) => {
        const resetScores: Record<string, number> = {};
        Object.keys(prev).forEach((key) => {
          resetScores[key] = 0;
        });
        return resetScores;
      });
      setIsFinalsMode(false);
    };

    const handleRefresh = () => {
      window.location.reload();
    };

    const handleTopFiveColleges = (
      _: IpcRendererEvent,
      topColleges: College[]
    ) => {
      setIsPopupVisible(true);
      setTopFiveColleges(topColleges);
      topColleges.forEach((college: College, index: number) => {
        console.log(`${index + 1}. ${college.shorthand} (${college.name})`);
      });
    };

    const handleCloseTopFive = () => {
      setIsPopupVisible(false);
      console.log('Popup closed via ControlView.');

      setTimeout(() => {
        setIsPopupVisible(false);
        console.log('Popup closed via ControlView.');
      }, 500);
    };

    const handleTopThreeColleges = (
      _: IpcRendererEvent,
      topColleges: College[]
    ) => {
      setIsPopupVisible(true);
      topColleges.forEach((college: College, index: number) => {
        console.log(`${index + 1}. ${college.shorthand} (${college.name})`);
      });
    };

    window.ipcRenderer.on('db-updated', handleDbUpdated);
    window.ipcRenderer.on('scores-reset', handleScoresReset);
    window.ipcRenderer.on('category-synced', handleCategorySynced);
    window.ipcRenderer.on('switch-to-finals', handleSwitchToFinals);
    window.ipcRenderer.on('difficulty-synced', handleDifficultySynced);
    window.ipcRenderer.on('division-synced', handleDivisionSynced);
    window.ipcRenderer.on('refresh', handleRefresh);
    window.ipcRenderer.on('top-five-colleges', handleTopFiveColleges);
    window.ipcRenderer.on('top-three-colleges', handleTopThreeColleges);
    window.ipcRenderer.on('close-top-five', handleCloseTopFive);

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
  }, [colleges, category]);

  useEffect(() => {
    const retrieveCategoryAndDifficulty = async () => {
      const { category: currentCategory, topFiveColleges } =
        await window.ipcRenderer.invoke('sync-category');
      await window.ipcRenderer.invoke('sync-difficulty');
      await window.ipcRenderer.invoke('sync-division');

      setCategory(currentCategory);
      if (currentCategory === 'Finals') {
        setIsFinalsMode(true);
      }

      if (
        currentCategory === 'Finals' &&
        topFiveColleges &&
        topFiveColleges.length > 0
      ) {
        setIsFinalsMode(true);
        setColleges(topFiveColleges);
        setTopFiveColleges(topFiveColleges);
      } else {
        getColleges().then((colleges) => {
          setColleges(colleges);
          setAllColleges(colleges);
        });
      }
    };
    retrieveCategoryAndDifficulty();
  }, []);

  useEffect(() => {
    if (!booted) {
      return;
    }

    setIsDifficultyBannerVisible(true);
    const timeout = setTimeout(() => {
      setIsDifficultyBannerVisible(false);
    }, 2000); // Adjust the duration as needed
    return () => clearTimeout(timeout);
  }, [difficulty, booted]);

  return (
    <>
      {/* Full-screen frame */}
      <div className='fixed top-0 left-0 w-screen h-screen z-50 pointer-events-none'>
        <img
          src='./images/SCREENFRAME.png'
          alt='Above Screen Frame'
          className='w-screen h-screen object-fill'
        />
      </div>

      <div className='fixed top-0 left-0 w-screen h-screen z-50 pointer-events-none'>
        <img
          src='./images/NEW SCREEN FRAME.png'
          alt='Screen Frame'
          className='w-screen h-screen object-fill'
        />
      </div>
      {/* College logos OVER the frame (z-index higher than frame) */}
      <FrameCollegeLogos
        colleges={
          isFinalsMode
            ? colleges
            : allColleges.length > 0
            ? allColleges
            : colleges
        }
        clincherColleges={clincherColleges}
      />

      {/* Body - flex row */}
      <div className='overflow-hidden bg-black flex flex-row h-screen w-screen p-8 space-x-[1%]'>
        <div
          className='flex flex-row w-[83%] p-5 space-x-4
          [--all:20px]'
        >
          {/* Leaderboard Popup */}
          <AnimatePresence>
            {isPopupVisible && (
              <motion.div
                key='leaderboard-popup'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5 }}
                className={`fixed inset-0 bg-black/35 backdrop-blur-[1.5px] z-10 flex flex-col items-center overflow-y-auto pt-[10vh]`}
              ></motion.div>
            )}
          </AnimatePresence>
          {isFinalsMode && isPopupVisible && (
            <div className='fixed inset-0 z-10 flex flex-col items-center overflow-y-auto pt-[10vh]'>
              {/* Blur Background Layer */}
              <div className='absolute inset-0 bg-black/35 backdrop-blur-[1.5px] z-[-1]'></div>

              {/* Top Bar */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='relative w-full mt-[10vh]'
              >
                <img
                  src='./images/topFive/BAR TOP.png'
                  alt='BAR TOP'
                  className='w-full'
                />
                <div className='absolute top-1/2 left-[43%] transform -translate-x-1/2 -translate-y-1/2 flex justify-center'>
                  <h1
                    style={{ fontSize: 'clamp(2rem, 7vw, 15rem)' }}
                    className='font-[Starter] text-white bg-clip-text font-bold bg-red-200 drop-shadow-[0_0_0.1em_white]'
                  >
                    TOP 3
                  </h1>
                </div>
              </motion.div>

              {/* Podium Section */}
              <div className='w-full mt-8 relative overflow-visible py-9'>
              <div className='flex justify-center gap-6'>
                  {topFiveColleges
                    .sort((a, b) => {
                      return b.score - a.score;
                    })
                    .slice(0, 3)
                    .map((college, index) => {
                      const fileName = college.imagePath.replace('.png', '_norings.png');
                      const delay = 1.2 + index * 0.3;

                      return (
                        <motion.div
                        key={college.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay, duration: 0.6 }}
                        className='left-[2%] flex flex-col items-center justify-center relative w-[30vw] sm:w-[20vw] md:w-[15vw] lg:w-[12vw] min-h-[20px] mr-7'
                      >
                        <div className='relative w-full aspect-[1/1] mr-9 justify-center flex items-center'>
                          {/* Podium Image */}
                          <img
                            src={`./images/topFive/${index + 1}.png`}
                            alt={`Podium ${index + 1}`}
                            className='absolute top-[50%] left-[0%] w-full h-full scale-[1.4] transform -translate-x-1/2 -translate-y-1/2 object-contain'
                          />
                          {/* College Icon */}
                          <img
                            src={fileName}
                            alt={`Icon for ${college.name}`}
                            className='absolute top-[50%] left-[0%] w-full h-full scale-[1.3] transform -translate-x-1/2 -translate-y-1/2 object-contain'
                          />
                        </div>
  

                          <motion.span
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: delay + 0.1, duration: 0.4 }}
                            style={{ fontSize: 'clamp(.5rem, 2vw, 2.7rem)' }}
                            className='absolute top-[165%] left-[-5%] w-[110%] text-center transform -translate-x-1/2 -translate-y-1/2 leading-[.9] font-[Starter] text-white font-bold drop-shadow-[0_0_0.1em_red] z-20'
                          >
                            {college.name}
                          </motion.span>
                        </motion.div>
                      );
                    })}
                </div>
              </div>

              {/* Bottom Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className='relative w-full mt-8'
              >
                <img
                 src='./images/topFive/BAR BOT.png'
                 alt='BAR BOT'
                 className=' w-full h-[140%]'
                />
              </motion.div>
            </div>
          )}

          {isPopupVisible && !isFinalsMode && (
            <div className='fixed inset-0 bg-black/35 backdrop-blur-[1.5px] z-10 flex flex-col items-center overflow-y-auto pt-[10vh]'>
              {/* Top Bar */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className='relative w-full mt-[10vh]'
              >
                <img
                  src='./images/topFive/BAR TOP.png'
                  alt='BAR TOP'
                  className='w-full'
                />
                <div className='absolute top-1/2 left-[43%] transform -translate-x-1/2 -translate-y-1/2 flex justify-center'>
                  <h1
                    style={{ fontSize: 'clamp(2rem, 7vw, 15rem)' }}
                    className='font-[Starter] text-white bg-clip-text font-bold bg-red-200 drop-shadow-[0_0_0.1em_white]'
                  >
                    TOP 5
                  </h1>
                </div>
              </motion.div>

              {/* Podium Section */}
              <div className='w-full mt-8 relative overflow-visible py-9'>
                <div className='flex justify-center gap-6'>
                  {topFiveColleges.map((college, index) => {
                    const fileName = college.imagePath.replace('.png', '_norings.png');
                    const delay = 1.2 + index * 0.3;

                    return (
                      <motion.div
                      key={college.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay, duration: 0.6 }}
                      className='left-[1%] flex flex-col items-center justify-center relative w-[30vw] sm:w-[20vw] md:w-[15vw] lg:w-[12vw] min-h-[20px] mr-7'
                    >
                      <div className='relative w-full aspect-[1/1] mr-9 justify-center flex items-center'>
                        {/* Podium Image */}
                        <img
                          src={`./images/topFive/${index + 1}.png`}
                          alt={`Podium ${index + 1}`}
                          className='absolute top-[50%] w-full h-full scale-[1.3] transform -translate-x-1/2 -translate-y-1/2 object-contain'
                        />
                        {/* College Icon */}
                        <img
                          src={fileName}
                          alt={`Icon for ${college.name}`}
                          className='absolute top-[50%] left-[0%] w-full h-full scale-[1.1] transform -translate-x-1/2 -translate-y-1/2 object-contain'
                        />
                      </div>

                        <motion.span
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: delay + 0.1, duration: 0.4 }}
                          style={{ fontSize: 'clamp(.5rem, 2vw, 2.7rem)' }}
                          className='absolute top-[165%] left-[-6] w-[110%] text-center transform -translate-x-1/2 -translate-y-1/2 leading-[.9] font-[Starter] text-white font-bold drop-shadow-[0_0_0.1em_red] z-20'
                        >
                          {college.name}
                        </motion.span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className='relative w-full mt-8'
              >
                <img
                  src='./images/topFive/BAR BOT.png'
                  alt='BAR BOT'
                  className=' w-full h-[150%]'
                />
              </motion.div>
            </div>
          )}

          {/* Difficulty Popup */}
          <AnimatePresence>
            {isDifficultyBannerVisible && (
              <motion.div
                key='difficulty-banner'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.33 }}
                className={`fixed inset-0 bg-black/35 backdrop-blur-[1.5px] z-10 flex flex-col items-center overflow-y-auto pt-[10vh]`}

              ></motion.div>
            )}
          </AnimatePresence>
          
          <AnimatePresence>
            {isDifficultyBannerVisible && (
              <div className='fixed w-full inset-0 z-10 flex flex-col items-center justify-center'>
                {/* Top Bar */}
                <motion.div
                  initial={{ x: -1100, opacity: 0 }}
                  animate={{ x: -105, opacity: 1 }}
                  exit={{ x: 1000, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`bg-black font-[DS-DIGITAL] w-1000 h-[33%] border-2 flex items-center justify-center ${
                    difficulty !== 'Clincher' && difficulty !== 'Sudden Death'
                      ? 'border-[var(--green)]'
                      : 'border-[var(--red)]'
                  }`}
                >
                
                  <span
                    className={`text-[160px] ${
                      difficulty !== 'Clincher' && difficulty !== 'Sudden Death'
                        ? 'text-green-500 drop-shadow-[0_0_0.1em_green]'
                        : 'text-red-500 drop-shadow-[0_0_0.1em_red]'
                    }`}
                  >
                    {difficulty}
                  </span>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Red Glow for Clincher and Sudden Death difficulties */}
         <AnimatePresence>
          {(difficulty === 'Clincher' || difficulty === 'Sudden Death') && (
         <div className='fixed w-full inset-0 z-10 flex flex-col items-center justify-center z-150'>
         
  <style>
    {`
      @keyframes pulseGlow {
        0%, 100% { opacity: 0.7; }
        50% { opacity: 1; }
      }
    `}
  </style>
  <img
    src='./images/GLOW.png'
    alt='RED GLOW'
    className='w-screen h-screen object-fill'
    style={{ animation: 'pulseGlow 2s ease-in-out infinite' }}
  />

</div>)}
         </AnimatePresence>
       
          <div
            className='sharp-edge-box w-[100%] p-3
            box-content
            flex flex-row space-x-4 relative mx-auto'
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
                <Score key={college.id} college={college} clincherColleges={clincherColleges} />
              ))}
            </div>

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
                setSmallestRingValue={setSmallestRingValue}
                prevScores={prevScores}
                setPrevScores={setPrevScores}
                onBoot={handleBoot}
                clincherColleges={clincherColleges}
              ></RadarView>
              {isFinalsMode && (
                <div className='absolute top-0 left-0 w-full p-4 text-center'></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div
        className='sharp-edge-box
             w-[16%] h-[96.5%]
             flex flex-col items-center
             text-white bg-transparent z-[9999]
             fixed top-[1%] right-[1%]'
      >
        {/* Bottom 40% container */}
        <div className='mt-auto w-full h-[39.5%] bg-transparent flex flex-col items-center justify-center'>
          {/* Division */}
          <div
            style={{ fontSize: 'clamp(1rem, 3vw, 3.7rem)' }}
            className='h-[20%]  w-full flex text-center items-center justify-center bg-clip-text font-[DS-Digital] bg-white drop-shadow-[0_0_0.1em_white]'
          >
            {division}
          </div>

          {/* Last Normal Difficulty */}
          <div
            style={{ fontSize: 'clamp(1rem, 3vw, 4rem)' }}
            className='h-[40%] w-full flex items-center justify-center bg-clip-text text-green-500 font-[DS-Digital] bg-green-200 drop-shadow-[0_0_0.1em_green]'
          >
            {lastNormalDifficulty}
          </div>

          {/* Special Difficulty */}
          <div className='h-[40%] w-[80%] flex items-center justify-center text-center '>
            {['Clincher', 'Sudden Death'].includes(difficulty) && (
              <div
                style={{ fontSize: 'clamp(1rem, 3vw, 5rem)' }}
                className='leading-[.9] text-red-500 bg-clip-text font-[DS-Digital] bg-red-200 drop-shadow-[0_0_0.1em_red]'
              >
                {difficulty}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Score({ college, clincherColleges }: { college: College; clincherColleges: College[] }) {
  const [showGlow, setShowGlow] = useState(false);
  const isClincherMode = clincherColleges.length > 0;
  
  // Helper function to determine if a college is in clincher mode
  const isInClincherMode = (college: College) => {
    if (!isClincherMode) return true; // If not in clincher mode, all colleges are shown normally
    return clincherColleges.some(c => c.id === college.id);
  };
  
  // Check if this college is in clincher mode
  const isInClincher = isInClincherMode(college);
  // Base opacity depends on whether the college is in clincher mode
  const baseOpacity = isInClincher ? 1 : 0.4;

  useEffect(() => {
    setShowGlow(true);
    const timeout = setTimeout(() => {
      setShowGlow(false);
    }, 1000);
    console.log(`Score modified for ${college.name}!`);
    return () => clearTimeout(timeout);
  }, [college]);

  return (
    <div 
      className='flex flex-row space-x-4'
      style={{ 
        opacity: baseOpacity,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <div
        className='sharp-edge-box w-20 h-10 [--img:linear-gradient(#222,#111)] font-[DS-Digital] text-3xl
    inset-shadow-custom [--inset-shadow-color:#ffffff] [--inset-shadow-size:0.2em]
    flex items-center justify-center
    [--top-left:10px] [--bottom-right:10px]
    [--border-width:2px] border-[2px]
    [--border-color:#ffffff] border-white'
      >
        {college.score.toString().padStart(3, '0')}
      </div>
      <span
        className={`text-4xl font-[DS-Digital] text-transparent bg-clip-text font-bold bg-white drop-shadow-[0px_0px_0.1em_rgba(255,255,255,1)] ${
          showGlow ? 'text-glow' : ''
        }`}
      >
        {college.shorthand}
      </span>
    </div>
  );
}

export default MainView;