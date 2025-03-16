import './App.css';
import { useEffect, useState } from 'react';
import { College } from './types';

function MainView() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [difficulty, setDifficulty] = useState<string>('');
  const [category, setCategory] = useState<string>('');

  const getColleges = async () => {
    return await window.ipcRenderer.invoke('get-colleges');
  };

  // Listen for updates
  useEffect(() => {
    window.ipcRenderer.removeAllListeners('db-updated');
    window.ipcRenderer.removeAllListeners('category-synced');
    window.ipcRenderer.removeAllListeners('difficulty-synced');

    window.ipcRenderer.once('db-updated', () => {
      getColleges().then((colleges) => {
        setColleges(colleges);
      });
    });
    window.ipcRenderer.once('category-synced', (_, category) => {
      setCategory(category);
    });
    window.ipcRenderer.once('difficulty-synced', (_, difficulty) => {
      setDifficulty(difficulty);
    });
  }, [colleges, category, difficulty]);

  // Initial load
  useEffect(() => {
    const retrieveCategoryAndDifficulty = async () => {
      await window.ipcRenderer.invoke('sync-category');
      await window.ipcRenderer.invoke('sync-difficulty');
    };
    retrieveCategoryAndDifficulty();

    getColleges().then((colleges) => setColleges(colleges));
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
              <div key={college.id} className='flex flex-row space-x-4'>
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
                <span className='text-4xl font-[Starter]'>
                  {college.shorthand}
                </span>
              </div>
            ))}
          </div>
          {/* Main */}
          <div
            className='sharp-edge-box w-full
            flex flex-col
            [--all:10px]
            [--border-width:2px] border-[2px]
            [--border-color:var(--red)] border-[var(--red)]'
          ></div>
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
