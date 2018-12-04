'use strict'

const state = require('../states.js')
const store = require('../store.js')
const Game = require('./game.js')

const createGame = () => {
  store.gameSize = 30 // Only change gameSize with this variable
  store.game = new Game(store.gameSize)
  generateLevel()
  setInterval(() => {
    store.game.hunt(store.game.player)
  }, 300)
}

const handleKeyPress = (key) => {
  store.game.keyPress(key)
}

const generateLevel = () => {
  state.setGameState(1)
  store.game.generateLocations()
  store.game.generatePseudoPrimMaze(4)
  store.game.renderBoard()
}

const resetLevel = () => {
  store.game.clearBoard()
  store.game.initBoard()
}

module.exports = {
  createGame,
  handleKeyPress,
  generateLevel,
  resetLevel
}
