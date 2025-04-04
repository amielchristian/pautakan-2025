import './App.css';
import { useEffect, useState, useRef } from 'react';
import { College } from './types';
import RadarView from './RadarView/radarView';

function MainView() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [difficulty, setDifficulty] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [isFinalsMode, setIsFinalsMode] = useState<boolean>(false);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  const radialGridContainerRef = useRef<HTMLDivElement>(null);

  const getColleges = async () => {
    return await window.ipcRenderer.invoke('get-colleges');
  };

  // Create radial lines
  useEffect(() => {
    if (colleges.length > 0 && radialGridContainerRef.current) {
      // Clear existing radial lines
      while (radialGridContainerRef.current.firstChild) {
        radialGridContainerRef.current.removeChild(radialGridContainerRef.current.firstChild);
      }

      // Create radial lines
      const collegeCount = colleges.length;
      for (let i = 0; i < collegeCount; i++) {
        const radialLine = document.createElement('div');
        radialLine.className = 'radial-line';
        let angle = i * (360 / collegeCount);
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
        getColleges().then(allColleges => {
          setColleges(allColleges);
        });
      }
    });
    
    window.ipcRenderer.on('switch-to-finals', (_, topFiveColleges) => {
      setCategory('Finals');
      setIsFinalsMode(true);
      setColleges(topFiveColleges);

      // Refresh the view to reflect changes
      console.log('Switched to Finals mode with top 5 colleges:', topFiveColleges);
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
      console.log("TOP 5 COLLEGES (MAIN VIEW):");
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
      const { category: currentCategory, topFiveColleges } = await window.ipcRenderer.invoke('sync-category');
      await window.ipcRenderer.invoke('sync-difficulty');
      
      // If we're already in Finals mode and have top 5 colleges, use those
      if (currentCategory === 'Finals' && topFiveColleges && topFiveColleges.length > 0) {
        setIsFinalsMode(true);
        setColleges(topFiveColleges);
      } else {
        getColleges().then((colleges) => setColleges(colleges));
      }
    };
    retrieveCategoryAndDifficulty();
  }, []);

   // Listen for "Show Leaderboard" event
   useEffect(() => {
    window.ipcRenderer.on('show-leaderboard', (_, selectedColleges) => {
      console.log('Leaderboard data received:', selectedColleges);
      setShowLeaderboard(true); // Show the black box overlay
    });
  
    return () => {
      window.ipcRenderer.removeAllListeners('show-leaderboard');
    };
  }, []);

  return (
    <>
      {/* Body - flex row */}
      <div className='overflow-hidden bg-gray-300 flex flex-row h-screen w-screen p-4 space-x-[1%] inset-shadow-custom'>
           
        {/* Main */}
        <div
          className='sharp-edge-box flex flex-row w-full p-5 space-x-4
          [--border-width:2px] border-[2px]
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
            className='sharp-edge-box w-full
            flex flex-col align-center justify-center items-center
            [--all:10px]
            [--border-width:2px] border-[2px]
            [--border-color:var(--red)] border-[var(--red)]
            relative'
          >
            {/* Radial grid container */}
            <div id='radialGridContainer' ref={radialGridContainerRef} className='radial-grid-container'></div>
            <RadarView colleges={colleges}></RadarView>
            {isFinalsMode && (
              <div className="absolute top-0 left-0 w-full p-4 text-center">
                <h1 className="text-6xl font-[Starter] font-bold text-transparent bg-clip-text bg-red-200 drop-shadow-[0_0_0.2em_red]">
                  FINALS
                </h1>
              </div>
            )}

          </div>
        
        {/* Black Box Overlay - Always Visible */}
        <div className="fixed inset-0 flex items-center justify-center bg-black/35 backdrop-blur-[1.5px] z-50">
      

{/* BAR TOP Container */}
<div className="fixed top-[18%] left-1/2 transform -translate-x-1/2 w-full">
  {/* BAR TOP Image */}
  <img
    src="/images/Top 5/BAR TOP.png"
    alt="BAR TOP"
    className="w-full"
  />

  {/* "TOP 5" Text in the center of the image */}
  <div className="absolute top-1/2 left-[43%] transform -translate-x-1/2 -translate-y-1/2 flex justify-center">
    <h1 className="text-9xl font-[Starter] text-white bg-clip-text font-bold bg-red-200 drop-shadow-[0_0_0.1em_white]">
      TOP 5
    </h1>
  </div>
</div>


      {/* Podium Container - In the center, between the bars */}

      <div className="fixed top-[50%] left-[43%] transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex justify-center space-x-4">
          <img src="/images/Top 5/Podium/1.png" alt="Podium1" className="podium" />
          <img src="/images/Top 5/Podium/2.png" alt="Podium2" className="podium" />
          <img src="/images/Top 5/Podium/3.png" alt="Podium3" className="podium" />
          <img src="/images/Top 5/Podium/4.png" alt="Podium4" className="podium" />
          <img src="/images/Top 5/Podium/5.png" alt="Podium5" className="podium" />
        </div>
      </div>

      {/* BAR BOT - Positioned below the podiums */}
      <img
        src="/images/Top 5/BAR BOT.png"
        alt="BAR BOT"
        className="absolute top-[70%] left-1/2 transform -translate-x-1/2 w-full"
      />

</div>


        </div>
        
        <div className='flex flex-col w-3/20 space-y-[5%]'>
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

// Sidebar
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