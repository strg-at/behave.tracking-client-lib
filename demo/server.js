path = require('path')
express = require('express')

const app = express()
const port = 8000

app.use('/', express.static(path.join(__dirname, '.')))

app.listen(port, () => console.log(`\nDemo app listening on http://localhost:${port}`))
