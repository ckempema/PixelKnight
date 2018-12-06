'use strict'

const authEvents = require('./auth/events.js')
const state = require('./states.js')
const logic = require('./game/logic.js')

$(() => {
  initAuthEventListeners()
  initGameEvents()
  state.setAuthState(0)
  logic.createGame()
})

const initAuthEventListeners = () => {
  $('#sign-up-form').on('submit', authEvents.onSignUp)
  $('#sign-in-form').on('submit', authEvents.onSignIn)
  $('#guest-button').on('click', authEvents.onGuestSignIn)
  $('#change-password-form').on('submit', authEvents.onChangePassword)
  $('#sign-out-button').on('click', authEvents.onSignOut)

  $('#show-sign-in-button').on('click', () => { $('#sign-in-box').show() })
  $('#cancel-sign-in-button').on('click', () => {
    $('#sign-in-box').hide()
    $('#sign-in-form').trigger('reset')
  })

  $('#show-sign-up-button').on('click', () => { $('#sign-up-box').show() })
  $('#cancel-sign-up-button').on('click', () => {
    $('#sign-up-box').hide()
    $('#sign-up-form').trigger('reset')
  })

  $('#show-ch-pwd-button').on('click', () => { $('#ch-pwd-box').show() })
  $('#cancel-ch-pwd-button').on('click', () => {
    $('#ch-pwd-box').hide()
    $('#change-password-form').trigger('reset')
  })
}

const initGameEvents = () => {
  const reserved = [32, 37, 38, 39, 40] // Keys used for gameplay
  $(document).keydown((key) => {
    if (reserved.includes(key.which)) {
      key.preventDefault()
      logic.handleKeyPress(key.which)
    }
  })
  $('#reset-game-button').on('click', logic.createGame)
}
