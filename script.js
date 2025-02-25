const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        document.body.appendChild(canvas);
        let Highscores = [
            { name: "-", score: 0 },
            { name: "-", score: 0 },
            { name: "-", score: 0 }
        ];
        
        const game = {
            width: 800,
            height: 600,
            rows: 5,
            cols: 8,
            running: true,
            score: 0,
            blockleft: 0
        };

        game.blockleft = game.rows * game.cols;

        canvas.width = game.width;
        canvas.height = game.height;

        const paddle = {
            width: 100,
            height: 10,
            x: game.width / 2 - 50,
            y: game.height - 20,
            speed: 10,
            color: 'magenta'
        };

        const ball = {
            x: game.width / 2,
            y: game.height / 2,
            radius: 10,
            speedX: -0,
            speedY: -6,
            color: 'magenta'
        };

        const blocks = [];
        const blockWidth = 80;
        const blockHeight = 20;

        function initBlocks() {
            for (let i = 0; i < game.cols; i++) {
                blocks[i] = [];
                for (let j = 0; j < game.rows; j++) {
                    blocks[i][j] = {
                        x: i * (blockWidth + 10) + 45,
                        y: j * (blockHeight + 10) + 45,
                        width: blockWidth,
                        height: blockHeight,
                        color: 'darkmagenta'
                    };
                }
            }
        }

        function drawPaddle() {
            ctx.fillStyle = paddle.color;
            ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        }

        function drawBall() {
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fillStyle = ball.color;
            ctx.fill();
            ctx.closePath();
        }

        function drawBlocks() {
            for (let i = 0; i < game.cols; i++) {
                for (let j = 0; j < game.rows; j++) {
                    let block = blocks[i][j];
                    if (block) {
                        ctx.fillStyle = block.color;
                        ctx.fillRect(block.x, block.y, block.width, block.height);
                    }
                }
            }
        }

        function checkCollision(ball, obj) {
            return ball.x + ball.radius > obj.x &&
                   ball.x - ball.radius < obj.x + obj.width &&
                   ball.y + ball.radius > obj.y &&
                   ball.y - ball.radius < obj.y + obj.height;
        }

        function updateBall() {
            ball.x += ball.speedX;
            ball.y += ball.speedY;

            // Wall collisions
            if (ball.x - ball.radius < 0 || ball.x + ball.radius > game.width){
                ball.speedX *= -1;
                const sound = new Audio("sounds/hit.wav");
                sound.play();
            }
            if (ball.y - ball.radius < 0) {
                ball.speedY *= -1;
                const sound = new Audio("sounds/hit.wav");
                sound.play();
            }

            // Paddle collision
            if (checkCollision(ball, paddle)) {
                let offset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
                ball.speedX = offset * 5;
                ball.speedY *= -1;
                const sound = new Audio("sounds/hit.wav");
                sound.play();
            }

            // Block collisions
            for (let i = 0; i < game.cols; i++) {
                for (let j = 0; j < game.rows; j++) {
                    let block = blocks[i][j];
                    if (block && checkCollision(ball, block)) {
                        ball.speedY *= -1;
                        blocks[i][j] = null;
                        game.score += 10;
                        document.getElementById('score').innerText = `Score: ${game.score}`;
                        const sound = new Audio("sounds/hit.wav");
                        sound.play();
                        game.blockleft -= 1;
                        return;
                    }
                }
            }

            // Game Over
            if (ball.y > game.height) {
                const sound = new Audio("sounds/gameover.wav");
                sound.play();
                
                game.running = false;
                let playerName = prompt("Game Over! Enter your name:") || "Player"; 

                
                Highscores.push({ name: playerName, score: game.score });

                updateHighscores();

                document.getElementById('gameover').style.display = 'block';
                document.getElementById('gameoverDiv').style.display = 'block';
                document.getElementById("resetButton").style.display = 'block';
            }
        }

        function movePaddle() {
            if (keys['ArrowLeft'] && paddle.x > 0) paddle.x -= paddle.speed;
            if (keys['ArrowRight'] && paddle.x < game.width - paddle.width) paddle.x += paddle.speed;
        }

        let keys = {};
        document.addEventListener('keydown', (e) => keys[e.key] = true);
        document.addEventListener('keyup', (e) => keys[e.key] = false);

        function resetGame() {

            game.score = 0;
            game.blockleft = game.rows * game.cols;
            game.running = true;
            document.getElementById('gameover').style.display = 'none';
            document.getElementById('score').innerText = `Score: ${game.score}`;
            document.getElementById("resetButton").style.display = 'none';
            
            ball.x = game.width / 2;
            ball.y = game.height / 2;
            ball.speedX = -0;
            ball.speedY = -6;
            keys = {};


            const sound = new Audio("sounds/coin.wav");
            sound.play();
            paddle.x = game.width / 2 - paddle.width / 2;

            initBlocks();

            requestAnimationFrame(gameLoop);
        }


        function updateHighscores() {
            Highscores.sort((a, b) => b.score - a.score); 
            Highscores = Highscores.slice(0, 3); 

            for (let i = 0; i < Highscores.length; i++) {
                document.getElementById('score' + (i + 1)).innerText = 
                    `${i + 1}. ${Highscores[i].name} ${Highscores[i].score}p`;
            }
        }


        function checkBlocksLeft() {
            if(game.blockleft === 0) {
                initBlocks();
                game.blockleft = game.rows*game.cols;
                ball.x = game.width / 2;
                ball.y = game.height / 2;
                ball.speedX = -0;
                ball.speedY = ball.speedY * 1.2;
                paddle.x = game.width / 2;
                paddle.y = game.height - 20;
                game.score += 100;
                const sound = new Audio("sounds/coin.wav");
                sound.play();
                document.getElementById('score').innerText = `Score: ${game.score}`;
            }
        }

        function gameLoop() {
            if (!game.running) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawPaddle();
            drawBall();
            drawBlocks();
            movePaddle();
            updateBall();
            checkBlocksLeft();
            updateHighscores();

            requestAnimationFrame(gameLoop);
        }

        initBlocks();
        gameLoop();