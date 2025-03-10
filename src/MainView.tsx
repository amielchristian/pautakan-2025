import './App.css';
import ScoreBox from './components/ScoreBox';
import Sidebar from './components/Sidebar';
import { useEffect, useState } from 'react';

interface College {
  id: number;
  name: string;
  shorthand: string;
  imagePath: string;
}

function MainView() {
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    const getColleges = async () => {
      setColleges(await window.ipcRenderer.invoke('getColleges'));
    };
    console.log('Getting colleges...');
    getColleges();
  }, []);

  return (
    <>
      {/* Body - flex row */}
      <div className='bg-gray-300 flex flex-row h-screen w-screen p-4 space-x-[1%]'>
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
            [--border-color:#f00] border-[#f00]'
          >
            {colleges.map((college: College) => (
              <div className='flex flex-row space-x-4'>
                <ScoreBox />
                <span className='text-4xl'>{college.shorthand}</span>
              </div>
            ))}
          </div>
          {/* Main */}
          <div
            className='sharp-edge-box w-full
            flex flex-col
            [--all:10px]
            [--border-width:2px] border-[2px]
            [--border-color:#f00] border-[#f00]'
          ></div>
        </div>
        <div className='flex flex-col w-3/20 space-y-[5%]'>
          <Sidebar />
        </div>
      </div>
    </>
  );
}

export default MainView;
