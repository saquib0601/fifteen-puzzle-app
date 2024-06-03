import React, { useState, useEffect, useRef } from 'react';
import './Puzzle.css';

// Initial configuration of the puzzle, with numbers 1-15 and a null representing the empty space
const initialPuzzle = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null];

const Puzzle = () => {
  // State variables for puzzle configuration, messages, solvability, moves, time, and pause status
  const [puzzle, setPuzzle] = useState([...initialPuzzle]);
  const [message, setMessage] = useState('');
  const [isSolvable, setIsSolvable] = useState(true);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const timerRef = useRef(null); // Ref to manage the timer

  // Effect to re-render the puzzle whenever the puzzle state changes
  useEffect(() => {
    renderPuzzle();
  }, [puzzle]);

  // Effect to handle the timer functionality based on the pause status
  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current); // Clear the interval on cleanup
  }, [isPaused]);

  // Effect to handle keydown events for tile movements
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPaused) {
        switch (e.key) {
          case 'ArrowUp':
            moveTile('up');
            break;
          case 'ArrowDown':
            moveTile('down');
            break;
          case 'ArrowLeft':
            moveTile('left');
            break;
          case 'ArrowRight':
            moveTile('right');
            break;
          case 'Escape':
            setIsPaused(true);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaused, puzzle]);

  // Function to shuffle the puzzle into a solvable configuration
  const shufflePuzzle = () => {
    let shuffledPuzzle;
    do {
      shuffledPuzzle = [...initialPuzzle];
      shuffledPuzzle.sort(() => Math.random() - 0.5);
    } while (!checkSolvable(shuffledPuzzle));

    setPuzzle(shuffledPuzzle);
    setIsSolvable(true); // Puzzle is shuffled to a solvable configuration
    setMessage('');
  };

  // Function to check if the puzzle configuration is solvable
  const checkSolvable = (puzzle) => {
    let inversions = 0;
    for (let i = 0; i < puzzle.length; i++) {
      for (let j = i + 1; j < puzzle.length; j++) {
        if (puzzle[i] && puzzle[j] && puzzle[i] > puzzle[j]) {
          inversions++;
        }
      }
    }
    return inversions % 2 === 0;
  };

  // Function to check if the puzzle configuration is unsolvable
  const checkUnsolvable = (puzzle) => {
    let blankRowFromBottom = 4 - Math.floor(puzzle.indexOf(null) / 4);
    let inversions = 0;
    for (let i = 0; i < puzzle.length; i++) {
      for (let j = i + 1; j < puzzle.length; j++) {
        if (puzzle[i] && puzzle[j] && puzzle[i] > puzzle[j]) {
          inversions++;
        }
      }
    }
    return (blankRowFromBottom % 2 === 0 && inversions % 2 !== 0);
  };

  // Function to make a step towards solving the puzzle when the help button is clicked
  const helpStep = () => {
    if (isSolvable) {
      const emptyIndex = puzzle.indexOf(null);
      const neighborIndex = emptyIndex - 1 >= 0 ? emptyIndex - 1 : emptyIndex + 1;
      const newPuzzle = [...puzzle];
      [newPuzzle[emptyIndex], newPuzzle[neighborIndex]] = [newPuzzle[neighborIndex], newPuzzle[emptyIndex]];
      setPuzzle(newPuzzle);
      setMoves((prevMoves) => prevMoves + 1);
    }
  };

  // Handle tile click events for moving tiles
  const handleTileClick = (index) => {
    if (!isPaused) {
      moveTile(index);
    }
  };

  // Function to move a tile based on direction or index
  const moveTile = (directionOrIndex) => {
    const emptyIndex = puzzle.indexOf(null);
    let targetIndex = -1;

    if (typeof directionOrIndex === 'string') {
      switch (directionOrIndex) {
        case 'up':
          if (emptyIndex + 4 < 16) targetIndex = emptyIndex + 4;
          break;
        case 'down':
          if (emptyIndex - 4 >= 0) targetIndex = emptyIndex - 4;
          break;
        case 'left':
          if (emptyIndex % 4 !== 3) targetIndex = emptyIndex + 1;
          break;
        case 'right':
          if (emptyIndex % 4 !== 0) targetIndex = emptyIndex - 1;
          break;
        default:
          break;
      }
    } else {
      const index = directionOrIndex;
      if (
        index === emptyIndex - 1 ||
        index === emptyIndex + 1 ||
        index === emptyIndex - 4 ||
        index === emptyIndex + 4
      ) {
        targetIndex = index;
      }
    }

    if (targetIndex !== -1) {
      const newPuzzle = [...puzzle];
      [newPuzzle[emptyIndex], newPuzzle[targetIndex]] = [newPuzzle[targetIndex], newPuzzle[emptyIndex]];
      setPuzzle(newPuzzle);
      setMoves((prevMoves) => prevMoves + 1);
    }
  };

  // Function to reset the game to the initial state
  const resetGame = () => {
    setPuzzle([...initialPuzzle]);
    setMoves(0);
    setTime(0);
    setIsPaused(true);
    setMessage('');
    clearInterval(timerRef.current);
  };

  // Function to handle start/pause button click
  const handleStartPauseClick = () => {
    if (isPaused) {
      shufflePuzzle();
      setIsPaused(false);
    } else {
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

  // Function to render the puzzle tiles
  const renderPuzzle = () => {
    return puzzle.map((tile, index) => (
      <div
        key={index}
        className={`tile ${tile === null ? 'empty' : ''}`}
        onClick={() => handleTileClick(index)}
      >
        {tile}
      </div>
    ));
  };

  return (
    <div className="puzzle-container">
      <div className="controls">
        <button onClick={shufflePuzzle}>Shuffle</button>
        <button onClick={helpStep}>Help Me</button>
        <button onClick={handleStartPauseClick}>{isPaused ? 'Start' : 'Pause'}</button>
        <button onClick={resetGame}>Reset</button>
        <div className="message">{message}</div>
      </div>
      <div className="status">
        <div>Moves: {moves}</div>
        <div>Time: {time}s</div>
      </div>
      <div className={`puzzle-grid ${isPaused ? 'paused' : ''}`}>{renderPuzzle()}</div>
      <div className="instructions">
        <p>Move tiles in grid to order them from 1 to 15</p>
        <p>To move a tile, you can click on it or use your arrow keys.</p>
        <p>Press ESC to pause game.</p>
      </div>
    </div>
  );
};

export default Puzzle;
