import React, { useEffect, useState, useRef } from 'react';
import './MiniGame.css';

const MiniGame = () => {
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('start'); // start | playing | over
  const characterRef = useRef(null);
  const obstacleRef = useRef(null);
  const gameInterval = useRef(null);
  const jumpSound = new Audio('/audio/jump.mp3');
  const gameOverSound = new Audio('/audio/gameover.mp3');


  const startGame = () => {
    setScore(0);
    setGameState('playing');

    let speed = 2000; // starting speed

    gameInterval.current = setInterval(() => {
      const character = characterRef.current;
      const obstacle = obstacleRef.current;
    
      if (character && obstacle) {
        const charTop = parseInt(window.getComputedStyle(character).getPropertyValue("top"));
        const obsLeft = parseInt(window.getComputedStyle(obstacle).getPropertyValue("left"));
    
        if (obsLeft < 50 && obsLeft > 0 && charTop >= 130) {
          clearInterval(gameInterval.current);
          gameOverSound.play();
          setGameState('over');
        } else {
          setScore(prev => {
            const newScore = prev + 1;
    
            // Increase difficulty every 50 points
            if (newScore % 50 === 0 && speed > 800) {
              speed -= 200;
              obstacle.style.animationDuration = `${speed}ms`;
            }
    
            return newScore;
          });
        }
      }
    }, 100);
    
  };

  const jump = () => {
    if (isJumping || gameState !== 'playing') return;
    setIsJumping(true);
    characterRef.current.classList.add('jump');
    jumpSound.play();
  
    setTimeout(() => {
      characterRef.current.classList.remove('jump');
      setIsJumping(false);
    }, 500);
  };
  

  const handleButtonClick = () => {
    if (gameState === 'start') {
      startGame();
    } else if (gameState === 'playing') {
      jump();
    } else if (gameState === 'over') {
      setGameState('start'); 
      setScore(0);
      startGame(); // directly restart the game
    }
  };
  

  const getButtonLabel = () => {
    if (gameState === 'start') return 'Play';
    if (gameState === 'playing') return 'Jump';
    return 'Restart Game';
  };

  return (
    <div className="game-container">
      <h3>🎮 Hawk Run</h3>

      {gameState === 'over' ? (
        <p className="game-over">Game Over! Score: {score}</p>
      ) : (
        <p>Score: {score}</p>
      )}

      <div className="game">
        <div ref={characterRef} className="character">
            <img src="/images/scarlet-hawk.png" alt="Scarlet Hawk" className="hawk-img" />
        </div>
        <div
          ref={obstacleRef}
          className={`obstacle ${gameState === 'playing' ? 'moving' : ''}`}
        >
          📦
        </div>
      </div>

      <button className="game-btn" onClick={handleButtonClick}>
        {getButtonLabel()}
      </button>
    </div>
  );
};

export default MiniGame;
