const express = require("express")
const app = express()
const path = require("path")
const videoService = require("./videoService")

const HTTP_PORT = process.env.PORT || 8080

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static("public"))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname,"/views/index.html"))
})

app.get("/genres", (req,res) => {
  videoService.getGenres().then((genres) => {
    res.json(genres)
  }).catch((err) => {
    console.log(err)
    res.send(err)
  })
})

app.get("/videos", (req,res) => {
  videoService.getVideos().then((videos) => {
    res.json(videos)
  }).catch((err) => {
    console.log(err)
    res.send(err)
  })
})

app.use((req, res) => {
  res.status(404).send("Page Not Found")
})

videoService.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart)
})