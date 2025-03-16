import './App.css';
import { useEffect, useState } from 'react';
import { College } from './types';

export default function ControlView() {
  const [colleges, setColleges] = useState<College[]>([]);
  // const [leaderboard, setLeaderboard] = useState<College[]>([]);
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
      await window.ipcRenderer.invoke('sync-category', category);
    };
    changeCategory();
  }, [category]);

  useEffect(() => {
    const changeDifficulty = async () => {
      await window.ipcRenderer.invoke('sync-difficulty', difficulty);
    };
    changeDifficulty();
  }, [difficulty]);

  // Update colleges on change
  // ...then sync to DB
  async function updateScore(college: College, offset: number) {
    const collegeUpdated = { ...college, score: college.score + offset };
    setColleges(
      colleges.map((x: College) =>
        x.name === collegeUpdated.name ? collegeUpdated : x
      )
    );
    await window.ipcRenderer.invoke(
      'update-college-score',
      collegeUpdated.shorthand,
      collegeUpdated.score
    );
  }

  return (
    <div className='w-screen h-screen justify-center items-center flex flex-col'>
      <div className='h-1/10 w-4/5 flex flex-col'>
        <div className='flex flex-row bg-gray-300 w-full justify-evenly'>
          <Dropdown
            options={['Eliminations', 'Finals']}
            onChange={(selected) => {
              setCategory(selected);
            }}
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
          />
          <button>Reset Scores</button>
          <button>Refresh</button>
        </div>
        <div className='bg-gray-300 h-1/4 sharp-edge-box [--bottom-left:2.5px] [--bottom-right:2.5px]'></div>
      </div>

      <div className='h-4/5 w-3/5 mx-[20%]'>
        <table className='w-full h-full'>
          <thead>
            <tr>
              <th>Rank</th>
              <th>College</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((college: College, index: number) => (
              <tr>
                <td>{index + 1}</td>
                <td>{college.name}</td>
                <td>
                  <div className='flex flex-row space-x-4'>
                    <span>{college.score}</span>
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='h-1/10 bg-gray-300 flex flex-row p-4 space-x-[1%]'>
        <button>Show Leaderboard</button>
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
  updateScore: (college: College, offset: number) => void;
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
          default:
            return 1;
        }
      })() * (add ? 1 : -1);
    updateScore(college, offset);
  };

  const styles = `p-2 ${
    add ? 'bg-green-500 hover:bg-green-700' : 'bg-red-500 hover:bg-red-700'
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
}: {
  options: string[];
  onChange?: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selected, setSelected] = useState<string>(options[0]);

  const handleSelect = (option: string) => {
    setSelected(option);
    setIsOpen(false);
    if (onChange) onChange(option);
  };

  return (
    <div className='relative w-64'>
      {/* Dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full p-2 bg-white border rounded flex justify-between items-center'
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
