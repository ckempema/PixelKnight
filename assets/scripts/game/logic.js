'use strict'

const state = require('../states.js')
const store = require('../store.js')
const Game = require('./game.js')

const createGame = () => {
  store.gameSize = 30 // Only change gameSize with this variable
  store.game = new Game(store.gameSize)
  state.setGameState(0) // set game state to playing
  store.game.generatePseudoPrimMaze(3)
  store.game.renderBoard()

  store.game.drawKey()
}

const handleKeyPress = (key) => {
  store.game.keyPress(key)
}
module.exports = {
  createGame,
  handleKeyPress
}
