'use strict'

const store = require('../store.js')
const Tile = require('./tile.js')

const MODS = [
  {row: -1, col: 0},
  {row: 1, col: 0},
  {row: 0, col: -1},
  {row: 0, col: 1}
]

const ADJ = [
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

  initBoard (start = {row: 1, col: 1}, end = {row: 30, col: 30}) {
    this.maze = []
    for (let row = 0; row < this.ySize + 2; row++) {
      const rowBin = []
      for (let col = 0; col < this.xSize + 2; col++) {
        rowBin.push(new Tile(row, col))
      }
      this.maze.push(rowBin)
    }

    this.start = this.maze[start.row][start.col]
    this.finish = this.maze[end.row][end.col]
    this.start.setFill('start')
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

  generateMaze () {
    this.initBoard()

    let walls = []
    const addWalls = (row, col) => {
      for (let i = 0; i < MODS.length; i++) {
        const test = this.maze[row + MODS[i].row][col + MODS[i].col]
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
      for (let i = 0; i < MODS.length; i++) {
        const test = this.maze[curr.row + MODS[i].row][curr.col + MODS[i].col]
        if (test.content !== 'wall') {
          count += 1
        }
      }

      if (curr.content === 'wall' && count <= 2) {
        curr.setFill('empty')
        addWalls(curr.row, curr.col)
      }
    }

    if (!this.testPath()) { // recursive retry if no path exists; should never happen but still checking
      console.error('ERROR: Maze Generation, no path exists')
      this.generateMaze()
    }
  }

  dijkstrasSolver (start = this.start) {
    start.dist = 0
    const q = []

    for (let row = 1; row < this.ySize - 1; row++) {
      for (let col = 1; col < this.xSize - 1; col++) {
        if (this.maze[row][col].content !== 'wall') {
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
      for (let i = 0; i < MODS.length; i++) {
        const test = this.maze[curr.row + MODS[i].row][curr.col + MODS[i].col]
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
      this.drawPath()
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
}

module.exports = Game
