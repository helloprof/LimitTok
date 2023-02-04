const fs = require("fs")
let videos = []
let genres = []

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/videos.json', 'utf8', (err, data) => {
            if(err) {
                reject()
            } else {
                console.log(data)
                videos = JSON.parse(data)

                fs.readFile('./data/genres.json', 'utf8', (err, data) => {
                    if(err) {
                        reject()
                    } else {
                        console.log(data)
                        genres = JSON.parse(data)
                        resolve()
                    }
                })
            }
        })
    })
}

module.exports.getGenres = () => {
    return new Promise((resolve, reject) => {
        if (genres.length > 0 ) {
            resolve(genres)
        } else {
            reject("no genres")
        }
    })
}

module.exports.getVideos = () => {
    return new Promise((resolve, reject) => {
        if (videos.length > 0 ) {
            resolve(videos)
        } else {
            reject("no videos")
        }
    })
}