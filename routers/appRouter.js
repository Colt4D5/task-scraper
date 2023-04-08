const express = require('express')
const router = express.Router()
const path = require('path')

const appControllers = require(path.join(__dirname, '..', 'controllers', 'appController.js'))

router
  .route('/')
    .get(appControllers.getTasks)

module.exports = router