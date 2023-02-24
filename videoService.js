const fs = require("fs")
let videos = []
let tags = []

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        fs.readFile('./data/videos.json', 'utf8', (err, data) => {
            if(err) {
                reject()
            } else {
                videos = JSON.parse(data)

                fs.readFile('./data/tags.json', 'utf8', (err, data) => {
                    if(err) {
                        reject()
                    } else {
                        tags = JSON.parse(data)
                        resolve()
                    }
                })
            }
        })
    })
}

module.exports.getTags = () => {
    return new Promise((resolve, reject) => {
        if (tags.length > 0 ) {
            resolve(tags)
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

module.exports.getVideoByID = (id) => {
    return new Promise((resolve, reject) => {
        const videoArray = videos.filter(vid => vid.id == id )
        if (videoArray) {
            resolve(videoArray)
        } else {
            reject("no videos")
        }
    })
}

module.exports.getVideoByTag = (tag) => {
    return new Promise((resolve, reject) => {
        const videoArray = videos.filter(vid => vid.tag == tag )
        if (videoArray) {
            resolve(videoArray)
        } else {
            reject("no videos")
        }
    })
}

module.exports.addBrief = (briefData) => {
    return new Promise((resolve, reject) => {
        if (briefData) {
            briefData.id = videos.length + 1
            briefData.date = new Date()
            videos.push(briefData)
            console.log(briefData)
            resolve("success!")
        } else {
            reject("failed!")
        }

    })
}

module.exports.addTag = (tagData) => {
    return new Promise((resolve, reject) => {
        if (tagData) {
            tagData.id = tags.length + 1
            tags.push(tagData)
            console.log(tagData)
            resolve("success!")
        } else {
            reject("failed!")
        }

    })
}