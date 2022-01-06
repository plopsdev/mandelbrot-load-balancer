const math = require('mathjs')

const mandelbrotGenerator = (real, imaginary, iterations) => {
    // console.log(`computing ${real}; ${imaginary}`)
    const isInMandelbrot = (iterations, real, imaginary) => {
        const computeModule = (complex) => {
            return Math.sqrt(Math.pow(Math.abs(math.re(complex)), 2) + Math.pow(Math.abs(math.im(complex)), 2))   
        }

        let previousZ = math.complex(0, 0)
        let z = math.complex(0, 0)
        for (let i = 0; i<iterations; i++){
            // console.log(i)
            if (i === 0){
                z = math.complex(0, 0)
            }
            else {
                z = math.add(math.multiply(previousZ, previousZ), math.complex(real, imaginary));
                if (computeModule(z) > 2){
                    // console.log('In the Mandelbrot')
                    return i
                }
            }
            previousZ = z
        }
        // console.log('Not in Mandelbrot')
        return -1
    }

    let result = isInMandelbrot(iterations, real, imaginary)

    if (result === -1){
        return [0, 0, 0, 255]
    } else {
        return [(35*result)%256, (result/iterations)*255, (10*result)%256, 255]
    }
}

module.exports = mandelbrotGenerator;