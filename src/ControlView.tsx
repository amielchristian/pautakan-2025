import './App.css';
import { useEffect, useState } from 'react';
import { College } from './types';

export default function ControlView() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('Eliminations');

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
  async function updateScore(college: College, offset: number, adjustRadius: boolean = false) {
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

  async function showLeaderboard() {
    // Get the top 5 colleges based on score
    const topFiveColleges = [...colleges]
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .filter(college => college.score > 0);
    
    // Check if there are fewer than 5 colleges with scores
    if (topFiveColleges.length < 5) {
      alert("There are fewer than 5 colleges with scores. Please ensure at least 5 colleges have scores before showing the leaderboard.");
      return; // Stop execution if the condition is not met
    }
    
    // Send the top 5 colleges to main process
    await window.ipcRenderer.invoke('show-top5', topFiveColleges);
    
    // If we're already in Finals mode, immediately refresh to show top 5
    if (category === 'Finals') {
      await window.ipcRenderer.invoke('sync-category', 'Finals');
    }
    
    // Also log in the control view console
    console.log("TOP 5 COLLEGES:");
    topFiveColleges.forEach((college, index) => {
      console.log(`${index + 1}. ${college.shorthand} (${college.name})`);
    });
  }

  async function closeLeaderboard() {
    // Invoke the main process to close the leaderboard
    await window.ipcRenderer.invoke('close-top5');
    console.log("Leaderboard closed.");
  }

  return (
    <div className='grid-pattern bg-[image:var(--grid-pattern)] w-screen h-screen justify-center items-center flex flex-col'>
      <div className='h-1/10 w-full flex flex-col'>
        <div className='flex flex-row items-center bg-gray-300 h-full w-full justify-evenly'>
          <Dropdown
            options={['Eliminations', 'Finals']}
            onChange={(selected) => {
              setCategory(selected);
            }}
            initialValue={category}
          />
          <Dropdown
            options={[
              'Easy',
              'Average',
              'Difficult',
              'Clincher',
              'Sudden Death',
            ]}
            onChange={(selected) => {
              setDifficulty(selected);
            }}
            initialValue={difficulty}
          />
          <button
            className='bg-black p-2 text-white rounded-xl border-4 border-red-900 cursor-pointer'
            onClick={resetScores}
          >
            Reset Scores
          </button>
          <button
            className='bg-black p-2 text-white rounded-xl border-4 border-red-900 cursor-pointer'
            onClick={refresh}
          >
            Refresh
          </button>
          <button 
            className='bg-black p-2 text-white rounded-xl border-4 border-red-900 cursor-pointer'
            onClick={showLeaderboard}
          >
            Show Leaderboard
          </button>
          <button
            className="bg-black p-2 text-white rounded-xl border-4 border-red-900 cursor-pointer"
            onClick={closeLeaderboard}
          >
            Close Leaderboard
          </button>
        </div>
        <div className='bg-gray-300 h-1/4 sharp-edge-box [--bottom-left:2.5px] [--bottom-right:2.5px]'></div>
      </div>

      <div className='bg-white h-4/5 w-7/10 px-[5%] py-[2%]'>
        <table className='w-full'>
          <thead>
            <tr>
              <th>Rank</th>
              <th>College</th>
              <th colSpan={2}>Score</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((college: College, index: number) => (
              <tr key={college.id}>
                <td>{index + 1}</td>
                <td>{college.name}</td>
                <td>{college.score}</td>
                <td>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

{/* Bottom section removed as requested */}
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
  updateScore: (college: College, offset: number, adjustRadius?: boolean) => void;
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

  const styles = `p-2 ${
    add ? 'bg-green-500 hover:bg-green-700 cursor-pointer' : 'bg-red-500 hover:bg-red-700 cursor-pointer'
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
  options: string[];
  onChange?: (value: string) => void;
  initialValue?: string;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>(initialValue || options[0]);

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
    if (onChange) onChange(option);
  };

  return (
    <div className='relative w-64 h-[50%]'>
      {/* Dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full p-2 bg-white border rounded flex justify-between items-center cursor-pointer'
      >
        <span>{selected}</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className='overflow-visible absolute z-50 w-full mt-1 bg-white border rounded shadow'>
          <ul>
            {options.map((option) => (
              <li
                key={option}
                className='p-2 hover:bg-gray-100 cursor-pointer'
                onClick={() => handleSelect(option)}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}