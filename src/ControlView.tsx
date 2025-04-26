import './App.css';
import { useEffect, useState } from 'react';
import { College } from './types';

const buttonStyles = `shrink p-[1%] bg-white hover:bg-gray-200 cursor-pointer m-[1%] rounded-xl border-2 border-gray-300 font-semibold text-gray-700 shadow-sm disabled:cursor-not-allowed disabled:text-gray-300 disabled:hover:bg-white h-14 flex items-center justify-center`;
export default function ControlView() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [inCollegeSelectionMode, setInCollegeSelectionMode] = useState(false);
  const [difficulty, setDifficulty] = useState('Easy');
  const [category, setCategory] = useState('Eliminations');
  const [division, setDivision] = useState('Teams');
  const [displayedColleges, setDisplayedColleges] = useState<College[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRefreshConfirm, setShowRefreshConfirm] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [inClincherRound, setInClincherRound] = useState(false);
  // Add state for tracking college rankings
  const [collegeRankings, setCollegeRankings] = useState<{[key: string]: string}>({});
  // Add state to track selected colleges for leaderboard
  const [selectedColleges, setSelectedColleges] = useState<{[key: string]: boolean}>({});
  // Error message for leaderboard validation
  const [leaderboardError, setLeaderboardError] = useState('');
  // Add state for category errors
  const [categoryError, setCategoryError] = useState('');
  
  // Function to handle rank selection
  const handleRankChange = (collegeId: string, rank: string) => {
    // Create a copy of the current rankings
    const updatedRankings = { ...collegeRankings };
    
    // If this rank is already assigned to another college, clear that assignment
    Object.keys(updatedRankings).forEach(id => {
      if (updatedRankings[id] === rank) {
        delete updatedRankings[id];
      }
    });
    
    // Assign the new rank
    updatedRankings[collegeId] = rank;
    
    // Update the state
    setCollegeRankings(updatedRankings);
    
    console.log(`College ID ${collegeId} ranked as ${rank}`);
  };

  // Function to handle college selection via checkbox
  const handleCollegeSelection = (collegeId: string, isSelected: boolean) => {
    // Create a copy of the current selections
    const updatedSelections = { ...selectedColleges };
    
    // Update the selection state
    updatedSelections[collegeId] = isSelected;
    
    // If unselecting a college, also remove its ranking
    if (!isSelected && collegeRankings[collegeId]) {
      const updatedRankings = { ...collegeRankings };
      delete updatedRankings[collegeId];
      setCollegeRankings(updatedRankings);
    }
    
    // Update the state
    setSelectedColleges(updatedSelections);
    
    console.log(`College ID ${collegeId} selection: ${isSelected}`);
  };

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


  // Function to validate leaderboard requirements
  function validateLeaderboardRequirements() {
  // Get selected colleges from the currently displayed colleges
  const selectedCollegeIds = Object.keys(selectedColleges).filter(id => selectedColleges[id]);
  
  // Filter to only include colleges that are currently displayed
  const displayedSelectedIds = displayedColleges
    .filter(college => selectedCollegeIds.includes(String(college.id)))
    .map(college => String(college.id));
  
  // Check if we have the required number of colleges
  const requiredCount = category === 'Finals' ? 3 : 5;
  if (displayedSelectedIds.length !== requiredCount) {
    return `You must select exactly ${requiredCount} colleges from the current display for ${category} mode leaderboard.`;
  }
  
  // Check if all selected colleges have ranks
  const unrankedColleges = displayedSelectedIds.filter(id => !collegeRankings[id]);
  
  if (unrankedColleges.length > 0) {
    return `All selected colleges must have a rank assigned.`;
  }
  
  // Check if all required ranks are used
  const maxRank = category === 'Finals' ? 3 : 5;
  const usedRanks = new Set();
  
  // Collect all used ranks from currently displayed and selected colleges
  displayedSelectedIds.forEach(id => {
    const rank = collegeRankings[id];
    if (rank) usedRanks.add(rank);
  });
  
  for (let i = 1; i <= maxRank; i++) {
    const rankValue = i === 1 ? '1st' : i === 2 ? '2nd' : i === 3 ? '3rd' : i === 4 ? '4th' : '5th';
    if (!usedRanks.has(rankValue)) {
      return `Rank "${rankValue}" must be assigned to a college.`;
    }
  }
  
  if (usedRanks.size !== maxRank) {
    return `All ranks from 1st to ${maxRank === 3 ? '3rd' : '5th'} must be used exactly once.`;
  }
  
  return ''; // No error
}

  const toggleLeaderboard = async () => {
  if (showLeaderboard) {
    setShowLeaderboard(false);
    setLeaderboardError('');
    await window.ipcRenderer.invoke('close-top-five');
    console.log('Leaderboard closed.');
  } else {
    // Validate leaderboard requirements
    const error = validateLeaderboardRequirements();
    
    if (error) {
      setLeaderboardError(error);
      alert(error);
      return;
    }
    
    // Clear any previous errors
    setLeaderboardError('');
    
    // Get selected colleges from the currently displayed colleges
    const selectedCollegeIds = Object.keys(selectedColleges).filter(id => selectedColleges[id]);
    
    // Only use colleges that are currently displayed
    const selectedCollegesList = displayedColleges.filter(college => 
      selectedCollegeIds.includes(String(college.id))
    );
    
    // Sort by their manual rankings
    const sortedSelectedColleges = [...selectedCollegesList].sort((a, b) => {
      const rankA = collegeRankings[String(a.id)] || '';
      const rankB = collegeRankings[String(b.id)] || '';
      
      // Map ranks to numeric values for sorting
      const getRankValue = (rank: string) => {
        switch (rank) {
          case '1st': return 1;
          case '2nd': return 2;
          case '3rd': return 3;
          case '4th': return 4;
          case '5th': return 5;
          default: return 999;
        }
      };
      
      return getRankValue(rankA) - getRankValue(rankB);
    });
    
    setShowLeaderboard(true);
    
    console.log('Showing leaderboard for:', sortedSelectedColleges);
    
    if (category !== 'Finals') {
      await window.ipcRenderer.invoke('show-top-five', sortedSelectedColleges);
    } else {
      await window.ipcRenderer.invoke('show-top-three', sortedSelectedColleges);
    }
    
    // Log in the control view console
    console.log('DISPLAYING LEADERBOARD:');
    sortedSelectedColleges.forEach((college) => {
      const rank = collegeRankings[String(college.id)];
      console.log(`${rank}: ${college.shorthand} (${college.name})`);
    });
  }
};

