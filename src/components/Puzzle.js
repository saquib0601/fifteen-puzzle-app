import React, { useState, useEffect, useRef } from 'react';
import './Puzzle.css';

const initialPuzzle = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, null];

const Puzzle = () => {
  const [puzzle, setPuzzle] = useState([...initialPuzzle]);
  const [message, setMessage] = useState('');
  const [isSolvable, setIsSolvable] = useState(true);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const timerRef = useRef(null);

  useEffect(() => {
    renderPuzzle();
  }, [puzzle]);

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isPaused]);

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

  const handleTileClick = (index) => {
    if (!isPaused) {
      moveTile(index);
    }
  };

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

  const resetGame = () => {
    setPuzzle([...initialPuzzle]);
    setMoves(0);
    setTime(0);
    setIsPaused(true);
    setMessage('');
    clearInterval(timerRef.current);
  };

  const handleStartPauseClick = () => {
    if (isPaused) {
      shufflePuzzle();
      setIsPaused(false);
    } else {
      setIsPaused(true);
      clearInterval(timerRef.current);
    }
  };

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
