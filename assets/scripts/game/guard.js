'use strict'

class Guard {
  constructor (tile) {
    this.setGuard(tile)
  }

  clearGuard () {
    this.tile.resetFill()
  }

  setGuard (tile) {
    this.tile = tile
    this.row = tile.row
    this.col = tile.col
    this.tile.setFill('guard', false)
  }
}

module.exports = Guard
