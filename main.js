const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

var 장애물 = new Image();
var 주인공 = new Image();
var 배경 = new Image();

장애물.src = 'tree.png';
주인공.src = 'orange.png';
배경.src = 'background.png';

var 효과음 = new Audio('effect.wav'); // 효과음 추가
var 게임오버 = new Audio('splat.wav');
var BGM = new Audio('bgm.m4a');

let plane = {
    x: 100, // 초기 x 좌표
    y: 300, // 초기 y 좌표
    width: 50,
    height: 50,
    speed: 0,
    gravity: 0.6,
    lift: -10
};

let obstacles = [];
let score = 0;
let isGameOver = false;
let gameStarted = false;
let obstacleInterval; // 장애물 생성 주기 변수

// 장애물 생성
function createObstacle() {
    const obstacleWidth = Math.floor(Math.random() * 30) + 20;
    const obstacleHeight = Math.floor(Math.random() * 400) + 20;
    obstacles.push({
        x: canvas.width,
        y: canvas.height - obstacleHeight, // 바닥에서 시작
        width: obstacleWidth,
        height: obstacleHeight,
    });
}

// 게임 업데이트
function update() {
    if (isGameOver) return;

    // 중력 적용
    plane.speed += plane.gravity;
    plane.y += plane.speed;

    // 비행기가 천장이나 바닥에 닿으면 게임 오버
    if (plane.y < 0 || plane.y + plane.height > canvas.height) {
        isGameOver = true;
    }

    // 장애물 이동
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= 6;

        // 장애물이 화면을 벗어나면 제거
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(i, 1);
            score++;
        }

        // 충돌 감지
        if (
            plane.x < obstacle.x + obstacle.width &&
            plane.x + plane.width > obstacle.x &&
            plane.y < canvas.height && // 비행기가 천장에 닿는지 확인
            plane.y + plane.height > obstacle.y // 비행기가 장애물에 닿는지 확인
        ) {
            isGameOver = true;
        }
    }

    // 화면 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 그리기
    ctx.drawImage(배경, 0, 0, canvas.width, canvas.height);

    // 비행기 그리기
    ctx.drawImage(주인공, plane.x, plane.y);

    // 장애물 그리기
    obstacles.forEach(obstacle => {
        // 장애물 이미지 잘라서 그리기
        ctx.drawImage(장애물, 0, 0, 장애물.width, 장애물.height, obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // 점수 표시
    ctx.fillStyle = 'black';
    ctx.font = '20px Galmuri7'; // 폰트 설정
    ctx.fillText(`점수: ${score}`, canvas.width - 100, 40);
}

// 비행기 상승
function flap() {
    plane.speed = plane.lift;
    효과음.currentTime = 0; // 효과음 초기화
    효과음.play(); // 효과음 재생
}

// 입력 감지
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') { // 스페이스 키로 변경
        flap();
    }
});

// 게임 루프
function gameLoop() {
    if (!isGameOver) {
        update();
        requestAnimationFrame(gameLoop);
    } else {
        ctx.fillStyle = 'black';
        ctx.font = '40px Galmuri7'; // 폰트 설정
        ctx.fillText('게임 오버', canvas.width / 2 - 80, canvas.height / 2);
        게임오버.currentTime = 0;
        게임오버.play();

        // REPLAY 버튼 그리기
        drawReplayButton();
    }
}

// REPLAY 버튼 그리기
function drawReplayButton() {
    ctx.fillStyle = '#F57924';
    ctx.fillRect(canvas.width / 2 - 75, canvas.height / 2 + 50, 150, 50);
    ctx.fillStyle = 'black';
    ctx.font = '30px Galmuri7';
    ctx.fillText('REPLAY', canvas.width / 2 - 50, canvas.height / 2 + 90);
}

// REPLAY 버튼 클릭 처리
canvas.addEventListener('click', (event) => {
    const mouseX = event.clientX - canvas.getBoundingClientRect().left;
    const mouseY = event.clientY - canvas.getBoundingClientRect().top;

    // REPLAY 버튼 클릭 확인
    if (isGameOver && mouseX >= canvas.width / 2 - 75 && mouseX <= canvas.width / 2 + 75 &&
        mouseY >= canvas.height / 2 + 50 && mouseY <= canvas.height / 2 + 100) {
        resetGame();
    }
});

// 게임 초기화
function resetGame() {
    // 장애물, 점수, 상태 초기화
    obstacles = [];
    score = 0;
    isGameOver = false;
    gameStarted = false;

    // 주인공의 초기 좌표 설정
    plane.x = 100; // 초기 x 좌표
    plane.y = 300; // 초기 y 좌표

    // 장애물 생성 주기 정지
    clearInterval(obstacleInterval);
    
    // 게임 시작
    startGame(); 
}

// 게임 시작 및 장애물 주기적으로 생성
function startObstacleGeneration() {
    obstacleInterval = setInterval(createObstacle, 2000);
}

// 게임 시작 전 초기 설정
function startGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(배경, 0, 0, canvas.width, canvas.height);
    ctx.drawImage(주인공, plane.x, plane.y);
    BGM.currentTime = 0;
    BGM.play();
    
    // "준비" 메시지 출력
    ctx.fillStyle = 'black';
    ctx.font = '40px Galmuri7'; // 큰 폰트 설정
    ctx.fillText('준비', canvas.width / 2 - 50, canvas.height / 2);
    
    setTimeout(() => {
        // "준비" 메시지 제거
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(배경, 0, 0, canvas.width, canvas.height);
        ctx.drawImage(주인공, plane.x, plane.y);
        
        // "시작!" 메시지 출력
        ctx.fillStyle = 'black';
        ctx.font = '40px Galmuri7'; // 큰 폰트 설정
        ctx.fillText('시작!', canvas.width / 2 - 50, canvas.height / 2);
        
        setTimeout(() => {
            // 메시지 제거 후 게임 시작
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            gameStarted = true;
            startObstacleGeneration(); // 장애물 생성 시작
            gameLoop();
        }, 1000); // 1초 후에 게임 시작
    }, 1500); // 1초 후에 "준비" 메시지 제거
}

// 1초 후에 게임을 시작
setTimeout(() => {
    startGame();
}, 1000);
