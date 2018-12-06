'use strict'

const state = require('../states.js')
const score = require('./scores.js')

const Tile = require('./tile.js')
const Player = require('./player.js')
const Hunter = require('./hunter.js')
const Guard = require('./guard.js')

let moving = true

const MECHANICS = {
  fire: {
    spreads: 0.6,
    killsHunter: 0.025,
    killsGuard: 0.2,
    killsPlayer: 0.001,
    damage: 50,
    moveTime: 600
  },
  score: {
    coin: 50,
    life: 100,
    ruby: 500,
    clean: 2000,
    level: 2000
  }
}

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
    this.size = size + 2
    this.numHunters = 3
    this.maze = []
    this.locations = {}
    this.player = new Player()
    this.level = 0
    this.levelMechanics = {}
  }

  resetBoard () {
    this.maze = []
    for (let row = 0; row < this.size; row++) {
      const rowBin = []
      for (let col = 0; col < this.size; col++) {
        rowBin.push(new Tile(row, col, this.size))
      }
      this.maze.push(rowBin)
    }
  }

  clearBoard () {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        this.maze[row][col].resetFill()
      }
    }
  }

  blankBoard (full) {
    for (let row = 0; row < this.size; row++) {
      for (let col = 0; col < this.size; col++) {
        if (this.maze[row][col] !== this.player.tile) {
          if (full) {
            this.maze[row][col].onFire = false
          }
          this.maze[row][col].setFill('wall', false)
        }
      }
    }
  }

  renderBoard () {
    // Renders the entire game board from scratch
    $('#game-board').html('')
    for (let row = 0; row < this.size; row++) {
      const rowHTML = `<ol id=row-${row} class="row"> </ol>`
      $(`#game-board`).append(rowHTML)
      for (let col = 0; col < this.size; col++) {
        const tileHTML = this.maze[row][col].constructHTML()
        $(`#row-${row}`).append(tileHTML)
      }
    }
  }

  isEdge (row, col, dist) {
    return row < dist || col < dist || row > this.size - dist || col >= this.size - dist
  }

  setlevelMechanics () {
    const level = this.level
    const mazeWeight = Math.max(Math.floor(8 - level / 3), 4) // Maze complexity ~3 levels
    const numGuards = Math.floor(1 + level / 2)
    const numHunters = Math.floor(0 + level / 4)
    const numCoins = Math.floor(3 + level / 2)
    const ruby = Math.random() < 0.5
    const lockFinish = Math.random() < 0.2
    const life = Math.random() < 0.3
    const fire = Math.random() < 0.5

    this.levelMechanics = {
      modifier: 1 + (0.2 * level),
      mazeWeight: mazeWeight,
      numHunters: numHunters,
      numGuards: numGuards,
      numCoins: numCoins,
      generateRuby: ruby,
      generateLife: life,
      setFire: fire,
      lockFinish: lockFinish
    }
  }

  generateDistances () {
    this.resetBoard()
    this.setStart()

    this.long = []
    this.medium = []
    this.short = []

    this.generatePseudoPrimMaze(this.levelMechanics.mazeWeight)
    this.dijkstrasSolver(this.start)

    let max = this.maze[1][1].dist
    this.maxNode = this.maze[1][1]
    for (let row = 1; row < this.size - 1; row++) {
      for (let col = 1; col < this.size - 1; col++) {
        const test = this.maze[row][col]
        if (test.dist < Infinity && test.fill === 'empty') {
          // count number of neighbors
          let neighbors = 0
          for (let i = 0; i < ADJACENT.length; i++) {
            const mod = ADJACENT[i]
            const current = this.maze[test.row + mod.row][test.col + mod.col]
            if (current.fill !== 'wall') {
              neighbors += 1
            }
          }
          test.neighbors = neighbors

          if (test.dist >= 30) {
            this.long.push(test)
            // test.setFill('fire')
          } else if (test.dist > 20) {
            this.medium.push(test)
            // test.setFill('path')
          } else if (test.dist > 10) {
            this.short.push(test)
            // test.setFill('start')
          }

          if (test.dist > max) {
            max = test.dist
            this.maxNode = test
          }
        }
      }
    }

    const badGeneration = (this.long.length <= 0 ||
      this.medium.length <= 0 ||
      this.short.length <= 0)
    if (badGeneration) {
      this.generateDistances()
    }
  }

  generateLocations () {
    // finishPoint
    let done = false
    while (!done) {
      const finishIdx = Math.floor(Math.random() * this.long.length)
      const test = this.long[finishIdx]
      if (this.isEdge(test.row, test.col, 5)) {
        this.locations.finish = {row: test.row, col: test.col}
        this.dijkstrasSolver(test)
        this.long.splice(finishIdx, 1)
        done = true
      }
    }

    // Coins
    for (let i = 0; i < this.levelMechanics.numCoins; i++) {
      const loc = this.looseItemLocation(i % 3)
      this.locations[`coins-${i}`] = loc
    }
    // Hunters
    for (let i = 0; i < this.levelMechanics.numHunters; i++) {
      const loc = this.looseItemLocation(i % 3)
      this.locations[`hunter-${i}`] = loc
    }

    // Guards
    for (let i = 0; i < this.levelMechanics.numGuards; i++) {
      const loc = this.looseItemLocation(i % 3)
      this.locations[`guard-${i}`] = loc
    }

    // Key
    if (this.levelMechanics.lockFinish) {
      if (!this.strictItemGenerateLocation('key', 8, 10, 4)) {
        this.levelMechanics.lockFinish = false
      }
    }

    // Fire
    if (this.levelMechanics.setFire) {
      if (!this.strictItemGenerateLocation('fire', 4, 10, 4)) {
        this.levelMechanics.setFire = false
      }
    }

    // Ruby
    if (this.levelMechanics.generateRuby) {
      if (!this.strictItemGenerateLocation('ruby', 15, 10, 1)) {
        this.levelMechanics.generateRuby = false
      }
    }

    // Lives
    if (this.levelMechanics.generateLife) {
      if (!this.strictItemGenerateLocation('life', 15, 15, 1)) {
        this.levelMechanics.generateLife = false
      }
    }
  }

  setStart () {
    this.locations = {}
    if (this.finish === null || this.finish === undefined) {
      let done = false
      let row
      let col
      while (!done) {
        row = this.randPoint()
        col = this.randPoint()
        if (this.isEdge(row, col, 5)) {
          done = true
        }
      }

      this.locations.start = {row: row, col: col}
    } else {
      this.locations.start = {row: this.finish.row, col: this.finish.col}
    }
  }

  looseItemLocation (distance) {
    let idx
    let loc
    switch (distance) {
      case 0:
        idx = Math.floor(Math.random() * this.long.length)
        loc = {row: this.long[idx].row, col: this.long[idx].col}
        this.long.splice(idx, 1)
        break
      case 1:
        idx = Math.floor(Math.random() * this.medium.length)
        loc = {row: this.medium[idx].row, col: this.medium[idx].col}
        this.medium.splice(idx, 1)
        break
      case 2:
        idx = Math.floor(Math.random() * this.short.length)
        loc = {row: this.short[idx].row, col: this.short[idx].col}
        this.short.splice(idx, 1)
        break
    }
    return loc
  }

  strictItemGenerateLocation (item, edge, distance, neighbors) {
    this.dijkstrasSolver(this.maze[this.locations.finish.row][this.locations.finish.col])
    let count = 0
    while (true) {
      const idx = Math.floor(Math.random() * this.long.length)
      const test = this.long[idx]
      const valid = (this.isEdge(test.row, test.col, edge) &&
        test.dist >= distance &&
        test.neighbors <= neighbors
      )
      if (valid) {
        this.locations[`${item}Spawn`] = {row: test.row, col: test.col}
        this.long.splice(idx, 1)
        return true
      } else {
        count += 1
        if (count > this.long.length * 2) {
          this.levelMechanics.generateRuby = false
          return false
        }
      }
    }
  }

  initPieces () {
    this.start = this.maze[this.locations.start.row][this.locations.start.col]
    this.finish = this.maze[this.locations.finish.row][this.locations.finish.col]

    this.finish.setFill('finish', true)
    this.start.setFill('start', true)
    this.player.setPlayer(this.start)

    this.playableObjects = 0 // Counter to see if board is cleared

    // Coin Initilization
    for (let i = 0; i < this.levelMechanics.numCoins; i++) {
      const row = this.locations[`coins-${i}`].row
      const col = this.locations[`coins-${i}`].col
      this.maze[row][col].setFill('coin', true)
      this.playableObjects += 1
    }

    // Hunter Initializations
    this.hunters = []
    for (let i = 0; i < this.levelMechanics.numHunters; i++) {
      const row = this.locations[`hunter-${i}`].row
      const col = this.locations[`hunter-${i}`].col
      this.hunters.push(new Hunter(this.maze[row][col]))
    }

    // Guard Generation
    this.guards = []
    for (let i = 0; i < this.levelMechanics.numGuards; i++) {
      const row = this.locations[`guard-${i}`].row
      const col = this.locations[`guard-${i}`].col
      this.guards.push(new Guard(this.maze[row][col]))
    }

    // Key Initilization
    if (this.levelMechanics.lockFinish) {
      const row = this.locations.keySpawn.row
      const col = this.locations.keySpawn.col
      this.maze[row][col].setFill('key', true)
      this.finish.setFill('lockedFinish', true)
      this.playableObjects += 1
    }
    // Fire Initialization
    if (this.levelMechanics.setFire) {
      this.fire = []
      const rowFire = this.locations.fireSpawn.row
      const colFire = this.locations.fireSpawn.col
      const spark = this.maze[rowFire][colFire]
      spark.lightFire()
      spark.setFill('wall')
      this.fire.push(spark)
    }

    // Ruby Initialization
    if (this.levelMechanics.generateRuby) {
      const row = this.locations.rubySpawn.row
      const col = this.locations.rubySpawn.col
      this.maze[row][col].setFill('ruby', true)
      this.playableObjects += 1
    }

    // Life Generation
    if (this.levelMechanics.generateLife) {
      const row = this.locations.lifeSpawn.row
      const col = this.locations.lifeSpawn.col
      this.maze[row][col].setFill('life', true)
      this.playableObjects += 1
    }
  }

  randPoint () {
    return 1 + Math.floor(Math.random() * 30)
  }

  generatePseudoPrimMaze (weight) {
    this.resetBoard()
    this.start = this.maze[this.locations.start.row][this.locations.start.col]

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
  }

  dijkstrasSolver (startPoint) {
    const q = []

    for (let row = 1; row < this.size - 1; row++) {
      for (let col = 1; col < this.size - 1; col++) {
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
    if (end.dist < Infinity) {
      // this.drawPath()
      return true
    } else {
      return false
    }
  }

  keyPress (key) {
    let mod
    switch (key) {
      case 32: // Space
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
    if (state.playing() && moving) {
      moving = false
      const test = this.maze[this.player.row + mod.row][this.player.col + mod.col]
      if (test.inBounds && test.fill !== 'wall') {
        let value = 0
        switch (test.fill) {
          case 'hunter':
            this.killPlayer('You were killed attacking a hunter')
            break
          case 'guard':
            this.killPlayer('You were killed attacking a guard')
            break
          case 'key':
            this.finish.setFill('finish')
            test.setFill('empty', true)
            this.player.clearPlayerIcon()
            this.player.setPlayer(test)
            break
          case 'finish':
            this.player.clearPlayerIcon()
            this.player.setPlayer(test)
            this.finishLevel()
            break
          case 'coin':
            value = Math.floor(MECHANICS.score.coin * this.levelMechanics.modifier)
            this.player.addScore(value)
            test.setFill('empty', true)
            this.player.clearPlayerIcon()
            this.player.setPlayer(test)
            break
          case 'ruby':
            value = Math.floor(MECHANICS.score.ruby * this.levelMechanics.modifier)
            this.player.addScore(value)
            test.setFill('empty', true)
            this.player.clearPlayerIcon()
            this.player.setPlayer(test)
            break
          case 'life':
            this.player.lives += 1
            value = Math.floor(MECHANICS.score.ruby * this.levelMechanics.modifier)
            this.player.addScore(value)
            test.setFill('empty', true)
            this.player.clearPlayerIcon()
            this.player.setPlayer(test)
            break
          default:
            this.player.clearPlayerIcon()
            this.player.setPlayer(test)
        }

        if (this.player.tile.onFire) {
          if (Math.random() < MECHANICS.fire.killsPlayer) {
            this.killPlayer('You were killed to death in the flames')
          }
          setTimeout(() => {
            moving = true
          }, MECHANICS.fire.moveTime)
        } else {
          moving = true
        }
      } else {
        moving = true
      }
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
      this.dijkstrasSolver(this.player.tile)
      for (let i = 0; i < this.hunters.length; i++) {
        const hunter = this.hunters[i]
        if (hunter.tile.dist < Infinity && hunter.tile.dist > 0) { // if path exists
          const next = hunter.tile.prev
          if (next !== null && (next.fill !== 'wall' && next.fill !== 'hunter')) {
            hunter.clearHunter()
            hunter.setHunter(next)
          } else {
            this.search(hunter)
          }
        } else {
          hunter.setHunter(hunter.tile)
        }

        if (hunter.tile === this.player.tile) {
          this.killPlayer(`You were skewered by Hunter ${i}`)
        }

        if (hunter.tile.onFire) {
          if (Math.random() < MECHANICS.fire.killsHunter) {
            hunter.clearHunter()
            this.hunters.splice(i, 1)
          }
        }
      }
    }
  }

  moveGuards () {
    if (state.playing()) {
      for (let i = 0; i < this.guards.length; i++) {
        let loopPreventer = 0
        const guard = this.guards[i]
        let done = false
        while (!done) {
          const mod = ADJACENT[Math.floor(Math.random() * ADJACENT.length)]
          const next = this.maze[guard.row + mod.row][guard.col + mod.col]
          if (next.fill !== 'wall' && next.fill !== 'hunter' && next.fill !== 'guard') {
            guard.clearGuard()
            guard.setGuard(next)
            done = true
          } else {
            loopPreventer += 1
            if (loopPreventer > 20) {
              done = true
            }
          }
        }

        if (guard.tile === this.player.tile) {
          this.killPlayer(`You were crushed by Guard ${i}`)
        }

        if (guard.tile.onFire) {
          if (Math.random() < MECHANICS.fire.killsGuard) {
            this.guards.splice(i, 1)
            guard.clearGuard()
          }
        }
      }
    }
  }

  spreadFire () {
    if (state.playing() && this.levelMechanics.setFire) {
      const add = []
      for (let i = 0; i < this.fire.length; i++) {
        const fire = this.fire[i]
        for (let j = 0; j < ADJACENT.length; j++) {
          const mod = ADJACENT[j]
          const test = this.maze[fire.row + mod.row][fire.col + mod.col]
          if (test.fill !== 'wall' && !test.onFire) {
            if (Math.random() < MECHANICS.fire.spreads) {
              test.lightFire()
              add.push(test)
            }
          }
        }
      }

      for (let i = 0; i < add.length; i++) {
        this.fire.push(add[i])
      }
    }
  }

  generateLevel () {
    state.setGameState(1)
    setTimeout(() => {
      this.setlevelMechanics()
      this.generateDistances()
      this.generateLocations()
      this.initPieces()
      this.renderBoard()
      state.setGameState(0)
    }, 3000)
  }

  finishLevel () {
    // Add level finish scores
    this.player.addScore(Math.floor(this.levelMechanics.modifier * MECHANICS.score.level))
    if (this.playableObjects <= 0) { // Cleared Board
      this.player.addScore(Math.floor(this.levelMechanics.modifier * MECHANICS.score.clean))
    }
    // Hide the board
    this.blankBoard(false)
    this.level += 1
    this.generateLevel()
  }

  killPlayer (message) {
    // console.log(message)
    $('#game-status').html(message)
    if (this.player.lives > 0) {
      state.setGameState(1)
      this.blankBoard(false)
      this.player.lives -= 1
      this.generateLevel()
    } else {
      this.blankBoard(true)
      state.setGameState(2)
      score.logScore()
      score.getScores()
    }
  }

  updateStatusBar () {
    $('#game-status').text(`LEVEL: ${this.level} LIVES: ${this.player.lives}    SCORE:  ${this.player.score}`)
  }
}

module.exports = Game
