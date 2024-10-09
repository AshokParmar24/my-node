const env = require('dotenv')
const mongooseserver = require("./config/mongooseServer")
const http = require("http")
const app = require("./config/express")


env.config()

const server = http.createServer(app)
const port = process.env.PORT || 3000;

console.log("good evening")

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

mongooseserver?.connect()
