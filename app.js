const express = require('express')
const path = require('path')
const dotenv = require('dotenv')
dotenv.config()

const app = express()
const appRouter = require(path.join(__dirname, 'routers', 'appRouter.js'))

app.use('/', appRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`)
})