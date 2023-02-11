const express = require("express")
const app = express()
const path = require("path")
const multer = require("multer")
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const env = require("dotenv")
env.config()

const videoService = require("./videoService")

const upload = multer()

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_API_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

app.use(express.urlencoded({ extended: true }));

const HTTP_PORT = process.env.PORT || 8080

function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static("public"))

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/index.html"))
})

app.get("/tags", (req, res) => {
  videoService.getTags().then((tags) => {
    res.json(tags)
  }).catch((err) => {
    console.log(err)
    res.send(err)
  })
})

app.get("/tags/add", (req, res) => {
  res.sendFile(path.join(__dirname,"/views/newTag.html"))
})

app.post("/tags/add", (req, res) => {
  videoService.addTag(req.body).then(() => {
    res.redirect("/tags")
  }).catch((err)=> {
    res.redirect("/tags/add")
  })
})

app.get("/videos", (req, res) => {
  videoService.getVideos().then((videos) => {
    res.json(videos)
  }).catch((err) => {
    console.log(err)
    res.send(err)
  })
})

app.get("/new", (req, res) => {
  res.sendFile(path.join(__dirname, "/views/newBrief.html"))
})

app.post("/new", upload.single("upload"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          (error, result) => {
            if (result) {
              resolve(result);
            } else {
              reject(error);
            }
          }
        );

        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    async function upload(req) {
      let result = await streamUpload(req);
      console.log(result);
      return result;
    }

    upload(req).then((uploaded) => {
      processPost(uploaded.url);
    });
  } else {
    processPost("");
  }

  function processPost(imageUrl) {
    req.body.upload = imageUrl;
    videoService.addBrief(req.body).then(() => {
      res.redirect("/videos")
    }).catch((err) => {
      res.redirect("/new")
    })
  }

})

app.use((req, res) => {
  res.status(404).send("Page Not Found")
})

videoService.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart)
})