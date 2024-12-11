import React, { useState, useEffect, useCallback, useRef } from 'react';

interface SnakeSegment {
    x: number;
    y: number;
}

const BOARD_SIZE = 20;
//const CELL_SIZE = 20;
const GAME_SPEED = 100; // Faster, smoother game loop

const SnakePage: React.FC<{ onExit: () => void }> = ({ onExit }) => {
    const [snake, setSnake] = useState<SnakeSegment[]>([
        { x: 10, y: 10 }
    ]);
    const [food, setFood] = useState<SnakeSegment>({ x: 15, y: 15 });
    const [direction, setDirection] = useState<'RIGHT' | 'LEFT' | 'UP' | 'DOWN'>('RIGHT');
    const [score, setScore] = useState(0);
    const [isGameOver, setIsGameOver] = useState(false);

    const directionRef = useRef(direction);
    const snakeRef = useRef(snake);

    // Generate food that doesn't overlap with snake
    const generateFood = useCallback((): SnakeSegment => {
        let newFood: SnakeSegment;
        do {
            newFood = {
                x: Math.floor(Math.random() * BOARD_SIZE),
                y: Math.floor(Math.random() * BOARD_SIZE)
            };
        } while (
            snakeRef.current.some(
                segment => segment.x === newFood.x && segment.y === newFood.y
            )
            );
        return newFood;
    }, []);

    // Handle keyboard input
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isGameOver) return;

            const keyDirectionMap: {[key: string]: 'RIGHT' | 'LEFT' | 'UP' | 'DOWN'} = {
                'ArrowUp': 'UP',
                'ArrowDown': 'DOWN',
                'ArrowLeft': 'LEFT',
                'ArrowRight': 'RIGHT'
            };

            const newDirection = keyDirectionMap[e.key];

            // Prevent 180-degree turns
            const invalidMoves = {
                'UP': 'DOWN',
                'DOWN': 'UP',
                'LEFT': 'RIGHT',
                'RIGHT': 'LEFT'
            };

            if (newDirection && newDirection !== invalidMoves[directionRef.current]) {
                setDirection(newDirection);
                directionRef.current = newDirection;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isGameOver]);

    // Game loop
    useEffect(() => {
        if (isGameOver) return;

        const gameLoop = () => {
            setSnake(prevSnake => {
                // Create a copy of the snake to avoid mutation
                const newSnake = [...prevSnake];
                const head = { ...newSnake[0] };

                // Move the head based on current direction
                switch (directionRef.current) {
                    case 'UP':
                        head.y = (head.y - 1 + BOARD_SIZE) % BOARD_SIZE;
                        break;
                    case 'DOWN':
                        head.y = (head.y + 1) % BOARD_SIZE;
                        break;
                    case 'LEFT':
                        head.x = (head.x - 1 + BOARD_SIZE) % BOARD_SIZE;
                        break;
                    case 'RIGHT':
                        head.x = (head.x + 1) % BOARD_SIZE;
                        break;
                }

                // Check for self-collision
                const selfCollision = newSnake.slice(1).some(
                    segment => segment.x === head.x && segment.y === head.y
                );

                // Check if snake ate food
                const ateFruit = head.x === food.x && head.y === food.y;

                // Update snake
                newSnake.unshift(head);

                // Handle food eating
                if (ateFruit) {
                    setScore(prevScore => prevScore + 1);
                    setFood(generateFood());
                } else {
                    // Remove tail if not eating
                    newSnake.pop();
                }

                // Update refs for next iterations
                snakeRef.current = newSnake;

                // Check for game over conditions
                if (selfCollision) {
                    setIsGameOver(true);
                }

                return newSnake;
            });
        };

        // Set up game loop
        const intervalId = setInterval(gameLoop, GAME_SPEED);

        // Cleanup
        return () => clearInterval(intervalId);
    }, [isGameOver, food, generateFood]);

    // Restart game
    const restartGame = () => {
        setSnake([{ x: 10, y: 10 }]);
        setFood(generateFood());
        setDirection('RIGHT');
        directionRef.current = 'RIGHT';
        setScore(0);
        setIsGameOver(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-10">
            <div className="bg-black bg-opacity-50 text-green-500 rounded-lg p-8 w-[600px] h-[600px] backdrop-blur-sm border border-green-800 flex flex-col">
                <div className="flex justify-between mb-4">
                    <h2 className="text-2xl">Snake Game</h2>
                    <div className="flex space-x-4">
                        <span>Score: {score}</span>
                        <button
                            onClick={onExit}
                            className="bg-red-800 text-white px-2 rounded hover:bg-red-700"
                        >
                            Exit
                        </button>
                    </div>
                </div>

                {isGameOver ? (
                    <div className="flex-grow flex flex-col items-center justify-center">
                        <h3 className="text-3xl mb-4 text-red-500">Game Over!</h3>
                        <p className="mb-4">Final Score: {score}</p>
                        <div className="flex space-x-4">
                            <button
                                onClick={restartGame}
                                className="bg-green-800 text-white p-2 rounded hover:bg-green-700"
                            >
                                Restart Game
                            </button>
                            <button
                                onClick={onExit}
                                className="bg-gray-800 text-white p-2 rounded hover:bg-gray-700"
                            >
                                Exit to Menu
                            </button>
                        </div>
                    </div>
                ) : (
                    <div
                        className="flex-grow grid relative"
                        style={{
                            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                            gridTemplateRows: `repeat(${BOARD_SIZE}, 1fr)`,
                            gap: '1px',
                            backgroundColor: 'rgba(0, 255, 0, 0.1)'
                        }}
                    >
                        {[...Array(BOARD_SIZE * BOARD_SIZE)].map((_, index) => {
                            const x = index % BOARD_SIZE;
                            const y = Math.floor(index / BOARD_SIZE);

                            // Check if this cell is part of the snake
                            const isSnakeSegment = snake.some(
                                segment => segment.x === x && segment.y === y
                            );

                            // Check if this cell is food
                            const isFood = food.x === x && food.y === y;

                            return (
                                <div
                                    key={index}
                                    className={`
                                        ${isSnakeSegment ? 'bg-green-500' : ''}
                                        ${isFood ? 'bg-red-500' : ''}
                                        border border-green-800/20
                                    `}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SnakePage;