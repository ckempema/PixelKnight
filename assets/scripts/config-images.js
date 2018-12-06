'use strict'

let imgUrl
const imgUrls = {
  production: 'https://ckempema.github.io/PixelKnight/public',
  development: '../../../public/'
}

if (window.location.hostname === 'localhost') {
  imgUrl = imgUrls.development
} else {
  imgUrl = imgUrls.production
}

module.exports = {
  imgUrl
}
