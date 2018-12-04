'use strict'
const Tile = require('./tile.js')

const DIRECTIONS = ['up', 'down', 'left', 'right']

class Hunter {
  constructor (tile) {
    this.movement = 'random'
    this.tile = tile
    this.row = tile.row
    this.col = tile.col
    this.setDirection()
    this.tile.setFill('hunter', false)
  }

  setDirection () {
    this.direction = DIRECTIONS[Math.floor(Math.random() * 4)]
  }

  clearTile () {
    this.tile.resetFill()
  }

  setHunterTile (tile) {
    this.tile = tile
    this.row = tile.row
    this.col = tile.col
    this.tile.setFill('hunter', false)
  }
}

module.exports = Hunter
