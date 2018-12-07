'use strict'

const api = require('./scores-api.js')
const store = require('../store.js')
const scoresTemplate = require('../templates/scores.handlebars')

const logScore = () => {
  if (store.game.player.score > 0) {
    const data = {
      score: {
        points: store.game.player.score,
        level: store.game.level,
        username: store.user.email
      }
    }
    api.logScore(data)
      .then(getScores)
      .catch(console.error)
  }
}

const getScores = () => {
  api.getScores()
    .then(showHighScores)
    .catch(console.error)
}

const onDeleteItem = (id) => {
  api.deleteScore(id)
    .then(getScores)
    .catch(console.error)
}

const showHighScores = (response) => {
  for (let i = 0; i < response.scores.length; i++) {
    if (response.scores[i].username === store.user.email && store.user.email !== 'Guest') {
      response.scores[i].owned = true
    } else {
      response.scores[i].owned = false
    }
  }

  const scores = []
  if (store.highScoresLength === undefined) {
    store.highScoresLength = 100
  }
  while (response.scores.length > 0 && scores.length < store.highScoresLength) {
    let max = response.scores[0].points
    let maxIdx = 0
    for (let i = 0; i < response.scores.length; i++) {
      if (response.scores[i].points > max) {
        max = response.scores[i].points
        maxIdx = i
      }
    }
    response.scores[maxIdx].rank = scores.length + 1
    scores.push(response.scores[maxIdx])
    response.scores.splice(maxIdx, 1)
  }
  const scoresHTML = scoresTemplate({scores: scores})
  $(`#scores`).html(scoresHTML)

  for (let i = 0; i < scores.length; i++) {
    if (scores[i].owned) {
      $(`#${scores[i]._id}-delete`).on('click', () => {
        onDeleteItem(scores[i]._id)
      })
    }
  }
}

module.exports = {
  logScore,
  getScores
}
