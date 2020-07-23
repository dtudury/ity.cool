const express = require('express')
const app = express()

app.use(express.static('docs'))

const port = +process.argv[2]
const server = app.listen(port || undefined)
console.log(`app started on port ${server.address().port}`)
