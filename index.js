const http = require("http")

const app = require("./app")

const server = http.createServer(app)

const {API_PORT} = process.env

const port = process.env.PORT || API_PORT

/* Listening to the port and logging the message to the console. */
server.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})