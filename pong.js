class Paddle {
    constructor(x, y, width, height, speed) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.speed = speed
        this.dY = 0
    }

    move() {
        if(0 + this.height/2 <= this.y + this.dY && this.y + this.dY <= canvas.height - this.height/2) {
            this.y += this.dY
        }
    }
}

class Ball {
    constructor(x, y, radius, speed, color) {
        this.x = x
        this.y = y
        this.radius = radius
        this.speed = speed
        this.color = color
        this.newDirection()
        // Ball must start towards the paddle
        this.dX = -Math.abs(this.dX)
    }

    move() {
        var dist_remaining = this.speed

        // Calculate bounces
        while(true) {
            var data = this.nearestWall()

            var wall_num = data.wall_num
            var dist = data.dist
            var newX = data.newX
            var newY = data.newY

            if(dist > dist_remaining)
                break

            dist_remaining -= dist

            this.x = newX
            this.y = newY

            switch(wall_num) {
                case 0: // Top wall
                    this.dY = Math.abs(this.dY)
                    break
                case 1: // Bottom wall
                    this.dY = -Math.abs(this.dY)
                    break
                case 2: // Left wall
                    endGame()
                    break
                case 3: // Right wall
                    this.dX = -Math.abs(this.dX)
                    break
                case 5: // Paddle
                    // Update score
                    score++
                    // Speed up for every point
                    this.speed *= speedMultiplier
                    paddle.speed *= speedMultiplier
                    dist_remaining *= speedMultiplier

                    // Cap speed
                    this.speed = Math.min(this.speed, maxSpeed)

                    console.log(this.speed)
                    // Set random new direction
                    this.newDirection()
                    break
            }
        }

        // Move remaining distance
        this.x += this.dX / this.speed * dist_remaining
        this.y += this.dY / this.speed * dist_remaining
    }

    nearestWall() {
        var m = this.dY / this.dX
        var b = this.y - m * this.x

        // Find the closest wall
        var wall_num = -1 // 01235 = UDLRP (P = Paddle)
        var dist = canvas.width + canvas.height // Some large number
        var newX = -1
        var newY = -1
        
        // Up Wall (wall_num = 0)
        var y_int = 0 + this.radius
        var x_int = (y_int - b) / m
        var wall_dist = Math.sqrt(Math.pow(this.x - x_int, 2) + Math.pow(this.y - y_int, 2))

        if(this.dY < 0 && wall_dist <= dist) {
            wall_num = 0
            dist = wall_dist
            newX = x_int
            newY = y_int
        }

        // Down wall (wall_num = 1)
        y_int = canvas.height - this.radius
        x_int = (y_int - b) / m
        wall_dist = Math.sqrt(Math.pow(this.x - x_int, 2) + Math.pow(this.y - y_int, 2))

        if(this.dY > 0 && wall_dist <= dist) {
            wall_num = 1
            dist = wall_dist
            newX = x_int
            newY = y_int
        }

        // Left wall (wall_num = 2)
        x_int = 0 + this.radius
        y_int = m * x_int + b
        wall_dist = Math.sqrt(Math.pow(this.x - x_int, 2) + Math.pow(this.y - y_int, 2))

        if(this.dX < 0 && wall_dist <= dist) {
            wall_num = 2
            dist = wall_dist
            newX = x_int
            newY = y_int
        }

        // Right wall (wall_num = 3)
        x_int = canvas.width - this.radius
        y_int = m * x_int + b
        wall_dist = Math.sqrt(Math.pow(this.x - x_int, 2) + Math.pow(this.y - y_int, 2))

        if(this.dX > 0 && wall_dist <= dist) {
            wall_num = 3
            dist = wall_dist
            newX = x_int
            newY = y_int
        }

        // Paddle (wall_num = 5)
        x_int = paddle.x + paddle.width/2 + this.radius
        y_int = m * x_int + b
        wall_dist = Math.sqrt(Math.pow(this.x - x_int, 2) + Math.pow(this.y - y_int, 2))

        if(this.dX < 0 && paddle.y - paddle.height/2 <= y_int && y_int <= paddle.y + paddle.height/2 && wall_dist <= dist) {
            wall_num = 5
            dist = wall_dist
            newX = x_int
            newY = y_int
        }

        return {wall_num: wall_num, dist: dist, newX: newX, newY: newY}
    }

