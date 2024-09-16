import express from 'express'

const app = express()

app.use('/',(req, res)=>{
    res.send("Pern-chat-app")
})

app.listen(5000, ()=>{
    console.log('Server running on port 5000')
})