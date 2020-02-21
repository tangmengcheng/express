const express = require('./express');
const http = require('http');
const app = express();

app.use('/', (req, res, next) => {
    res.setHeader('Content-Type', 'text/html;charset=UTF-8;');
    next();
})

app.get('/name', (req, res) => {
    res.setHeader('Content-Type', 'text/html;charset=UTF-8;');
    res.end('前端')
})

app.post('/front', (req, res) => {
    res.json({
        name: 'front'
    })
})

app.listen(3000, () => {
    console.log('Server at port 3000')
})