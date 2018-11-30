'use strict'

const store = require('../store.js')
const Game = require('./game.js')

const createGame = () => {
  store.gameSize = 30 // Only change gameSize with this variable
  store.game = new Game(store.gameSize)
  store.game.generatePseudoPrimMaze(3)
  store.game.renderBoard()

  // setInterval(() => {
  //   store.game.generatePseudoPrimMaze(2)
  //   store.game.renderBoard()
  // }, 5000)
  store.game.drawKey()
}

const handleKeyPress = (key) => {
  store.game.keyPress(key)
}
module.exports = {
  createGame,
  handleKeyPress
}
