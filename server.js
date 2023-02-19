const express = require("express")
const app = express()
const path = require("path")
const multer = require("multer")
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const env = require("dotenv")
env.config()
const exphbs = require("express-handlebars");

app.engine('.hbs', exphbs.engine({ extname: '.hbs' }));
app.set('view engine', '.hbs');

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
  videoService.getVideos().then((videos) => {
    res.render('index', {
      data: videos,
      layout: 'main'
    })
  }).catch((err) => {
    console.log(err)
    res.send(err)
  })

  // res.sendFile(path.join(__dirname, "/views/index.html"))
})

app.get("/tags", (req, res) => {
  videoService.getTags().then((tags) => {
    res.json(tags)
  }).catch((err) => {
    console.log(err)
    res.send(err)
  })
})

app.get("/tags/new", (req, res) => {

  // var a = [{id:1, tag: "blah"},{id: 2, tag: "blah blah"}]
  videoService.getTags().then((tags) => {
    res.render('newTag', {
      data: tags,
      layout: 'main'
    })
  }).catch((err) => {
    console.log(err)
    res.send(err)
  })

  // res.sendFile(path.join(__dirname,"/views/newTag.html"))
})

app.post("/tags/new", (req, res) => {
  videoService.addTag(req.body).then(() => {
    res.redirect("/tags/new")
  }).catch((err)=> {
    res.redirect("/tags/new")
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

app.get("/videos/new", (req, res) => {

  videoService.getTags().then((tags) => {
    res.render('newBrief', {
      data: tags,
      layout: 'main'
    })
  }).catch((err) => {
    console.log(err)
    res.send(err)
  })
  // res.sendFile(path.join(__dirname, "/views/newBrief.html"))
})

app.post("/videos/new", upload.single("videoFile"), (req, res) => {
  if (req.file) {
    let streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          {resource_type: "video"},
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

  function processPost(videoURL) {
    req.body.videoFile = videoURL;
    videoService.addBrief(req.body).then(() => {
      res.redirect("/")
    }).catch((err) => {
      res.redirect("/videos/new")
    })
  }

})

app.use((req, res) => {
  res.status(404).send("Page Not Found")
})

videoService.initialize().then(() => {
  app.listen(HTTP_PORT, onHttpStart)
})