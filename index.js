const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter

// grid size
const cellsHoriz = 15
const cellsVertic = 10
const height = window.innerHeight
const width = window.innerWidth

const unitLengthx = width/cellsHoriz
const unitLengthy = height/cellsVertic

const engine = Engine.create();
engine.world.gravity.y = 0
const { world } = engine
const render = Render.create({
     element: document.body,
     engine,
     options: {
         wireframes: false,
         width,
         height
     }
 })

 Render.run(render)
 Runner.run(Runner.create(), engine)
// mouse dragging example
 //  World.add(world,
//     MouseConstraint.create(engine, {
//         mouse: Mouse.create(render.canvas)
//     }))

// walls
const walls = [
    Bodies.rectangle(width/2, 0, width, 2, {
        isStatic: true
    }),
    Bodies.rectangle(width/2, height, width, 2, {
        isStatic: true
    }),
    Bodies.rectangle(0, height/2, 2, height, {
        isStatic: true
    }),
    Bodies.rectangle(width, height/2, 2, height, {
        isStatic: true
    }),
]
World.add(world, walls)

// up and down - vertical
// left an right - horizontal
// true - no wall
// false - is wall



// Grid generations
const grid = Array(cellsVertic)
.fill(null)
.map(() => Array(cellsHoriz).fill(false))

// verticals
const verticals = Array(cellsVertic)
.fill(null)
.map(() => Array(cellsHoriz - 1).fill(false))

const horizontals = Array(cellsVertic - 1)
.fill(null)
.map(() => Array(cellsHoriz).fill(false))

const startRow = Math.floor(Math.random()*cellsVertic)
const startCol = Math.floor(Math.random()*cellsHoriz)

const arrayShuffle = (arr) => {
    let counter = arr.length

    while (counter > 0) {
        // random index  for swap
        let index = Math.floor(Math.random() * counter)
        counter--
        let temp = arr[counter]
        arr[counter] = arr[index]
        arr[index] = temp
    }
    return arr
} 

const visitCell = (row,col) => {
    // has been visited already? then do nothing
    if (grid[row][col]) {
        return
    }
    // mark it now to be visted
    grid[row][col] = true

    // now the neighbors possible to visit
    const neighbors =arrayShuffle( [
        [row -1, col, 'up'],
        [row + 1, col, 'down'],
        [row, col -1, 'left'],
        [row, col +1, 'right']
    ])

    for (let neighbor of neighbors){
        const [nextRow, nextCol, direction] = neighbor
        // check if not out of board
        if (nextRow < 0 || nextCol < 0 || nextCol >= cellsHoriz || nextRow >= cellsVertic){
            continue
        }
        // check if been visited so we dont need to visit again
        if (grid[nextRow][nextCol]){
            continue
        }

        if (direction == 'left'){
            verticals[row][col -1] = true
        }else if (direction == 'right'){
            verticals[row][col] = true
        }else if (direction == 'up') {
            horizontals[row -1][col] = true
        }else {
            horizontals[row][col] = true
        }

        // visit next cell
        visitCell(nextRow, nextCol)
    }
    
}

visitCell(startRow,startCol)

// Now we have the lines for the board
// use matter to draw them

horizontals.forEach( (row, rowIndex) => {
    row.forEach((open, colIndex) => {
        if (open){
            return
        }
        const wall = Bodies.rectangle(
            colIndex * unitLengthx + unitLengthx/2,
            rowIndex * unitLengthy + unitLengthy,
            unitLengthx,
            5,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle:'deeppink'
                }
            }
        )

        World.add(world, wall)
    })
})

verticals.forEach((row, rowIndex) => {
    row.forEach((open, colIndex) => {
        if (open){
            return
        }

        const wall = Bodies.rectangle(
            colIndex * unitLengthx + unitLengthx,
            rowIndex *unitLengthy + unitLengthy/2,
            5,
            unitLengthy,
            {
                label: 'wall',
                isStatic: true,
                render: {
                    fillStyle:'deeppink'
                }
            }
        )
        World.add(world, wall)

    })
})

// YAY! we have the maze
// drawing goal at the right buttom of the maze
const goal = Bodies.rectangle(
    width - unitLengthx /2,
    height - unitLengthy/2,
    unitLengthx * 0.7,
    unitLengthy * 0.7,
    {
        isStatic: true,
        label: 'goal',
        render: {
            fillStyle:'crimson'
        }
    }
)

World.add(world, goal)

// Ball left up
let ballRadius = Math.min(unitLengthx, unitLengthy) / 4
const ball = Bodies.circle(
    unitLengthx/2,
    unitLengthy/2,
    ballRadius,
    {
        label: 'ball',
        render: {
            fillStyle:'lightcoral'
        }
    }
)

World.add(world, ball)


// Ball movment awsd
const codeWup = 87
const codeDright = 68
const codeSdown = 83
const codeAleft = 65

document.addEventListener('keydown', event =>{
    const {x, y} = ball.velocity;
    if (event.keyCode == codeWup){
        Body.setVelocity(ball, {x, y: y -5})
    }
    if (event.keyCode == codeDright){
        Body.setVelocity(ball, {x: x +5, y})
    }
    if (event.keyCode == codeSdown){
        Body.setVelocity(ball, {x, y: y +5})
    }
    if (event.keyCode == codeAleft){
        Body.setVelocity(ball, {x: x -5, y})
    } 
})

// checkfor a win
Events.on(engine, 'collisionStart', event => {
    event.pairs.forEach(collision => {
        const labels = ['ball', 'goal']

        if (
            labels.includes(collision.bodyA.label) &&
            labels.includes(collision.bodyB.label)
        ){
            document.querySelector('.winner').classList.remove('hidden')
            world.gravity.y = 1
            world.bodies.forEach(body => {
                if (body.label == 'wall'){
                    Body.setStatic(body, false)
                }
            })

        }
    })
})