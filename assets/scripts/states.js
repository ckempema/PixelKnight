'use strict'

const current = {}
const store = require('./store.js')

const setAuthState = (newState) => {
  resetFormFields()
  switch (newState) {
    case 0: // Initial state, not logged in
      current.authState = 0
      store.game = undefined
      $('#unauthed-buttons').show()
      $('#instructions').show()

      $('#authed-buttons').hide()
      $('#sign-in-box').hide()
      $('#sign-up-box').hide()
      $('#ch-pwd-box').hide()
      $('#game').hide()
      break

    case 1: // Logged in
      current.authState = 1
      $('#authed-buttons').show()
      $('#game').show()
      $('#show-ch-pwd-button').show()

      $('#instructions').hide()
      $('#unauthed-buttons').hide()
      $('#sign-in-box').hide()
      $('#sign-up-box').hide()
      $('#ch-pwd-box').hide()
      break
    case 2: // Guest logged in
      current.authState = 1
      $('#authed-buttons').show()
      $('#game').show()

      $('#instructions').hide()
      $('#show-ch-pwd-button').hide()
      $('#unauthed-buttons').hide()
      $('#sign-in-box').hide()
      $('#sign-up-box').hide()
      $('#ch-pwd-box').hide()
      break
  }
}

const resetFormFields = () => {
  $('#sign-up-form').trigger('reset')
  $('#sign-in-form').trigger('reset')
  $('#change-password-form').trigger('reset')

  $('#auth_messages').html('')
  $('#game-status').html('')
  $('#game-board').html('')
  $('#flavor-text').html('')
  $('#scores').html('')
}

const setGameState = (newState) => {
  switch (newState) {
    case 0: // Playing
      $('#flavor-text').text(`Playing`)
      if (current.gameState !== 2) { // if game is not over then unpause
        current.gameState = 0
      } else {
        $('#flavor-text').text(`Game Over: unable to unpause`)
      }
      break

    case 1: // Paused (same state for both user pause and game pause)
      $('#flavor-text').text(`Level Paused`)
      current.gameState = 1
      break

    case 2: // Finished
      current.gameState = 2
      break
  }
}

const playing = () => {
  if (current.gameState === 0) {
    return true
  } else {
    return false
  }
}

module.exports = {
  current,
  setAuthState,
  setGameState,
  playing
}
