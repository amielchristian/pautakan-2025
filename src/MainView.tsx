import './App.css';
import { useEffect, useState, useRef } from 'react';
import { College } from './types';
import RadarView from './RadarView/radarView';

function MainView() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [difficulty, setDifficulty] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [isFinalsMode, setIsFinalsMode] = useState<boolean>(false);
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
        radialLine.style.transform = `rotate(${angle}deg)`;
        radialLine.style.animationDelay = `${2 + i * 0.1}s`; // Staggered fade-in effect
        radialGridContainerRef.current.appendChild(radialLine);
      }
    }
  }, [colleges]);

  // Listen for updates
  useEffect(() => {
    // Clean up previous listeners first
    window.ipcRenderer.removeAllListeners('db-updated');
    window.ipcRenderer.removeAllListeners('category-synced');
    window.ipcRenderer.removeAllListeners('difficulty-synced');
    window.ipcRenderer.removeAllListeners('top5-colleges');
    window.ipcRenderer.removeAllListeners('switch-to-finals');
    window.ipcRenderer.removeAllListeners('refresh');
    window.ipcRenderer.removeAllListeners('scores-reset');

    window.ipcRenderer.on('db-updated', () => {
      getColleges().then((updatedColleges) => {
        setColleges(
          updatedColleges.map((updatedCollege: College, i: number) => {
            return updatedCollege.score !== colleges[i]?.score
              ? updatedCollege
              : colleges[i];
          })
        );
      });
    });

    window.ipcRenderer.on('scores-reset', () => {
      getColleges().then((updatedColleges) => {
        setColleges(updatedColleges);
      });
    });

    window.ipcRenderer.on('category-synced', (_, newCategory) => {
      setCategory(newCategory);
      if (newCategory === 'Eliminations') {
        setIsFinalsMode(false);
        getColleges().then((allColleges) => {
          setColleges(allColleges);
        });
      }
    });

    window.ipcRenderer.on('switch-to-finals', (_, topFiveColleges) => {
      setCategory('Finals');
      setIsFinalsMode(true);
      setColleges(topFiveColleges);

      // Refresh the view to reflect changes
      console.log(
        'Switched to Finals mode with top 5 colleges:',
        topFiveColleges
      );
    });

    window.ipcRenderer.on('difficulty-synced', (_, difficulty) => {
      setDifficulty(difficulty);
      console.log(`DIFFICULTY CHANGED: ${difficulty}`);
    });

    window.ipcRenderer.on('refresh', () => {
      window.location.reload();
    });

    // Listen for top5 colleges event from control view
    window.ipcRenderer.on('top5-colleges', (_, topColleges) => {
      console.log('TOP 5 COLLEGES (MAIN VIEW):');
      topColleges.forEach((college: College, index: number) => {
        console.log(`${index + 1}. ${college.shorthand} (${college.name})`);
      });
    });

    // Clean up listeners when the component unmounts
    return () => {
      window.ipcRenderer.removeAllListeners('db-updated');
      window.ipcRenderer.removeAllListeners('category-synced');
      window.ipcRenderer.removeAllListeners('difficulty-synced');
      window.ipcRenderer.removeAllListeners('top5-colleges');
      window.ipcRenderer.removeAllListeners('switch-to-finals');
      window.ipcRenderer.removeAllListeners('refresh');
      window.ipcRenderer.removeAllListeners('scores-reset');
    };
  }, [colleges]);

  // Initial load
  useEffect(() => {
    const retrieveCategoryAndDifficulty = async () => {
      const { category: currentCategory, topFiveColleges } =
        await window.ipcRenderer.invoke('sync-category');
      await window.ipcRenderer.invoke('sync-difficulty');

      // If we're already in Finals mode and have top 5 colleges, use those
      if (
        currentCategory === 'Finals' &&
        topFiveColleges &&
        topFiveColleges.length > 0
      ) {
        setIsFinalsMode(true);
        setColleges(topFiveColleges);
      } else {
        getColleges().then((colleges) => setColleges(colleges));
      }
    };
    retrieveCategoryAndDifficulty();
  }, []);

  return (
    <>
      {/* Full-screen frame */}
      <div className='screen-frame absolute inset-0 w-full h-full pointer-events-none z-50'>
        <img
          src='./images/NEW SCREEN FRAME.png'
          alt='Screen Frame'
          className='w-95 h-95'
        />
      </div>

      {/* Body - flex row */}
      <div className='overflow-hidden bg-gray-300 flex flex-row h-screen w-screen p-8 pr-23 space-x-[1%] inset-shadow-custom'>
        {/* Main */}
        <div
          className='sharp-edge-box flex flex-row w-[98%] p-5 space-x-4
          [--border-width:2px] border-[2px] border-r-[4px] border-r-[var(--red)]
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
            <RadarView colleges={colleges}></RadarView>
            {isFinalsMode && (
              <div className='absolute top-0 left-0 w-full p-4 text-center'>
                <h1 className='text-6xl font-[Starter] font-bold text-transparent bg-clip-text bg-red-200 drop-shadow-[0_0_0.2em_red]'>
                  FINALS
                </h1>
              </div>
            )}
          </div>
        </div>
        <div className='flex flex-col w-3/20 space-y-[5%] mr-3'>
          <Sidebar
            difficulty={difficulty}
            category={category}
            colleges={colleges}
          />
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

// Difficulty and Category
function SettingContainer({ content }: { content: string }) {
  return (
    <div
      className='sharp-edge-box bg-black w-auto h-111/1280 [--bottom-left:20px] [--top-right:20px]
    [--img:linear-gradient(#222,#111)] font-[DS-Digital]
    text-4xl flex items-center justify-center
    [--border-width:2px] border-[2px]
    [--border-color:var(--red)] border-[var(--red)]'
    >
      {content}
    </div>
  );
}

function Sidebar({
  colleges,
  difficulty,
  category,
}: {
  colleges: College[];
  difficulty: string;
  category: string;
}) {
  return (
    <>
      <div
        className='sharp-edge-box text-white text-4xl font-[Starter] font-bold
      flex items-center justify-center
      w-auto h-240/1280 [--all:20px] grid-pattern shadow-custom'
      >
        <img src='./images/logo.png' />
      </div>
      <div className='sharp-edge-box h-460/1280 p-[10%] [--all:20px] grid-pattern grid grid-cols-4 gap-x-2 gap-y-0 items-center'>
        {colleges.map((college) => (
          <img
            key={college.id}
            className='object-cover scale-200'
            src={college.imagePath}
          />
        ))}
      </div>
      <SettingContainer content={category} />
      <SettingContainer content={difficulty} />
    </>
  );
}

export default MainView;
