const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mandelbrotGenerator = require('./mandelbrotGenerator');


const app = express();
app.use(cors())
const port = process.argv[2] || process.env.PORT || 3004;



// app.use(morgan('dev'))

app.get('/', (req, res) => {
    
    const { real, imaginary, iterations } = req.query
    // res.send(`Hello from port ${port} ${real} ${imaginary} ${iterations}`);
    let result = mandelbrotGenerator(real, imaginary, iterations)
    
    // console.log(`Hello from port ${port} console`);
    res.send({
        rgba: result
    });
});

app.listen(port, () => {
    console.log(`server is up on port ${port}`);
})