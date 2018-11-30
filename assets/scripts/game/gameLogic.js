'use strict'

const store = require('../store.js')
const Game = require('./game.js')

const createGame = () => {
  store.gameSize = 30 // Only change gameSize with this variable
  store.game = new Game(store.gameSize)
  store.game.renderBoard()
  store.game.generateMaze()
}

module.exports = {
  createGame
}
