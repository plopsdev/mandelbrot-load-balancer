import { useEffect, useRef, useState } from 'react';
import './App.css';
import axios from 'axios'

function App() {
    const [imageArray, setImageArray] = useState([])

    const [imageWidth, setImageWidth] = useState(30)
    const [imageHeight, setImageHeight] = useState(20)
    const [iterations, setIterations] = useState(10)
    const [timeToRender, setTimeToRender] = useState(0)

    const complexPlane = {
        real: {
            start: -2,
            end: 1,
            total: 3 
        },
        imaginary: {
            start: -1,
            end: 1,
            total: 2
        }
    }

    const canvasRef = useRef(null)
    const contextRef = useRef(null)

    useEffect(() => {
        //draw the mandelbrot image when the imageArray is updated
        const canvas = canvasRef.current;
        canvas.width = imageWidth
        canvas.height = imageWidth/1.5;
        const context = canvas.getContext('2d'); 
        const imageData = context.createImageData(imageWidth, imageWidth/1.5)
        for (let i = 0; i < imageData.data.length; i += 4) {
            imageData.data[i] = imageArray[i];  // R value
            imageData.data[i + 1] = imageArray[i + 1];    // G value
            imageData.data[i + 2] = imageArray[i + 2];  // B value
            imageData.data[i + 3] = imageArray[i + 3];  // A value
        }
        context.putImageData(imageData, 0, 0);
        contextRef.current = context;
    }, [imageArray])

    const computeComplexCoordinates = (x, y, halfPixelSize) => {
        let real = complexPlane.real.start + (x/imageWidth)*complexPlane.real.total - halfPixelSize
        let imaginary = complexPlane.imaginary.end - (y/imageHeight)*complexPlane.imaginary.total + halfPixelSize
        
        return {real: real, imaginary: imaginary}
    }

    const handleSubmit = async(event) => {
        event.preventDefault();
        const startTime = Date.now()
        const halfPixelSize = (complexPlane.imaginary.total/imageHeight)/2
        let requests = []
        let total = 0;
        console.log(imageHeight, imageWidth)
        //create the requests to send 
        for (let y=1; y<=imageHeight; y++){
            for (let x=1; x<=imageWidth; x++){
                total++
                let { real, imaginary } = computeComplexCoordinates(x, y, halfPixelSize)
                requests.push({real: real, imaginary: imaginary, iterations: iterations})
            }
        }
        console.log(total)
        //divide all the requests into multiple smaller groups of fewer requests (150)
        let numberOfDivision = requests.length/150
        console.log(requests.length)
        let mandelbrotImage=[]

        function delay(n){
            return new Promise(function(resolve){
                setTimeout(resolve,n);
            });
        }
        //for each groupe of request, send it
        for (let i=0; i<numberOfDivision; i++){
            let partialRequest = requests.filter((_, index) => ((index < (requests.length/numberOfDivision + i*requests.length/numberOfDivision)) && (index >= i*requests.length/numberOfDivision)))
            let partialResponse = (await Promise.all(partialRequest.map((params) => axios.get('http://localhost', {params: params})))).map(response =>  response.data)
            mandelbrotImage = mandelbrotImage.concat(partialResponse)
            console.log(i,' out of ', numberOfDivision)
            await delay(50)
        }
        console.log(mandelbrotImage)

        let finalImage = []

        for (let pixel of mandelbrotImage){
            finalImage.push(...pixel.rgba)
        }
        setImageArray(finalImage)
        const stopTime = Date.now()
        setTimeToRender((stopTime - startTime)/1000)
    }

    return(
        <div>
            <form onSubmit={handleSubmit} >
                <canvas ref={canvasRef}></canvas>
                <label>Choose image size:
                    <select onChange={(e) => {
                        setImageWidth(e.target.value);
                        setImageHeight(e.target.value*2/3)
                    }}>
                        <option value={30}>30x20</option>
                        <option value={60}>60x40</option>
                        <option value={120}>120x80</option>
                        <option value={240}>240x160</option>
                        <option value={480}>480x320</option>
                    </select>
                </label>
                <label>Choose number of iterations:
                    <select onChange={(e) => setIterations(e.target.value)}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                        <option value={10000}>10000</option>
                    </select>
                </label>
                <input type="submit" />
            </form>
            <h3>Time to render : {timeToRender} seconds</h3>
        </div>
    )
}

export default App;