    newDirection() {
        var angleRange = 60
        // Set a random angle +/- 'angleRange' degrees
        var angle = (2 * Math.random() - 1) * (angleRange * Math.PI / 180)
        this.dX = Math.cos(angle) * this.speed
        this.dY = Math.sin(angle) * this.speed
    }
}

var fps = 60

var canvas = document.getElementById("canvas")
var canvasContext = canvas.getContext('2d')

var speedSlider = document.getElementById("speed")
var speedDisplay = document.getElementById("display speed")

var paddleSlider = document.getElementById("paddle size")
var paddleDisplay = document.getElementById("display paddle size")

// Can set width and height to user's choosing
canvas.width = 600
canvas.height = 600

// Suggested Values
var ballRadius = 5
var paddleWidth = 5
var initialSpeed = canvas.width/200
var maxSpeed = canvas.width/24
var minScoreUntilMaxSpeed = 5

var canvasSize = 400
var speedMultiplier = 1.1
var paddleHeight = canvas.height/8

// Setting defaults for HTML
var maxSpeedMultiplier = Math.floor(Math.pow(maxSpeed / initialSpeed,1 / minScoreUntilMaxSpeed) * 10) / 10
speedSlider.value = speedMultiplier
speedSlider.max = maxSpeedMultiplier
// Display the default slider value
speedDisplay.innerHTML = speedSlider.value

paddleSlider.value = paddleHeight
paddleSlider.max = canvas.height
paddleDisplay.innerHTML = paddleSlider.value

var score = 0
var paused = false

var paddle = new Paddle(paddleWidth + 10, canvas.height/2, paddleWidth, paddleHeight, initialSpeed)
var ball = new Ball(canvas.width - ballRadius, canvas.height/2, ballRadius, initialSpeed, "white")


window.onload = () => {
    gameLoop()
}

function gameLoop() {
    setInterval(show, 1000/fps)
}

function show() {
    update()
    draw()
}

function update() {
    if(!paused) {
        paddle.move()
        ball.move()
    }
}

function draw() {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height)

    // Board
    canvasContext.fillStyle = "black"
    canvasContext.fillRect(0, 0, canvas.width, canvas.height)

    // Ball
    canvasContext.beginPath()
    canvasContext.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2)
    canvasContext.fillStyle = ball.color
    canvasContext.fill()
    canvasContext.closePath()

    // Paddle
    canvasContext.fillStyle = "white"
    canvasContext.fillRect(paddle.x - paddle.width/2, paddle.y - paddle.height/2, paddle.width, paddle.height)

    // Score
    canvasContext.font = "20px Arial"
    canvasContext.fillStyle = "#00FF42"
    canvasContext.fillText("Score: " + score, canvas.width - 120, 18)

    if(paused) {
        canvasContext.fillStyle = "yellow"
        var pauseWidth = canvas.width/20
        var pauseHeight = canvas.height/5
        var pauseGap = pauseWidth 
        canvasContext.fillRect(canvas.width/2 - pauseWidth/2 - pauseGap, canvas.height/2 - pauseHeight/2, pauseWidth, pauseHeight)
        canvasContext.fillRect(canvas.width/2 - pauseWidth/2 + pauseGap, canvas.height/2 - pauseHeight/2, pauseWidth, pauseHeight)
    }
}

function endGame() {
    ball.dX = 0
    ball.dY = 0
}

window.addEventListener("keydown", function(event) {
    if(event.defaultPrevented) {
        return // Do nothing if already handled
    }

    switch(event.code) {
        case "ArrowUp":
        case "KeyW":
            paddle.dY = -paddle.speed
            break
        case "ArrowDown":
        case "KeyS":
            paddle.dY = paddle.speed
            break
    }

    // Consume the event so it doesn't get handled twice
    event.preventDefault()
}, true)

window.addEventListener("keyup", function(event) {
    if(event.defaultPrevented) {
        return // Do nothing if already handled
    }

    switch(event.code) {
        case "ArrowUp":
        case "KeyW":
            paddle.dY = 0
            break
        case "ArrowDown":
        case "KeyS":
            paddle.dY = 0
            break
        case "Space":
            paused = !paused
            break
    }

    // Consume the event so it doesn't get handled twice
    event.preventDefault()
}, true)

// Update the current slider value
speedSlider.oninput = function() {
    speedDisplay.innerHTML = this.value
    speedMultiplier = this.value
}

// Update the current slider value
paddleSlider.oninput = function() {
    paddleDisplay.innerHTML = this.value
    paddle.height = this.value
}