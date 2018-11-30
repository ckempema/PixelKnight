'use strict'

const store = require('../store.js')
const ALLOWEDFILLS = ['wall', 'empty', 'start', 'finish', 'path']

class Tile {
  constructor (row, col) {
    this.content = 'wall'
    this.row = row
    this.col = col
    this.id = `game-box-${row}-${col}`
    this.inBounds = this.row > 0 && this.col > 0 && this.row <= store.gameSize && this.col <= store.gameSize
    this.dist = Infinity
    this.prev = null
  }

  renderHTML () {
    const tileHTML = (`
      <div id=${this.id} class="game-tile ${this.content}"></div>
      `)
    return tileHTML
  }

  setFill (newFill) {
    if (ALLOWEDFILLS.includes(newFill)) {
      this.content = newFill
      this.updateRender()
    } else {
      console.log('Invalid fill sent to tile.setFill', newFill, `Location X${this.row}, Y${this.col}`) // NOTE: Remove
    }
  }

  updateRender () {
    for (let i = 0; i < ALLOWEDFILLS.length; i++) {
      $(`#${this.id}`).removeClass(ALLOWEDFILLS[i])
    }
    $(`#${this.id}`).addClass(this.content)
  }
}

module.exports = Tile