// Inside the useEffect hook that watches for category changes
useEffect(() => {
  const changeCategory = async () => {
    // Get the latest data from main process
    const allColleges = await fetchColleges();
    
    // Special handling for Finals mode
    if (category === 'Finals') {
      // Validate we have at least one college selected
      const selectedCollegeIds = Object.keys(selectedColleges).filter(id => selectedColleges[id]);
      
      if (selectedCollegeIds.length === 0) {
        setCategoryError('You must select colleges using the checkboxes before switching to Finals mode.');
        setCategory('Eliminations');
        
        // Show all colleges in Eliminations mode
        setDisplayedColleges(allColleges);
        console.log('Switched back to Eliminations mode - no colleges selected for Finals');
        
        // Notify the main process about the category change
        await window.ipcRenderer.invoke('sync-category', 'Eliminations');
        return;
      }
      
      // Get the selected colleges
      const selectedCollegesList = allColleges.filter((college: College) => 
        selectedCollegeIds.includes(String(college.id))
      );
      
      // Reset scores to 0 for selected colleges when switching to Finals
      const resetCollegesList = selectedCollegesList.map((college: College) => ({
        ...college,
        score: 0
      }));
      
      // Update both college arrays with reset scores
      setColleges(
        colleges.map((college: College) => 
          selectedCollegeIds.includes(String(college.id)) 
          ? { ...college, score: 0 } 
          : college
        )
      );
      
      // Use the selected colleges with reset scores for Finals
      setDisplayedColleges(resetCollegesList);
      
      console.log(`Switched to Finals mode with selected colleges, scores reset to 0:`, 
        resetCollegesList.map((c: College) => c.shorthand).join(', '));
      
      // Notify the main process about the category change and colleges with reset scores
      await window.ipcRenderer.invoke('sync-category', 'Finals', resetCollegesList);
      
      // Reset scores in the database
      await window.ipcRenderer.invoke('reset-selected-scores', selectedCollegeIds);
      
      return;
    }
    
    // For Eliminations mode - show all colleges
    if (category === 'Eliminations') {
      // Clear any category errors
      setCategoryError('');
      
      // IMPORTANT: Clear all selections when switching back to Eliminations
      setSelectedColleges({});
      setCollegeRankings({});
      
      // Show all colleges - this is critical to display all 16 original colleges
      setDisplayedColleges(allColleges);
      console.log(`Switched to ${category} mode, showing all colleges and cleared all selections`);
      
      // Notify the main process about category change
      await window.ipcRenderer.invoke('sync-category', category);
    }
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
  
    // If we're in clincher mode, exit it
    if (inClincherRound) {
      setInClincherRound(false);
      console.log('Exited Clincher round due to score reset');
    }
  
    // If we're in Eliminations mode, make sure to sync the category to ensure
    // all processing is complete
    if (category === 'Eliminations') {
      await window.ipcRenderer.invoke('sync-category', 'Eliminations');
    }
    
    // Close leaderboard when scores are reset
    if (showLeaderboard) {
      setShowLeaderboard(false);
      await window.ipcRenderer.invoke('close-top-five');
    }
    
    // Explicitly clear all selections and rankings
    setCollegeRankings({});
    setSelectedColleges({});
    console.log('Cleared all college selections and rankings');
  }
  
  async function performRefresh() {
    // Get fresh data
    const allColleges = await fetchColleges();
    
    // Always display all colleges after refresh
    setDisplayedColleges(allColleges);

    await window.ipcRenderer.invoke('refresh');
    console.log('Application refreshed');
  }

  // Function to confirm clincher college selection
  async function confirmClincherCollegeSelection() {
    // Get all selected colleges
    const selectedCollegeIds = Object.keys(selectedColleges).filter(id => selectedColleges[id]);
    
    if (selectedCollegeIds.length === 0) {
      alert('Please select at least one college for the clincher round.');
      return;
    }
    
    // Filter displayed colleges to only show the selected ones
    const selectedClincherColleges = displayedColleges.filter(college => 
      selectedCollegeIds.includes(String(college.id))
    );
    
    // Exit selection mode
    setInCollegeSelectionMode(false);
    
    // Enter clincher mode with selected colleges
    setInClincherRound(true);
    
    // Update displayed colleges to only show selected ones
    setDisplayedColleges(selectedClincherColleges);
    
    // Pass the selected difficulty and colleges to the main process
    await window.ipcRenderer.invoke('sync-difficulty', difficulty, selectedClincherColleges);
    
    console.log(
      `Started ${difficulty} round with selected colleges:`,
      selectedClincherColleges.map((c) => c.shorthand).join(', ')
    );
  }

  // Function to go back to college selection for clincher/sudden death
  const reSelectColleges = async () => {
    // Clear current selections
    setSelectedColleges({});
    
    // Enable college selection mode
    setInCollegeSelectionMode(true);
    
    // Reset clincher mode
    setInClincherRound(false);
    
    // Refresh the college list to show all colleges
    const allColleges = await fetchColleges();
    setDisplayedColleges(allColleges);
    
    console.log(`Re-entered college selection mode for ${difficulty} round`);
  };

  // Modified handleSwitchToClincher function to accept a difficulty parameter
  async function handleSwitchToClincher(selectedDifficulty = 'Clincher') {
    // Set difficulty to the selected value
    setDifficulty(selectedDifficulty);
    
    // Enable college selection mode
    setInCollegeSelectionMode(true);
    
    // Clear previous selections
    setSelectedColleges({});
    
    // Refresh the college list to show all colleges
    const allColleges = await fetchColleges();
    setDisplayedColleges(allColleges);
    
    console.log(`Entered college selection mode for ${selectedDifficulty} round`);
  }
  
  async function exitClincherRound(difficulty = 'Easy') {
    setInClincherRound(false);
    setInCollegeSelectionMode(false);
    
    // Refresh the college list
    const allColleges = await fetchColleges();
    setDisplayedColleges(allColleges);
    
    // Reset difficulty (without clincher colleges)
    setDifficulty(difficulty);
    await window.ipcRenderer.invoke('sync-difficulty', difficulty);
    
    console.log('Exited Clincher round, returned to normal mode');
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

  // Get the appropriate rank options based on the current category
  const getRankOptions = () => {
    if (category === 'Finals') {
      return [
        { value: '', label: 'Rank' },
        { value: '1st', label: '1st' },
        { value: '2nd', label: '2nd' },
        { value: '3rd', label: '3rd' }
      ];
    } else {
      return [
        { value: '', label: 'Rank' },
        { value: '1st', label: '1st' },
        { value: '2nd', label: '2nd' },
        { value: '3rd', label: '3rd' },
        { value: '4th', label: '4th' },
        { value: '5th', label: '5th' }
      ];
    }
  };

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
        <h1 className='text-6xl font-bold text-center text-white font-[Nitro-Nova] drop-shadow-[0_0_0.05em_white]'>
          PAUTAKAN 2025
        </h1>
        <h1 className='text-4xl font-bold text-center text-white font-[Nitro-Nova] drop-shadow-[0_0_0.05em_white]'>
          Control View
        </h1>
        <div className='flex flex-row items-center justify-between'>
          <div className='flex flex-row w-4/9 items-center justify-evenly ml-4'>
            <Dropdown
              options={[
                { value: 'Eliminations' },
                { value: 'Finals' },
              ]}
              onChange={(selected) => {
                if (selected === 'Finals') {
                  // When changing TO Finals mode
                  const selectedCollegeIds = Object.keys(selectedColleges).filter(id => selectedColleges[id]);
                  
                  if (selectedCollegeIds.length === 0) {
                    // No colleges selected, show notification
                    setCategoryError('You must select colleges using the checkboxes before switching to Finals mode.');
                    alert('You must select colleges using the checkboxes before switching to Finals mode.');
                    return; // Don't change category
                  }
                  
                  // Clear any previous errors
                  setCategoryError('');
                  
                  // Set the category (we'll handle the college filtering in the useEffect)
                  setCategory(selected);
                  setDifficulty('Easy');
                } 
                else if (selected === 'Eliminations') {
                  // When changing FROM Finals TO Eliminations mode
                  // Set the category first (the useEffect will handle displaying all colleges)
                  setCategory(selected);
                  setDifficulty('Easy');
                  
                  // Clear any previous errors
                  setCategoryError('');
                }
              }}
              key={category}
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
                if (selected === 'Clincher' || selected === 'Sudden Death') {
                  // Pass the selected difficulty to handleSwitchToClincher
                  handleSwitchToClincher(selected);
                } else {
                  exitClincherRound(selected);
                  setDifficulty(selected);
                }
              }}
              key={difficulty}
              initialValue={difficulty}
            />
            <Dropdown
              options={[{ value: 'Individual' }, { value: 'Teams' }]}
              onChange={async (selected) => {
                setDivision(selected);
                setDifficulty('Easy');
                setCategory('Eliminations');
                await performResetScores();
              }}
              initialValue={division}
            />
          </div>
          <div className='grid grid-cols-3 w-4/9 mr-4 gap-2'>
            <button className={buttonStyles} onClick={handleResetClick}>
              Reset Scores
            </button>
            <button className={buttonStyles} onClick={handleRefreshClick}>
              Refresh
            </button>
            <button
              className={buttonStyles}
              onClick={toggleLeaderboard}
            >
              {showLeaderboard ? 'Close Leaderboard' : 'Toggle Leaderboard'}
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

        {/* Display category error message if any */}
        {categoryError && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
            <p>{categoryError}</p>
          </div>
        )}

        {/* Display leaderboard error message if any */}
        {leaderboardError && (
          <div className="w-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
            <p>{leaderboardError}</p>
          </div>
        )}

        {/* Single Column Layout with college list */}
        <div className='w-full flex flex-col gap-1'>
          {displayedColleges.map((college: College) => (
            <div
              className="bg-white border-2 border-gray-300 w-full px-2 py-1 rounded-xl flex flex-row items-center justify-between"
              key={college.id}
            >
              <div className='flex flex-row items-center'>
                {/* Checkbox for selecting college for leaderboard */}
                <input
                  type="checkbox"
                  className="mr-2 h-5 w-5 rounded border-gray-300 cursor-pointer"
                  checked={selectedColleges[String(college.id)] || false}
                  onChange={(e) => handleCollegeSelection(String(college.id), e.target.checked)}
                />
                
                {/* Ranking dropdown on left side of college name */}
                <select
                  className={`border border-gray-300 rounded px-2 py-1 text-sm mr-3 ${
                    !selectedColleges[String(college.id)] 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'cursor-pointer'
                  }`}
                  value={collegeRankings[String(college.id)] || ''}
                  onChange={(e) => handleRankChange(String(college.id), e.target.value)}
                  disabled={!selectedColleges[String(college.id)]}
                >
                  {getRankOptions().map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
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
          
          {/* Confirmation button for college selection mode */}
          {inCollegeSelectionMode && (
            <div className="w-full mt-4 mb-4">
              <button
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg w-full"
                onClick={confirmClincherCollegeSelection}
              >
                Confirm Selected Colleges for {difficulty} Round
              </button>
            </div>
          )}
          
          {/* Re-select button for clincher/sudden death mode */}
          {inClincherRound && !inCollegeSelectionMode && (
            <div className="w-full mt-4 mb-4">
              <button
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg w-full"
                onClick={reSelectColleges}
              >
                Go Back
              </button>
            </div>
          )}
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
            return 1;
          case 'Sudden Death':
            return .5;
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