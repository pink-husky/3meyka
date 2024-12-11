interface SnakeGameState {
    snake: { x: number; y: number }[];
    food: { x: number; y: number };
    direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
    score: number;
    gameOver: boolean;
}

class SnakeGame {
    private boardWidth: number;
    private boardHeight: number;
    private gridSize: number;

    constructor(boardWidth: number = 20, boardHeight: number = 20, gridSize: number = 20) {
        this.boardWidth = boardWidth;
        this.boardHeight = boardHeight;
        this.gridSize = gridSize; // Now we're using gridSize to remove the warning
    }

    initializeGame(): SnakeGameState {
        return {
            snake: [{ x: 10, y: 10 }],
            food: this.generateFood(),
            direction: 'RIGHT',
            score: 0,
            gameOver: false
        };
    }

    generateFood(snake?: { x: number; y: number }[]): { x: number; y: number } {
        const snake_positions = snake ? new Set(snake.map(pos => `${pos.x},${pos.y}`)) : new Set();

        let foodX, foodY;
        do {
            foodX = Math.floor(Math.random() * this.boardWidth);
            foodY = Math.floor(Math.random() * this.boardHeight);
        } while (snake_positions.has(`${foodX},${foodY}`));

        return { x: foodX, y: foodY };
    }

    moveSnake(state: SnakeGameState): SnakeGameState {
        // If game is already over, return the current state
        if (state.gameOver) return state;
        console.log("grid_size = " + this.gridSize)
        const newState = { ...state };
        const head = { ...newState.snake[0] };

        // Move head based on current direction
        switch (newState.direction) {
            case 'UP':
                head.y = head.y - 1;
                break;
            case 'DOWN':
                head.y = head.y + 1;
                break;
            case 'LEFT':
                head.x = head.x - 1;
                break;
            case 'RIGHT':
                head.x = head.x + 1;
                break;
        }

        // Check for border collision
        const borderCollision =
            head.x < 0 ||
            head.x >= this.boardWidth ||
            head.y < 0 ||
            head.y >= this.boardHeight;

        // Check for self-collision
        const selfCollision = this.checkSelfCollision(newState.snake, head);

        // If collision occurs, set game over
        if (borderCollision || selfCollision) {
            newState.gameOver = true;
            return newState;
        }

        // Check for food eating
        const ateFruit = head.x === newState.food.x && head.y === newState.food.y;

        // Add new head
        newState.snake.unshift(head);

        // Grow snake or maintain length
        if (!ateFruit) {
            newState.snake.pop();
        } else {
            // Generate new food
            newState.food = this.generateFood(newState.snake);
            newState.score += 1;
        }

        return newState;
    }

    changeDirection(state: SnakeGameState, newDirection: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'): SnakeGameState {
        // Prevent 180-degree turns and direction changes when game is over
        const oppositeDirections = {
            'UP': 'DOWN',
            'DOWN': 'UP',
            'LEFT': 'RIGHT',
            'RIGHT': 'LEFT'
        };

        if (state.gameOver) return state;

        if (newDirection !== oppositeDirections[state.direction]) {
            return { ...state, direction: newDirection };
        }

        return state;
    }

    private checkSelfCollision(snake: { x: number; y: number }[], head: { x: number; y: number }): boolean {
        return snake.slice(1).some(segment =>
            segment.x === head.x && segment.y === head.y
        );
    }
}

export default SnakeGame;