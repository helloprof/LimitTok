const express = require("express")
const app = express()
const path = require("path")
const multer = require("multer")
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
const env = require("dotenv")
env.config()
const exphbs = require("express-handlebars");

app.engine('.hbs', exphbs.engine({ extname: '.hbs',
  helpers: { 
    strong: function(options){
      return '<strong>' + options.fn(this) + '</strong>';
    },
    formatDate: function(dateObj){ 
      let year = dateObj.getFullYear(); 
      let month = (dateObj.getMonth() + 1).toString(); 
      let day = dateObj.getDate().toString(); 
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`; 
  } 
  }
}));
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

app.get("/tags/delete/:id", (req, res) => {
  videoService.deleteTag(req.params.id).then(() => {
    res.redirect("/tags/new")
  }).catch((err) => {
    console.log(err)
    res.send(err)
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


app.get("/videos/tag/:tag", (req, res) => {
  videoService.getVideoByTag(req.params.tag).then((videos) => {
    res.render('index', {
      data: videos,
      layout: 'main'
    })
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

app.get("/videos/delete/:id", (req, res) => {
  videoService.deleteVideo(req.params.id).then(() => {
    res.redirect("/")
  }).catch((err) => {
    console.log(err)
    res.send(err)
  })
})

app.get("/videos/likes/:id", (req, res) => {
  videoService.addLikeByVideo(req.params.id).then(() => {
    res.redirect("/")
  }).catch((err) => {
    console.log(err)
    res.send(err)
  })
})

app.get("/videos/:id", (req, res) => {
  videoService.getVideoByID(req.params.id).then((video) => {
    res.render('index', {
      data: video,
      layout: 'main'
    })
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