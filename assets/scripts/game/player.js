'use strict'

class Player {
  constructor () {
    this.tile = undefined
    this.row = undefined
    this.col = undefined
    this.score = 0
    this.lives = 1
  }

  setPlayer (tile) {
    this.tile = tile
    this.row = tile.row
    this.col = tile.col
    this.tile.setFill('player', false)
  }

  clearPlayerIcon () {
    this.tile.resetFill()
  }

  addScore (added) {
    this.score += added
  }
}

module.exports = Player
