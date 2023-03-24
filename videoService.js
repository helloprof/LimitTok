// const fs = require("fs")
// let videos = []
// let tags = []
const Sequelize = require('sequelize');

var sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_DB, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// // Channel 
// var Channel = sequelize.define('Channel', {
//     channel: Sequelize.STRING
// })

// Video 
var Video = sequelize.define('Video', {
    title: Sequelize.STRING,
    description: Sequelize.TEXT,
    date: Sequelize.DATE,
    likes: {
        type: Sequelize.INTEGER,
        defaultValue: 0 
    },
    videoFile: Sequelize.STRING
})

// Tag 
var Tag = sequelize.define('Tag', {
    tag: Sequelize.STRING
})

Video.belongsTo(Tag, {foreignKey: 'tag'})
// Video.belongsTo(Channel, {foreignKey: 'channel'})

module.exports.initialize = () => {
    return new Promise((resolve, reject) => {
        sequelize.sync().then(() => {
            console.log("POST GRES DB LOADED")
            resolve()
        }).catch((err) => {
            console.log("POST GRES DB SYNC FAILED - ERR: "+err)
            reject()
        })
    })
}

module.exports.getTags = () => {
    return new Promise((resolve, reject) => {
        // if (tags.length > 0 ) {
        //     resolve(tags)
        // } else {
        //     reject("no genres")
        // }
        Tag.findAll().then((tags) => {
            resolve(tags)
        }).catch((err) => {
            reject(err)
        })
    })
}

module.exports.getVideos = () => {
    return new Promise((resolve, reject) => {
        // if (videos.length > 0 ) {
        //     resolve(videos)
        // } else {
        //     reject("no videos")
        // }
        Video.findAll().then((videos) => {
            resolve(videos)
        }).catch((err) => {
            reject(err)
        })
    })
}

module.exports.getVideoByID = (id) => {
    return new Promise((resolve, reject) => {
        // const videoArray = videos.filter(vid => vid.id == id )
        // if (videoArray) {
        //     resolve(videoArray)
        // } else {
        //     reject("no videos")
        // }
        Video.findOne({
            where: {
                id: id
            }
        }).then((video) => {
            resolve([video])
        }).catch((err) => {
            reject(err)
        })
    })
}

module.exports.getVideoByTag = (tag) => {
    return new Promise((resolve, reject) => {
        // const videoArray = videos.filter(vid => vid.tag == tag )
        // if (videoArray) {
        //     resolve(videoArray)
        // } else {
        //     reject("no videos")
        // }
        Video.findAll({
            where: {
                tag: tag
            }
        }).then((videos) => {
            resolve(videos)
        }).catch((err) => {
            reject(err)
        })
    })
}

module.exports.addBrief = (briefData) => {
    return new Promise((resolve, reject) => {
        // if (briefData) {
        //     briefData.id = videos.length + 1
        //     briefData.date = new Date()
        //     videos.push(briefData)
        //     console.log(briefData)
        //     resolve("success!")
        // } else {
        //     reject("failed!")
        // }
        briefData.date = new Date()
        Video.create(briefData).then(()=> {
            console.log("VIDEO ADDED SUCCESS")
            resolve()
        }).catch((err) => {
            console.log("VIDEO UPLOAD UNSUCCESSFUL")
            reject(err)
        })
    })
}

module.exports.addTag = (tagData) => {
    return new Promise((resolve, reject) => {
        // if (tagData) {
        //     tagData.id = tags.length + 1
        //     tags.push(tagData)
        //     console.log(tagData)
        //     resolve("success!")
        // } else {
        //     reject("failed!")
        // }

        Tag.create(tagData).then(() => {
            console.log("TAG CRATED")
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

module.exports.addLikeByVideo = (id) => {
    return new Promise((resolve, reject) => {

        Video.increment('likes', {
            by: 1,
            where: {
                id: id
            }
        }).then(() => {
            console.log("LIKED")
            resolve()
        }).catch((err) => {
            reject(err)
        })
    })
}

module.exports.deleteVideo = (id) => {
    return new Promise((resolve, reject) => {
        // const videoArray = videos.filter(vid => vid.tag == tag )
        // if (videoArray) {
        //     resolve(videoArray)
        // } else {
        //     reject("no videos")
        // }
        Video.destroy({
            where: {
                id: id
            }
        }).then(() => {
            console.log("VIDEO DELETED SUCCESS")
            resolve()
        }).catch((err) => {
            console.log("VIDEO DELETED failure")
            reject(err)
        })
    })
}

module.exports.deleteTag = (id) => {
    return new Promise((resolve, reject) => {
        // const videoArray = videos.filter(vid => vid.tag == tag )
        // if (videoArray) {
        //     resolve(videoArray)
        // } else {
        //     reject("no videos")
        // }
        Tag.destroy({
            where: {
                id: id
            }
        }).then(() => {
            console.log("TAG DELETED SUCCESS")
            resolve()
        }).catch((err) => {
            console.log("TAG DELETED failure")
            reject(err)
        })
    })
}