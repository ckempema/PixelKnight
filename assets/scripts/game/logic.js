'use strict'

const state = require('../states.js')
const store = require('../store.js')
const Game = require('./game.js')
let intervals = false

const createGame = () => {
  store.gameSize = 30 // Only change gameSize with this variable
  store.game = new Game(store.gameSize)
  generateLevel()
  state.setGameState(1) // Start with the game paused
  if (!intervals) {
    setIntervals()
  }
}

const setIntervals = () => {
  intervals = true
  setInterval(() => {
    store.game.hunt()
  }, 500)

  setInterval(() => {
    store.game.spreadFire()
  }, 2000)

  setInterval(() => {
    store.game.moveGuards()
  }, 500)
}

const handleKeyPress = (key) => {
  store.game.keyPress(key)
}

const generateLevel = () => {
  store.game.generateLevel()
  state.setGameState(1)
}

const resetLevel = () => {
  // store.game.clearBoard()
  // store.game.initPieces()
  // state.setGameState(1)
}

module.exports = {
  createGame,
  handleKeyPress,
  generateLevel,
  resetLevel
}
