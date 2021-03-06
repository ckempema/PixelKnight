'use strict'

class Hunter {
  constructor (tile) {
    this.setHunter(tile)
  }

  clearHunter () {
    this.tile.resetFill()
  }

  setHunter (tile) {
    this.tile = tile
    this.row = tile.row
    this.col = tile.col
    this.tile.setFill('hunter', false)
  }
}

module.exports = Hunter
