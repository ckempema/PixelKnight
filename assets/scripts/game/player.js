'use strict'

class Player {
  constructor () {
    this.tile = undefined
    this.row = undefined
    this.col = undefined
    this.score = 0
    this.lives = 3
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
}

module.exports = Player
