'use strict'

const state = require('../states.js')
const store = require('../store.js')
const Tile = require('./tile.js')
let reset = 0

const ADJACENT = [
  {row: -1, col: 0},
  {row: 1, col: 0},
  {row: 0, col: -1},
  {row: 0, col: 1}
]

const ALL_ADJ = [
  {row: -1, col: -1},
  {row: -1, col: 0},
  {row: -1, col: 1},
  {row: 0, col: -1},
  {row: 0, col: 0},
  {row: 0, col: 1},
  {row: 1, col: -1},
  {row: 1, col: 0},
  {row: 1, col: 1}
]

// console.log(ADJ)

class Game {
  constructor (size) {
    this.xSize = size + 2
    this.ySize = size + 2
    this.maze = []
    this.initBoard()
  }

  initBoard () {
    this.maze = []
    for (let row = 0; row < this.ySize + 2; row++) {
      const rowBin = []
      for (let col = 0; col < this.xSize + 2; col++) {
        rowBin.push(new Tile(row, col))
      }
      this.maze.push(rowBin)
    }

    const randPoint = () => {
      return Math.floor(Math.random() * 30)
    }
    this.start = this.maze[randPoint()][randPoint()]
    this.finish = this.maze[randPoint()][randPoint()]
    this.player = this.start
    this.player.setFill('player')
    this.finish.setFill('finish')
  }

  renderBoard () {
    // Renders the entire game board from scratch
    $('#game-board').html('')
    for (let row = 0; row < this.ySize; row++) {
      const rowHTML = `<ol id=row-${row} class="row"> </ol>`
      $(`#game-board`).append(rowHTML)
      for (let col = 0; col < this.xSize; col++) {
        const tileHTML = this.maze[row][col].renderHTML()
        $(`#row-${row}`).append(tileHTML)
      }
    }
  }

  generatePseudoPrimMaze (weight) {
    this.initBoard()

    let walls = []
    const addWalls = (row, col) => {
      for (let i = 0; i < ADJACENT.length; i++) {
        const test = this.maze[row + ADJACENT[i].row][col + ADJACENT[i].col]
        if (test.inBounds) {
          if (!walls.includes(test)) {
            walls.push(test)
          } else {
            walls = walls.filter((e) => { return e !== test })
          }
        }
      }
    }

    let curr = this.start
    addWalls(curr.row, curr.col)

    while (walls.length > 0) {
      curr = walls[Math.floor(Math.random() * walls.length)] // Random wall
      walls = walls.filter((e) => { return e !== curr }) // Remove from walls]

      let count = 0 // count of active neighbors
      for (let i = 0; i < ALL_ADJ.length; i++) {
        const test = this.maze[curr.row + ALL_ADJ[i].row][curr.col + ALL_ADJ[i].col]
        if (test.fill !== 'wall') {
          count += 1
        }
      }

      if (curr.fill === 'wall' && count <= weight) {
        curr.setFill('empty')
        addWalls(curr.row, curr.col)
      }
    }

    if (!this.testPath()) { // recursive retry if no path exists; should never happen but still checking
      console.error('ERROR: Maze Generation, no path exists')
      reset += 1
      if (reset >= 10) {
        throw new Error()
      } else {
        this.generatePseudoPrimMaze()
      }
    } else {
      reset = 0
    }
  }

  dijkstrasSolver (start = this.start) {
    start.dist = 0
    const q = []

    for (let row = 1; row < this.ySize - 1; row++) {
      for (let col = 1; col < this.xSize - 1; col++) {
        if (this.maze[row][col].fill !== 'wall') {
          q.push(this.maze[row][col])
        }
      }
    }

    while (q.length > 0) {
      let lowest = q[0].dist
      let idx = 0
      for (let i = 0; i < q.length; i++) {
        if (q[i].dist < lowest) {
          lowest = q[i].dist
          idx = i
        }
      }

      const curr = q[idx]
      for (let i = 0; i < ADJACENT.length; i++) {
        const test = this.maze[curr.row + ADJACENT[i].row][curr.col + ADJACENT[i].col]
        if (curr.dist + 1 < test.dist) {
          test.dist = curr.dist + 1
          test.prev = curr
        }
      }

      q.splice(idx, 1) // remove from q
    }
  }

  testPath (end = this.finish) {
    this.dijkstrasSolver()
    store.lastPath = 'testPath'
    if (end.dist < Infinity) {
      // this.drawPath()
      return true
    } else {
      return false
    }
  }

  drawPath () {
    if (this.finish.dist < Infinity) {
      let curr = this.finish.prev
      while (curr.prev !== null && curr !== this.start) {
        curr.setFill('path')
        curr = curr.prev
      }
    } else {
      console.log('Invalid Path') // NOTE: Fix console.log
    }
  }

  keyPress (key) {
    let mod
    switch (key) {
      case 32: // Space
        console.log('space')
        break
      case 37: // left
        console.log('left')
        mod = {row: 0, col: -1}
        break
      case 38: // up
        console.log('up')
        mod = {row: -1, col: 0}
        break
      case 39: // right
        console.log('right')
        mod = {row: 0, col: 1}
        break
      case 40: // down
        console.log('down')
        mod = {row: 1, col: 0}
        break
      default:
        console.error('Unsupported key event passed')
    }
    if (state.playing()) {
      const test = this.maze[this.player.row + mod.row][this.player.col + mod.col]
      if (test.inBounds && test.fill !== 'wall') {
        this.player.setFill('empty')
        this.player = test
        this.player.setFill('player')
      } else {
        console.error('Move not valid')
      }
    }

    if (this.player === this.finish) {
      console.error('Game Over')
      state.setGameState(2)
    }
  }

  drawKey () {
    const keySrc = '../../../public/key.png'
    const test = (
      `<img src="${keySrc}" alt="Key" class="sprite">`
    )
    $('#game-box-10-10').append(test)
    console.log('Key drawn')
  }
}

module.exports = Game
