'use strict'

const store = require('../store.js')
const state = require('../states.js')

const signUpSuccess = (response) => {
  $('#auth_messages').html('')
  const userHTML = (`
    <h4> New User: ${response.user.email}</h4>
    `)
  $('#auth_messages').html(userHTML)
  $('#sign-up-box').hide()
  $('#sign-in-box').show()
}

const signInSuccess = (response) => {
  $('#auth_messages').html('')
  const userHTML = (`
    <h5>${response.user.email}<h5>
    `)
  $('#user-message').html(userHTML)
  store.user = response.user

  state.setAuthState(1)
}

const changePasswordSuccess = (response) => {
  $('#auth_messages').html('')
  const responseHTML = (`
    <h6>Password Changed!</h6>
    `)
  $('#auth_messages').html(responseHTML)
}

const signOutSuccess = (response) => {
  $('#user-message').html(`<h5> Signed Out </h5>`)
  state.setAuthState(0)
}

// OPTIMIZE: Create failure functions for each possible state rather than a blanket case
const failure = (response) => {
  const responseHTML = (`
    <h3>ERROR: Failed to authenticate with server</h3>
    `)
  $('#auth_messages').html(responseHTML)
}

module.exports = {
  signUpSuccess,
  signInSuccess,
  changePasswordSuccess,
  signOutSuccess,
  failure
}
