'use strict'

const current = {}

const setAuthState = (newState) => {
  resetFormFields()
  switch (newState) {
    case 0: // Initial state, not logged in
      current.authState = 0
      $('#unauthed-buttons').show()

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

      $('#unauthed-buttons').hide()
      $('#sign-in-box').hide()
      $('#sign-up-box').hide()
      $('#ch-pwd-box').hide()
  }
}

const resetFormFields = () => {
  $('#sign-up-form').trigger('reset')
  $('#sign-in-form').trigger('reset')
  $('#change-password-form').trigger('reset')
}

const setGameState = (newState) => {
  switch (newState) {
    case 0: // Playing
      current.gameState = 0
      break

    case 1: // Paused
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
