import './App.css';
import { useEffect, useState } from 'react';
import { College } from './types';

const buttonStyles = `shrink p-[1%] bg-white hover:bg-gray-200 cursor-pointer m-[1%] rounded-xl border-2 border-gray-300 font-semibold text-gray-700 shadow-sm disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white h-14 flex items-center justify-center`;
export default function ControlView() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('Eliminations');
  const [division, setDivision] = useState('Teams');
  const [displayedColleges, setDisplayedColleges] = useState<College[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Load colleges - fetch fresh data from main process
  const fetchColleges = async () => {
    const allColleges = await window.ipcRenderer.invoke('get-colleges');
    setColleges(allColleges);
    return allColleges;
  };

  // Load colleges initially
  useEffect(() => {
    console.log('Getting colleges...');
    fetchColleges().then((allColleges) => {
      setDisplayedColleges(allColleges);
    });
  }, []);

  // Function to check if we're in Eliminations mode and scores are all 0
  const checkAndUpdateDisplayedColleges = async () => {
    if (category === 'Eliminations') {
      const allColleges = await fetchColleges();
      setDisplayedColleges(allColleges);
      console.log('Refreshed college list in Eliminations mode');
    }
  };

  // Function to get top 5 colleges - used in multiple places
  function getTopFiveColleges() {
    // Get the top 5 colleges based on score
    const topFiveColleges = [...colleges]
      .sort((a: College, b: College) => b.score - a.score)
      .slice(0, 5)
      .filter((college: College) => college.score > 0);

    return topFiveColleges;
  }

  // File: src/ControlView.tsx
  // Inside the useEffect hook that watches for category changes

  useEffect(() => {
    const changeCategory = async () => {
      // Get the latest data from main process
      const allColleges = await fetchColleges();

      if (category === 'Eliminations') {
        // Always show all colleges in Eliminations mode
        setDisplayedColleges(allColleges);
        console.log('Switched to Eliminations mode, showing all colleges');
      } else if (category === 'Finals') {
        // Get top 5 colleges
        const topFiveColleges = getTopFiveColleges();
        if (topFiveColleges.length === 5) {
          // Reset scores to 0 for the top five colleges before displaying
          const resetTopFiveColleges = topFiveColleges.map((college) => ({
            ...college,
            score: 0,
          }));

          // Update scores in the displayed colleges
          setDisplayedColleges(resetTopFiveColleges);

          // Reset scores in the main colleges state
          setColleges((prev) =>
            prev.map((college) =>
              resetTopFiveColleges.some((c) => c.id === college.id)
                ? { ...college, score: 0 }
                : college
            )
          );

          console.log(
            'Switched to Finals mode, showing top 5 colleges with reset scores'
          );

          // Update the top five colleges in main process WITHOUT showing leaderboard
          await window.ipcRenderer.invoke(
            'update-top-five',
            resetTopFiveColleges
          );
        } else {
          alert('Need 5 colleges with scores to enter Finals mode');
          setCategory('Eliminations');
          return;
        }
      }

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

  useEffect(() => {
    const changeDivision = async () => {
      await window.ipcRenderer.invoke('sync-division', division);
      console.log(`Division changed to: ${division}`);
    };
    changeDivision();
  }, [division]);

  // Update colleges on change
  // ...then sync to DB
  async function updateScore(
    college: College,
    offset: number,
    adjustRadius: boolean = false
  ) {
    let newScore = college.score + offset;
    if (newScore < 0) newScore = 0; // Prevent negative scores
    const collegeUpdated = { ...college, score: newScore };

    // Update in both colleges arrays
    setColleges(
      colleges.map((x: College) =>
        x.name === collegeUpdated.name ? collegeUpdated : x
      )
    );

    setDisplayedColleges(
      displayedColleges.map((x: College) =>
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

  // Confirmation handlers
  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleRefreshClick = () => {
    setShowRefreshConfirm(true);
  };

  const handleConfirmReset = () => {
    setShowResetConfirm(false);
    performResetScores();
  };

  const handleConfirmRefresh = () => {
    setShowRefreshConfirm(false);
    performRefresh();
  };

  const handleCancelDialog = () => {
    setShowResetConfirm(false);
    setShowRefreshConfirm(false);
  };

  // Actual operations after confirmation
  async function performResetScores() {
    // Reset scores in both college arrays
    setColleges(colleges.map((x: College) => ({ ...x, score: 0 })));
    setDisplayedColleges(
      displayedColleges.map((x: College) => ({ ...x, score: 0 }))
    );
    await window.ipcRenderer.invoke('reset-scores');

    // Always fetch and display all colleges after resetting scores
    const allColleges = await fetchColleges();
    setDisplayedColleges(allColleges);
    console.log('Scores reset, refreshed college list');

    // If we're in Eliminations mode, make sure to sync the category to ensure
    // all processing is complete
    if (category === 'Eliminations') {
      await window.ipcRenderer.invoke('sync-category', 'Eliminations');
    }
  }

  async function performRefresh() {
    // Get fresh data
    const allColleges = await fetchColleges();

    // Update displayed colleges based on current mode
    if (category === 'Eliminations') {
      setDisplayedColleges(allColleges);
    } else {
      // In Finals mode, show only top 5 colleges
      const topFiveColleges = allColleges
        .sort((a: College, b: College) => b.score - a.score)
        .slice(0, 5)
        .filter((college: College) => college.score > 0);

      if (topFiveColleges.length === 5) {
        setDisplayedColleges(topFiveColleges);
      }
    }

    await window.ipcRenderer.invoke('refresh');
    console.log('Application refreshed');
  }

  async function toggleLeaderboard() {
    if (showLeaderboard) {
      setShowLeaderboard(false);
      // Invoke the main process to close the leaderboard
      await window.ipcRenderer.invoke('close-top-five');
      console.log('Leaderboard closed.');
    } else {
      setShowLeaderboard(true);

      // 5 if elims, 3 if finals
      // will rename later for clarity
      const topFiveColleges = getTopFiveColleges();

      // Check if there are fewer than 5 colleges with scores
      if (topFiveColleges.length < 5 && category !== 'Finals') {
        alert(
          'There are fewer than 5 colleges with scores. Please ensure at least 5 colleges have scores before showing the leaderboard.'
        );
        setShowLeaderboard(false);
        return; // Stop execution if the condition is not met
      } else if (topFiveColleges.length < 3 && category === 'Finals') {
        alert(
          'There are fewer than 3 colleges with scores. Please ensure at least 3 colleges have scores before showing the leaderboard.'
        );
        setShowLeaderboard(false);
        return; // Stop execution if the condition is not met
      }

      // Send the top 5 colleges to main process for leaderboard display only
      // This should NOT affect the category/mode
      if (category !== 'Finals') {
        await window.ipcRenderer.invoke('show-top-five', topFiveColleges);
      } else {
        await window.ipcRenderer.invoke('show-top-three', topFiveColleges);
      }

      // Also log in the control view console
      console.log('TOP 5 COLLEGES:');
      topFiveColleges.forEach((college, index) => {
        console.log(`${index + 1}. ${college.shorthand} (${college.name})`);
      });
    }
  }

  // Set up listener for scores-reset event from main process
  useEffect(() => {
    const handleScoresReset = async () => {
      console.log('Scores reset event received');
      // Get fresh data and refresh display
      await checkAndUpdateDisplayedColleges();
    };

    // Add event listener
    window.ipcRenderer.on('scores-reset', handleScoresReset);

    // Clean up listener on component unmount
    return () => {
      window.ipcRenderer.removeAllListeners('scores-reset');
    };
  }, [category]); // Re-apply when category changes

  return (
    <div
      className='bg-[#232333] absolute top-0 left-0 min-h-full w-full justify-start items-center flex flex-col'
      style={{ width: '100%', height: '100%', overflow: 'auto' }}
    >
      {/* Confirmation Dialog for Reset */}
      {showResetConfirm && (
        <div className='fixed inset-0 bg-transparent z-50 flex items-center justify-center'>
          <div className='absolute inset-0 bg-gray-900 opacity-40'></div>
          <div className='bg-white p-6 rounded-xl shadow-lg max-w-md z-10'>
            <h2 className='text-xl font-bold mb-4'>Confirm Reset</h2>
            <p className='mb-6'>
              Are you sure you want to reset all scores to 0?
            </p>
            <div className='flex justify-center space-x-4'>
              <button
                className='px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400'
                onClick={handleCancelDialog}
              >
                Cancel
              </button>
              <button
                className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600'
                onClick={handleConfirmReset}
              >
                Yes, Reset Scores
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Refresh */}
      {showRefreshConfirm && (
        <div className='fixed inset-0 bg-transparent z-50 flex items-center justify-center'>
          <div className='absolute inset-0 bg-gray-900 opacity-40'></div>
          <div className='bg-white p-6 rounded-xl shadow-lg max-w-md z-10'>
            <h2 className='text-xl font-bold mb-4'>Confirm Refresh</h2>
            <p className='mb-6'>
              Are you sure you want to refresh the application?
            </p>
            <div className='flex justify-center space-x-4'>
              <button
                className='px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400'
                onClick={handleCancelDialog}
              >
                Cancel
              </button>
              <button
                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
                onClick={handleConfirmRefresh}
              >
                Yes, Refresh
              </button>
            </div>
          </div>
        </div>
      )}

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
          <div className='grid grid-cols-2 w-4/9 mr-4 gap-2'>
            <button className={buttonStyles} onClick={handleResetClick}>
              Reset Scores
            </button>
            <button className={buttonStyles} onClick={handleRefreshClick}>
              Refresh
            </button>
            <button
              className={buttonStyles + ' col-span-2'}
              onClick={toggleLeaderboard}
              disabled={
                (category !== 'Finals' && getTopFiveColleges().length < 5) ||
                (category === 'Finals' && getTopFiveColleges().length < 3)
              }
            >
              Toggle Leaderboard
            </button>
          </div>
        </div>
      </div>

      <div className='w-[90%] flex flex-col items-center justify-center'>
        <div className='text-white w-full p-2 m-1 rounded-xl flex flex-row items-center justify-between'>
          <span className='flex flex-row items-center justify-between w-full'>
            <h1 className='text-4xl font-bold'>College</h1>
            <h1 className='text-4xl font-bold'>Score</h1>
          </span>
        </div>

        {/* Single Column Layout - No Scrolling */}
        <div className='w-full flex flex-col gap-1'>
          {displayedColleges.map((college: College) => (
            <div
              className='bg-white border-2 border-gray-300 w-full px-2 py-1 rounded-xl flex flex-row items-center justify-between'
              key={college.id}
            >
              <div className='flex flex-row items-center'>
                <h2 className='font-bold text-sm'>{college.name}</h2>
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

  const styles = `py-1 px-3 rounded-xl m-1 text-sm ${
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
    <div className='relative w-52 h-[50%] p-2'>
      {/* Dropdown button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='w-full font-semibold py-2 p-2 bg-white border-2 border-gray-300 rounded-xl flex justify-between items-center cursor-pointer'
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
