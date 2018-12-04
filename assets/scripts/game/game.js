'use strict'

const state = require('../states.js')
const store = require('../store.js')

const Tile = require('./tile.js')
const Hunter = require('./hunter.js')
const Player = require('./player.js')

let reset = 0

const ADJACENT = [
  {row: -1, col: 0}, // down
  {row: 1, col: 0}, // up
  {row: 0, col: -1}, // left
  {row: 0, col: 1} // right
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

class Game {
  constructor (size) {
    this.xSize = size + 2
    this.ySize = size + 2
    this.numHunters = 3
    this.maze = []
    this.generateLocations()
    this.player = new Player()
  }

  resetBoard () {
    this.maze = []
    for (let row = 0; row < this.ySize; row++) {
      const rowBin = []
      for (let col = 0; col < this.xSize; col++) {
        rowBin.push(new Tile(row, col))
      }
      this.maze.push(rowBin)
    }
  }

  generateLocations () {
    this.locations = {}
    // startPoint
    if (this.finish === null || this.finish === undefined) {
      const row = this.randPoint()
      const col = this.randPoint()
      this.locations.start = {}
      this.locations.start = {row: row, col: col}
    } else {
      this.locations.start = {row: this.finish.row, col: this.finish.col}
    }
    // finishPoint
    const row = this.randPoint()
    const col = this.randPoint()
    this.locations.finish = {row: row, col: col}
    // Hunters
    for (let i = 0; i < this.numHunters; i++) {
      const row = this.randPoint()
      const col = this.randPoint()
      this.locations[`hunter-${i}`] = {row: row, col: col}
    }
    // Hunters
  }

  initPieces () {
    this.start = this.maze[this.locations.start.row][this.locations.start.col]
    this.finish = this.maze[this.locations.finish.row][this.locations.finish.col]

    this.start.setFill('start', true)
    this.finish.setFill('finish', true)

    this.player.setPlayer(this.start)
    // this.player.setFill('player', false) // Dont save player fill in start

    this.hunters = []
    for (let i = 0; i < 3; i++) {
      const row = this.locations[`hunter-${i}`].row
      const col = this.locations[`hunter-${i}`].col
      this.hunters.push(new Hunter(this.maze[row][col]))
    }
  }

  randPoint () {
    return 1 + Math.floor(Math.random() * 30)
  }

  clearBoard() {
    for (let row = 0; row < this.ySize; row++) {
      for (let col = 0; col < this.xSize; col++) {
        this.maze[row][col].resetFill()
      }
    }
  }

  renderBoard () {
    // Renders the entire game board from scratch
    $('#game-board').html('')
    for (let row = 0; row < this.ySize; row++) {
      const rowHTML = `<ol id=row-${row} class="row"> </ol>`
      $(`#game-board`).append(rowHTML)
      for (let col = 0; col < this.xSize; col++) {
        const tileHTML = this.maze[row][col].constructHTML()
        $(`#row-${row}`).append(tileHTML)
      }
    }
  }

  generatePseudoPrimMaze (weight) {
    this.resetBoard()
    this.initPieces()

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
        curr.setFill('empty', true)
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

  dijkstrasSolver (startPoint) {
    const q = []

    for (let row = 1; row < this.ySize - 1; row++) {
      for (let col = 1; col < this.xSize - 1; col++) {
        if (this.maze[row][col].fill !== 'wall') {
          this.maze[row][col].dist = Infinity
          this.maze[row][col].prev = null
          q.push(this.maze[row][col])
        }
      }
    }

    startPoint.dist = 0
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
    this.dijkstrasSolver(this.start)
    store.lastPath = 'testPath'
    if (end.dist < Infinity) {
      // this.drawPath()
      return true
    } else {
      return false
    }
  }

  drawPath () {
    // // FIXME: Depreciated, no longer working?
    if (this.player.tile.dist < Infinity) {
      let curr = this.player.tile.prev
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
        console.log(this.maze)
        // console.log('space')
        if (state.playing()) {
          state.setGameState(1)
          // console.log('paused')
        } else {
          state.setGameState(0)
          // console.log('unpaused')
        }
        return true
      case 37: // left
        // console.log('left')
        mod = {row: 0, col: -1}
        break
      case 38: // up
        // console.log('up')
        mod = {row: -1, col: 0}
        break
      case 39: // right
        // console.log('right')
        mod = {row: 0, col: 1}
        break
      case 40: // down
        // console.log('down')
        mod = {row: 1, col: 0}
        break
      default:
        console.error('Unsupported key event passed')
    }
    if (state.playing()) {
      const test = this.maze[this.player.row + mod.row][this.player.col + mod.col]
      if (test.inBounds && test.fill !== 'wall') {
        this.player.clearPlayerIcon()
        this.player.setPlayer(test)
      } else {
        console.error('Move not valid')
      }
    }

    if (this.player.tile === this.finish) {
      console.error('Game Over')
      state.setGameState(2)
    }
  }

  search (hunter) {
    if (state.playing()) {
      let done = false
      let count = 0
      while (!done) {
        const mod = ADJACENT[Math.floor(Math.random() * 4)]
        const row = hunter.row + mod.row
        const col = hunter.col + mod.col

        if (this.maze[row][col].fill === 'empty' && this.maze[row][col].inBounds) {
          hunter.clearHunter()
          hunter.setHunter(this.maze[row][col])
          done = true
        } else {
          count += 1
          if (count >= 20) {
            done = true
          }
        }
      }
    }
  }

  hunt () {
    if (state.playing()) {
      console.log('Moving to ', this.player.row, this.player.col)
      this.dijkstrasSolver(this.player.tile)
      for (let i = 0; i < this.hunters.length; i++) {
        const hunter = this.hunters[i]
        if (hunter.tile.dist < Infinity && hunter.tile.dist > 0) { // if path exists
          const next = hunter.tile.prev
          if (next !== null && (next.fill !== 'wall' && next.fill !== 'hunter')) {
            hunter.clearHunter()
            hunter.setHunter(next)
            if (hunter.tile === this.player.tile) {
              console.log('hunted')
              state.setGameState(2)
            }
          } else {
            // console.log('path failed', i)
            this.search(hunter)
          }
        } else {
          // console.log('error', i, hunter.tile.dist)
          hunter.setHunter(hunter.tile)
        }
      }
    }
  }
}

module.exports = Game
