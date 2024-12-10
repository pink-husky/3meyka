import React, { useEffect, useRef } from 'react';

const CHARACTERS = 'abcdefghijklmnopqrstuvwxyz0123456789@#$%^&*()_+-=[]{}|;:,.<>?/';

const MatrixBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas?.getContext('2d');

        if (!canvas || !context) return;

        // Prevent default cursor and selection
        canvas.style.userSelect = 'none';
        canvas.style.cursor = 'none';

        // Prevent context menu and other default behaviors
        const preventDefaults = (e: Event) => {
            e.preventDefault();
            e.stopPropagation();
        };

        canvas.addEventListener('contextmenu', preventDefaults);
        canvas.addEventListener('selectstart', preventDefaults);

        // Resize canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Rain drops configuration
        const columns = Math.floor(canvas.width / 15);
        const drops: number[] = new Array(columns).fill(0);

        // Animation function
        const draw = () => {
            // Black background with low opacity for trail effect
            context.fillStyle = 'rgba(0, 0, 0, 0.05)';
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Green color for characters
            context.fillStyle = 'rgba(0, 255, 0, 0.8)';
            context.font = '15px monospace';

            for (let i = 0; i < drops.length; i++) {
                // Select random character
                const text = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)];

                // Draw character
                context.fillText(text, i * 15, drops[i] * 15);

                // Move drop down
                if (drops[i] * 15 > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            // Continue animation
            requestAnimationFrame(draw);
        };

        // Start animation
        draw();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                backgroundColor: 'black',
                zIndex: -1
            }}
        />
    );
};

export default MatrixBackground;