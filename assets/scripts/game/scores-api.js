'use strict'

const config = require('../config.js')
const store = require('../store.js')

const logScore = (data) => {
  return $.ajax({
    headers: {
      Authorization: `Token token=${store.user.token}`
    },
    url: config.apiUrl + '/scores',
    method: 'POST',
    data: data
  })
}

const getScores = () => {
  return $.ajax({
    headers: {
      Authorization: `Token token=${store.user.token}`
    },
    url: config.apiUrl + '/scores',
    method: 'GET'
  })
}

const deleteScore = (id) => {
  return $.ajax({
    url: config.apiUrl + '/scores/' + id,
    method: 'DELETE',
    headers: {
      Authorization: `Token token=${store.user.token}`
    }
  })
}

module.exports = {
  logScore,
  getScores,
  deleteScore
}
