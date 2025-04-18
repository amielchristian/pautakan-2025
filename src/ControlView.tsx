import './App.css';
import { useEffect, useState } from 'react';
import { College } from './types';

const buttonStyles = `shrink p-[1%] bg-white hover:bg-gray-200 cursor-pointer m-[1%] rounded-xl border-2 border-gray-300 font-semibold text-gray-700 shadow-sm disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white`;
export default function ControlView() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('Eliminations');
  const [division, setDivision] = useState('Teams');

  // Load colleges
  useEffect(() => {
    const getColleges = async () => {
      setColleges(await window.ipcRenderer.invoke('get-colleges'));
    };
    console.log('Getting colleges...');
    getColleges();
  }, []);

  useEffect(() => {
    const changeCategory = async () => {
      const result = await window.ipcRenderer.invoke('sync-category', category);
      console.log('Category changed to:', category, 'Result:', result);
    };
    changeCategory();
  }, [category]);

  useEffect(() => {
    const changeDifficulty = async () => {
      await window.ipcRenderer.invoke('sync-difficulty', difficulty);
      console.log(`Difficulty changed to: ${difficulty}`);
    };
    changeDifficulty();
  }, [difficulty]);

  // Update colleges on change
  // ...then sync to DB
  async function updateScore(
    college: College,
    offset: number,
    adjustRadius: boolean = false
  ) {
    const collegeUpdated = { ...college, score: college.score + offset };
    setColleges(
      colleges.map((x: College) =>
        x.name === collegeUpdated.name ? collegeUpdated : x
      )
    );

    await window.ipcRenderer.invoke(
      'update-college-score',
      collegeUpdated.shorthand,
      collegeUpdated.score,
      adjustRadius
    );
  }

  async function resetScores() {
    setColleges(colleges.map((x: College) => ({ ...x, score: 0 })));
    await window.ipcRenderer.invoke('reset-scores');
  }

  async function refresh() {
    await window.ipcRenderer.invoke('refresh');
  }

  function getTopFiveColleges() {
    // Get the top 5 colleges based on score
    const topFiveColleges = [...colleges]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .filter((college) => college.score > 0);

    return topFiveColleges;
  }

  async function showLeaderboard() {
    // Get the top 5 colleges based on score
    const topFiveColleges = getTopFiveColleges();

    // Check if there are fewer than 5 colleges with scores
    if (topFiveColleges.length < 5) {
      alert(
        'There are fewer than 5 colleges with scores. Please ensure at least 5 colleges have scores before showing the leaderboard.'
      );
      return; // Stop execution if the condition is not met
    }

    // Send the top 5 colleges to main process
    await window.ipcRenderer.invoke('show-top-five', topFiveColleges);

    // If we're already in Finals mode, immediately refresh to show top 5
    if (category === 'Finals') {
      await window.ipcRenderer.invoke('sync-category', 'Finals');
    }

    // Also log in the control view console
    console.log('TOP 5 COLLEGES:');
    topFiveColleges.forEach((college, index) => {
      console.log(`${index + 1}. ${college.shorthand} (${college.name})`);
    });
  }

  async function closeLeaderboard() {
    // Invoke the main process to close the leaderboard
    await window.ipcRenderer.invoke('close-top-five');
    console.log('Leaderboard closed.');
  }

  return (
    <div className='bg-[#232333] absolute top-0 left-0 min-h-full w-full justify-start items-center flex flex-col'>
      <div className='w-full flex flex-col p-[1%] bg-red-400'>
        <h1 className='text-6xl font-bold text-center text-white font-[Starter]'>
          Pautakan 2025
        </h1>
        <h1 className='text-4xl font-bold text-center text-white font-[Starter]'>
          Control View
        </h1>
        <div className='flex flex-row items-center justify-between'>
          <div className='flex flex-row w-4/9 items-center justify-evenly ml-4'>
            <Dropdown
              options={[
                { value: 'Eliminations' },
                { value: 'Finals', disabled: getTopFiveColleges().length < 5 },
              ]}
              onChange={(selected) => {
                setCategory(selected);
              }}
              initialValue={category}
            />
            <Dropdown
              options={[
                { value: 'Easy' },
                { value: 'Average' },
                { value: 'Difficult' },
                { value: 'Clincher' },
                { value: 'Sudden Death' },
              ]}
              onChange={(selected) => {
                setDifficulty(selected);
              }}
              initialValue={difficulty}
            />

            <Dropdown
              options={[{ value: 'Individual' }, { value: 'Teams' }]}
              onChange={(selected) => {
                setDivision(selected);
              }}
              initialValue={division}
            />
          </div>
          <div className='grid grid-cols-2 w-4/9 mr-4'>
            <button className={buttonStyles} onClick={resetScores}>
              Reset Scores
            </button>
            <button className={buttonStyles} onClick={refresh}>
              Refresh
            </button>
            <button
              className={buttonStyles}
              onClick={showLeaderboard}
              disabled={getTopFiveColleges().length < 5}
            >
              Show Leaderboard
            </button>
            <button
              className={buttonStyles}
              onClick={closeLeaderboard}
              disabled={getTopFiveColleges().length < 5}
            >
              Close Leaderboard
            </button>
          </div>
        </div>
      </div>

      <div className='w-7/10 px-[5%] flex flex-col items-center justify-center'>
        <div className='text-white w-full p-2 m-1 rounded-xl flex flex-row items-center justify-between'>
          <span className='flex flex-row items-center justify-between w-full'>
            <h1 className='text-4xl font-bold'>College</h1>
            <h1 className='text-4xl font-bold'>Score</h1>
          </span>
        </div>
        {colleges.map((college: College) => (
          <div className='bg-white border-2 border-gray-300 w-full px-2 m-[2px] rounded-xl flex flex-row items-center justify-between'>
            <div className='flex flex-row items-center'>
              <h2 className='font-bold'>{college.name}</h2>
            </div>
            <div className='flex flex-row items-center'>
              <h2 className='font-bold mr-2'>{college.score}</h2>
              <ScoreButton
                college={college}
                add={false}
                difficulty={difficulty}
                updateScore={updateScore}
              />
              <ScoreButton
                college={college}
                add={true}
                difficulty={difficulty}
                updateScore={updateScore}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScoreButton({
  college,
  add,
  difficulty,
  updateScore,
}: {
  college: College;
  add: boolean;
  difficulty: string;
  updateScore: (
    college: College,
    offset: number,
    adjustRadius?: boolean
  ) => void;
}) {
  const changeScore = () => {
    const offset: number =
      (function (): number {
        switch (difficulty) {
          case 'Easy':
            return 5;
          case 'Average':
            return 10;
          case 'Difficult':
            return 15;
          case 'Clincher':
            return 20;
          case 'Sudden Death':
            return 25;
          default:
            return 1;
        }
      })() * (add ? 1 : -1);

    // Only adjust radius when adding points, not when subtracting
    updateScore(college, offset, add);
  };

  const styles = `py-1 px-4 rounded-xl m-1 ${
    add
      ? 'bg-green-400 hover:bg-green-500 cursor-pointer'
      : 'bg-red-400 hover:bg-red-500 cursor-pointer'
  }`;
  return (
    <button className={styles} onClick={changeScore}>
      {add ? '+' : '-'}
    </button>
  );
}

function Dropdown({
  options,
  onChange,
  initialValue,
}: {
  options: DropdownOption[];
  onChange?: (value: string) => void;
  initialValue?: string;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>(
    initialValue || options[0].value
  );

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return; // Do nothing if the option is disabled
    setSelected(option.value);
    setIsOpen(false);
    if (onChange) onChange(option.value);
  };

  return (
    <div className='relative w-64 h-[50%] p-3'>
      {/* Dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full font-semibold py-3 p-2 bg-white border-2 border-gray-300 rounded-xl flex justify-between items-center cursor-pointer'
      >
        <span>{selected}</span>
        <span
          className={`ml-2 mr-1 text-xs duration-100 ${
            isOpen ? 'rotate-180 ' : ''
          }`}
        >
          ▼
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className='overflow-visible absolute z-50 w-full mt-1 bg-white border rounded shadow'>
          <ul>
            {options.map((option) => (
              <li
                key={option.value}
                className={`p-2 hover:bg-gray-100 ${
                  option.disabled
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-black cursor-pointer'
                }`}
                onClick={() => handleSelect(option)}
              >
                {option.value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface DropdownOption {
  value: string;
  disabled?: boolean;
}
