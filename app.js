const express = require('express');
const path = require('path')

const app = express();

/*
* Start a simple web server on port 5000
*/
app.listen(5000);

app.get('', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/:fileName', (req, res) => {
    res.sendFile(path.join(__dirname, req.params['fileName']));
})
