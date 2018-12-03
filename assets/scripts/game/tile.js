'use strict'

const store = require('../store.js')
const ALLOWEDFILLS = ['wall', 'empty', 'start', 'finish', 'path', 'player', 'hunter', 'key']

const IMAGED = ['player', 'hunter','key']

class Tile {
  constructor (row, col) {
    this.fill = 'wall'
    this.row = row
    this.col = col
    this.id = `game-box-${row}-${col}`
    this.inBounds = this.row > 0 && this.col > 0 && this.row <= store.gameSize && this.col <= store.gameSize
    this.dist = Infinity
    this.prev = null
  }

  constructHTML () {
    let tileHTML
    if (IMAGED.includes(this.fill)) {
      tileHTML = (`
        <div id=${this.id} class="game-tile ${this.fill}">
          <img src="../../../public/${this.fill}.png" alt="Key" class="sprite">
        </div>
      `)
    } else {
      tileHTML = (`
        <div id=${this.id} class="game-tile ${this.fill}"></div>
      `)
    }
    return tileHTML
  }

  setFill (newFill) {
    if (ALLOWEDFILLS.includes(newFill)) {
      this.fill = newFill
      this.updateRender()
    } else {
      console.error('Invalid fill sent to tile.setFill', newFill, `Location X${this.row}, Y${this.col}`) // NOTE: Remove
    }
  }

  updateRender () {
    $(`#${this.id}`).removeClass()
    if (IMAGED.includes(this.fill)) {
      const img = (
        `<img src="../../../public/${this.fill}.png" alt="Key" class="sprite">`
      )
      $(`#${this.id}`).html(img)
      $(`#${this.id}`).addClass('game-tile')
      $(`#${this.id}`).addClass('sprite')
    } else {
      $(`#${this.id}`).addClass('game-tile')
      $(`#${this.id}`).addClass(this.fill)
      $(`#${this.id}`).html('')
    }
  }
}

module.exports = Tile
