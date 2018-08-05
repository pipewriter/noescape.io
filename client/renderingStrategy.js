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
    ]
}

async function initializeFromConfig({vertFile, fragFile, vertAttributes}){
    let gl = window.gl;
    let [vertCode, fragCode] = await Promise.all([
        window.utils.makeRequest("GET", vertFile),
        window.utils.makeRequest("GET", fragFile)
    ]);
    console.log(vertCode);
    
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
    console.log(shaderProgram);

    const vertexBuffer = gl.createBuffer();
    const triangleBuffer = gl.createBuffer();

    let stride = 0;
    vertAttributes.forEach(attrib => {
        stride += attrib.size;
    });

    let offset = 0;
    for(const vertAttrib of vertAttributes){
        const attrib = gl.getAttribLocation(shaderProgram, vertAttrib.handle); 
        gl.enableVertexAttribArray(attrib);
        gl.vertexAttribPointer(
            attrib,
            vertAttrib.size,
            gl.FLOAT,
            false,
            stride * Float32Array.BYTES_PER_ELEMENT,
            offset * Float32Array.BYTES_PER_ELEMENT
        );
        offset += vertAttrib.size; 
    }
    return function _drawElements(vertexData, indexData){
        gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertexData),gl.STATIC_DRAW);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indexData),gl.STATIC_DRAW);

        gl.drawElements(gl.TRIANGLES, indexData.length, gl.UNSIGNED_SHORT, 0);
    }
};