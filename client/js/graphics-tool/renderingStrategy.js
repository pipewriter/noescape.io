const config = {
    vertFile: "testVert.glsl",
    fragFile: "testFrag.glsl",
    vertAttributes: [
        {
            handle: "vertPos",
            size: 3
        },
        {
            handle: "color",
            size:3
        }
    ],
    uniforms: [
        {
            handle: 'dist',
            type: 'vec2'
        },
        {
            handle: 'radius',
            type: 'float'
        }
    ]
}

async function initializeFromConfig({vertFile, fragFile, vertAttributes, uniforms}){
    let gl = window.gl;
    let [vertCode, fragCode] = await Promise.all([
        window.utils.makeRequest("GET", vertFile),
        window.utils.makeRequest("GET", fragFile)
    ]);

    const vShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vShader, vertCode);
    gl.compileShader(vShader);

    const fShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fShader, fragCode);
    gl.compileShader(fShader);

    if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) {
        throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);  
        gl.deleteShader(fShader);
    }
    if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) {
        throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);  
        gl.deleteShader(vShader);
    }
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, fShader);
    gl.attachShader(shaderProgram, vShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
    }

    gl.useProgram(shaderProgram);

    let uniformPerformers = [];
    if(uniforms){
        uniforms.forEach(({handle, type}) => {
            let loc = gl.getUniformLocation(shaderProgram, handle);
            let setUniform;
            if(type === 'vec2'){
                setUniform = (val) => {
                    gl.uniform2fv(loc, val);
                }
            }else if(type === 'float'){
                setUniform = (val) => {
                    gl.uniform1f(loc, val);
                }
            }
            uniformPerformers.push({
                handle,
                setUniform
            })
        })
    }

    const vertexBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer1);
    const triangleBuffer1 = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer1);


    let stride = 0;
    let offset = 0;
    vertAttributes.forEach(attrib => {
        stride += attrib.size;
        attrib.location = gl.getAttribLocation(shaderProgram, attrib.handle);
        attrib.offset = offset;
        offset += attrib.size;
    });

    return function _drawElements(vertexData, indexData, uniformData){

        gl.useProgram(shaderProgram);
        
        uniformPerformers.forEach(({handle, setUniform}) => {
            setUniform(uniformData[handle]);
        });
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer1);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertexData),gl.STATIC_DRAW);

        for(const attrib of vertAttributes){
            gl.enableVertexAttribArray(attrib.location);
            gl.vertexAttribPointer(
                attrib.location,
                attrib.size,
                gl.FLOAT,
                false,
                stride * Float32Array.BYTES_PER_ELEMENT,
                attrib.offset * Float32Array.BYTES_PER_ELEMENT
            );
        }

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer1);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexData),gl.STATIC_DRAW);

        gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
    }
};