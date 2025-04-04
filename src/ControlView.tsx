import './App.css';
import { useEffect, useState } from 'react';
import { College } from './types';

export default function ControlView() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('Eliminations');
  const [selectedColleges, setSelectedColleges] = useState<College[]>([]);

  // Load colleges
  useEffect(() => {
    const getColleges = async () => {
      setColleges(await window.ipcRenderer.invoke('get-colleges'));
    };
    console.log('Getting colleges...');
    getColleges();
  }, []);

  // Check for existing top 5 on load
  useEffect(() => {
    const getTop5 = async () => {
      const topFive = await window.ipcRenderer.invoke('get-top5');
      if (topFive && topFive.length > 0) {
        setSelectedColleges(topFive);
      }
    };
    getTop5();
  }, []);

  useEffect(() => {
    const changeCategory = async () => {
      // Send the top 5 colleges when changing category
      const result = await window.ipcRenderer.invoke('sync-category', category);
      console.log('Category changed to:', category, 'Result:', result);
      
      // When switching to finals, make sure we show the selected colleges
      if (category === 'Finals' && selectedColleges.length > 0) {
        await window.ipcRenderer.invoke('show-top5', selectedColleges);
      }
    };
    changeCategory();
  }, [category, selectedColleges]);

  useEffect(() => {
    const changeDifficulty = async () => {
      await window.ipcRenderer.invoke('sync-difficulty', difficulty);
      console.log(`Difficulty changed to: ${difficulty}`);
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
    
    // Also update the score in selectedColleges if it exists there
    setSelectedColleges(
      selectedColleges.map((x: College) =>
        x.shorthand === collegeUpdated.shorthand ? { ...x, score: collegeUpdated.score } : x
      )
    );
    
    await window.ipcRenderer.invoke(
      'update-college-score',
      collegeUpdated.shorthand,
      collegeUpdated.score
    );
  }

  async function resetScores() {
    setColleges(colleges.map((x: College) => ({ ...x, score: 0 })));
    setSelectedColleges(selectedColleges.map((x: College) => ({ ...x, score: 0 })));
    await window.ipcRenderer.invoke('reset-scores');
  }

  async function refresh() {
    await window.ipcRenderer.invoke('refresh');
  }

  // Handle college selection (max 5)
  const handleCollegeSelect = (college: College) => {
    setSelectedColleges(current => {
      // If already selected, remove it
      if (current.some(c => c.id === college.id)) {
        return current.filter(c => c.id !== college.id);
      }
      
      // If 5 already selected, don't add more
      if (current.length >= 5) {
        return current;
      }
      
      // Otherwise add it
      return [...current, college];
    });
    
    // Log the selection
    console.log(`College selected: ${college.shorthand}`);
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.dataTransfer.setData('collegeIndex', index.toString());
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // Handle drop to reorder colleges
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('collegeIndex'));
    
    if (dragIndex === dropIndex) return;
    
    const reorderedColleges = [...selectedColleges];
    const draggedCollege = reorderedColleges[dragIndex];
    
    // Remove dragged college
    reorderedColleges.splice(dragIndex, 1);
    
    // Insert at new position
    reorderedColleges.splice(dropIndex, 0, draggedCollege);
    
    setSelectedColleges(reorderedColleges);
  };

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
            className='bg-black p-2 text-white rounded-xl border-4 border-red-900'
            onClick={resetScores}
          >
            Reset Scores
          </button>
          <button
            className='bg-black p-2 text-white rounded-xl border-4 border-red-900'
            onClick={refresh}
          >
            Refresh
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
              <th>Select</th>
              <th colSpan={2}>Score</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((college: College, index: number) => (
              <tr key={college.id}>
                <td>{index + 1}</td>
                <td>{college.name}</td>
                <td>
                  <input 
                    type="checkbox"
                    checked={selectedColleges.some(c => c.id === college.id)}
                    onChange={() => handleCollegeSelect(college)}
                    disabled={selectedColleges.length >= 5 && !selectedColleges.some(c => c.id === college.id)}
                  />
                </td>
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

      <div className='h-1/10 w-full bg-gray-300 flex flex-row p-4 space-x-[1%]'>
        <button 
          className='bg-black p-2 text-white rounded-xl border-4 border-red-900'
          onClick={async () => {
            // Send the top 5 colleges to main process
            await window.ipcRenderer.invoke('show-top5', selectedColleges);
            
            // If we're already in Finals mode, immediately refresh to show top 5
            if (category === 'Finals') {
              await window.ipcRenderer.invoke('sync-category', 'Finals');
            }
            
            // Also log in the control view console
            console.log("TOP 5 COLLEGES:");
            selectedColleges.forEach((college, index) => {
              console.log(`${index + 1}. ${college.shorthand} (${college.name})`);
            });
          }}
        >
          Show Leaderboard
        </button>
        
        {/* Drag and drop area for selected colleges */}
        <div className='flex flex-row space-x-2 flex-grow'>
          {selectedColleges.map((college, index) => (
            <div
              key={college.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              className='p-2 bg-black text-white rounded border-2 border-red-900 cursor-move flex flex-col items-center'
            >
              <div>{index + 1}</div>
              <div>{college.shorthand}</div>
            </div>
          ))}
        </div>
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