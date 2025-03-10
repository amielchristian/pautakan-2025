import './App.css';
import { useEffect, useState } from 'react';
import { College } from './types';

function MainView() {
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    const getColleges = async () => {
      setColleges(await window.ipcRenderer.invoke('get-colleges'));
    };
    console.log('Getting colleges...');
    getColleges();
  }, []);

  useEffect(() => {});

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
                <div
                  className='sharp-edge-box w-20 h-10 [--img:linear-gradient(#222,#111)] font-[DS-Digital] text-3xl
                  flex items-center justify-center
                  [--top-left:10px] [--bottom-right:10px]
                  [--border-width:2px] border-[2px]
                  [--border-color:#f00] border-[#f00]'
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

function CategoryDisplay(props: any) {
  const content: string = props.content;
  return (
    <div
      className='sharp-edge-box bg-black w-auto h-111/1280 [--bottom-left:20px] [--top-right:20px]
    [--img:linear-gradient(#222,#111)] font-[DS-Digital]
    text-4xl flex items-center justify-center
    [--border-width:2px] border-[2px]
    [--border-color:#f00] border-[#f00]'
    >
      {content}
    </div>
  );
}

function Sidebar(props: any) {
  const colleges: string[] = props.colleges || [
    './images/AB.png',
    './images/ACC.png',
    './images/ARKI.png',
  ];
  const difficulty: string = props.difficulty || 'Easy';
  const category: string = props.category || 'Individual';
  return (
    <>
      <div
        className='sharp-edge-box text-white text-4xl font-[Starter] font-bold
      flex items-center justify-center
      w-auto h-240/1280 [--all:20px] grid-pattern'
      >
        Pautakan 2025
      </div>
      <div className='sharp-edge-box w-auto h-460/1280 [--all:20px] grid-pattern justify-evenly'>
        {colleges.map((x) => (
          <div className='object-scale-down'>
            <img className='object-cover' src={x} />
          </div>
        ))}
      </div>
      <CategoryDisplay content={category} />
      <CategoryDisplay content={difficulty} />
    </>
  );
}

export default MainView;
