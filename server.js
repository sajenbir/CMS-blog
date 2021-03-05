if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const articleRouter =  require('./routes/articles')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users= []

mongoose.connect('mongodb://localhost/blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
    
}) 

app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: false}));

app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session()) 
app.use(methodOverride('_method')) 

app.get('/', async(req,res)=>{
    res.render('homepage')
})

app.use('/blog', checkAuthenticated, articleRouter)

app.get('/login', checkNotAuthenticated, (req,res) =>{
    res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/blog',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req,res) =>{
    res.render('register')
})
app.post('/register', checkNotAuthenticated, async(req,res)=>{
try{
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
        id: Date.now().toString(),
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    })
    res.redirect('/login')
} catch{
    res.redirect('/register')
}
})
app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/')
  })

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login')
}

 function checkNotAuthenticated(req, res, next){
     if(req, isAuthenticated()){
        return res.redirect('/')
     }
     next()
 }

 function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }

    res.redirect('/login')
  }

  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/')
    }
    next()
  }
app.listen(8000)