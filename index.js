const express      = require('express')
const app          = express()
const server       = require('http').Server(app)
const bodyParser   = require('body-parser')
const cookieParser = require('cookie-parser')
const DB           = require('./db')

app.use(bodyParser.urlencoded({extended : true}))
app.use(cookieParser())
app.use(express.static(__dirname + '/public'))

server.listen(44004)

app.get('/', (req, res) => {
    res.sendFile('index.html', {root: __dirname })
})

app.get('/check_rights', (req, res) => {
    checkRights(req.cookies, (data) => {
        res.status(200).send(data)
    })
})

app.post('/login', (req, res) => {
    login(req, res)
})

app.get('/tickets', (req, res) => {
    DB.getTickets((tickets) => {
        res.status(200).send(tickets)
    })
})

app.post('/new_ticket', (req, res) => {
    login(req, res)
})

app.get('/logout', (req, res) => {
    res.clearCookie('name')
    res.clearCookie('passhash')
    res.status(200).send({permissions:0})
})

function checkRights(cookies, callback) {
    if(cookies.name == undefined || cookies.passhash == undefined) {
        callback({permissions:0})
    } else {
        DB.autoLogin(cookies.name, cookies.passhash, (o) => {
            if(o != null){
                callback({permissions:o.permissions})
            } else {
                callback({permissions:0})
            }
        })
    }
}

function login(req, res) {
    DB.manualLogin(req.body.name, req.body.password, (e, o) => {
        if (!o){
            res.send(e, 400)
        } else {
            res.cookie('name', o.name, { maxAge: 30*60*1000 })
            res.cookie('passhash', o.passhash, { maxAge: 30*60*1000 })
            res.status(200).send({permissions:o.permissions})
        }
    })
}