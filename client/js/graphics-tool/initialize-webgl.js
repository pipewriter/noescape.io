window.initializeWebGL = (function initializeWebGL(){
    gl = window.canvas.el.getContext("webgl");
    gl.clearColor(0.8,0.5,0,1.0);
    gl.clearDepth(1.0);
    // gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    window.gl = gl;
})();