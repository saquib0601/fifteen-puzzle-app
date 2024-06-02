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

  const shufflePuzzle = () => {
    let shuffledPuzzle = [...puzzle];
    shuffledPuzzle.sort(() => Math.random() - 0.5);
    setPuzzle(shuffledPuzzle);
    const solvable = checkSolvable(shuffledPuzzle);
    setIsSolvable(solvable);
    setMessage(solvable ? '' : 'Not solvable');
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

  const helpStep = () => {
    if (isSolvable) {
      // Basic one-step solver (should be replaced with an actual solver)
      const emptyIndex = puzzle.indexOf(null);
      const neighborIndex = emptyIndex - 1 >= 0 ? emptyIndex - 1 : emptyIndex + 1;
      const newPuzzle = [...puzzle];
      [newPuzzle[emptyIndex], newPuzzle[neighborIndex]] = [newPuzzle[neighborIndex], newPuzzle[emptyIndex]];
      setPuzzle(newPuzzle);
      setMoves((prevMoves) => prevMoves + 1);
    }
  };

  const handleTileClick = (index) => {
    const emptyIndex = puzzle.indexOf(null);
    if (
      index === emptyIndex - 1 ||
      index === emptyIndex + 1 ||
      index === emptyIndex - 4 ||
      index === emptyIndex + 4
    ) {
      const newPuzzle = [...puzzle];
      [newPuzzle[emptyIndex], newPuzzle[index]] = [newPuzzle[index], newPuzzle[emptyIndex]];
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
        <button onClick={() => setIsPaused(!isPaused)}>{isPaused ? 'Start' : 'Pause'}</button>
        <button onClick={resetGame}>Reset</button>
        <div className="message">{message}</div>
      </div>
      <div className="status">
        <div>Moves: {moves}</div>
        <div>Time: {time}s</div>
      </div>
      <div className="puzzle-grid">{renderPuzzle()}</div>
      <div className="instructions">
        <p>Move tiles in grid to order them from 1 to 15</p>
        <p>To move a tile, you can click on it or use your arrow keys.</p>
        <p>Press ESC to pause game.</p>
      </div>
    </div>
  );
};

export default Puzzle;
