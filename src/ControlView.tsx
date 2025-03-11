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
      <div className='h-1/10 w-4/5 bg-gray-300 flex flex-row p-4 space-x-[1%] sharp-edge-box [--bottom-right:20px] [--bottom-left:20px]'>
        <select
          id='category'
          onChange={(e) => setCategory(e.target.value)}
          defaultValue={category}
        >
          <option value='Eliminations'>Eliminations</option>
          <option value='Finals'>Finals</option>
        </select>
        <select
          id='difficulty'
          onChange={(e) => setDifficulty(e.target.value)}
          defaultValue={difficulty}
        >
          <option value='Easy'>Easy</option>
          <option value='Average'>Average</option>
          <option value='Difficult'>Difficult</option>
          <option value='Clincher'>Clincher</option>
          <option value='Sudden Death'>Sudden Death</option>
        </select>
        <button>Reset Scores</button>
        <button>Refresh</button>
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

interface ScoreButtonProps {
  college: College;
  add: boolean;
  difficulty: string;
  updateScore: (college: College, offset: number) => void;
}
function ScoreButton(props: ScoreButtonProps) {
  const college: College = props.college;
  const add: boolean = props.add;
  const difficulty: string = props.difficulty;
  const updateScore = props.updateScore;

  const changeScore = () => {
    let offset: number;
    switch (difficulty) {
      case 'Easy':
        offset = 5;
        break;
      case 'Average':
        offset = 10;
        break;
      case 'Difficult':
        offset = 15;
        break;
      default:
        offset = 1;
        break;
    }
    offset *= add ? 1 : -1;
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
