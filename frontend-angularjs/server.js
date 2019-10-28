const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 8080

app.use(express.static(path.join(__dirname, 'dist')))

app.get('/liveness', (_, res) => {
  res.json({ pxg: '100k' })
})

app.get('/', (req, res) => res.sendFile(path.join(`${__dirname}/dist/index.html`)))

const server = app.listen(PORT, (err) => {
  if (err) {
    // eslint-disable-next-line
    console.error(`There's something errors: ${err}`)
  }
  // eslint-disable-next-line
  console.log(`Running on port ${PORT}`)
})
