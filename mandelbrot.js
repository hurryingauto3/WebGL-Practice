//EDIT THE VALUE OF n_t HERE
/////////////////////////
var n_t = 50;////////////
////////////////////////

var gl, program, canvas;
var vertices = []
var colors = []
var vertex_buffer, vPosition, color_buffer, vColor

function f(z, c)
{
    var zSq;
    zSq = vec2(z[0] * z[0] - z[1] * z[1], 2 * z[0] * z[1]);
    return add(zSq, c);

}

function escapeTime(c, n_t) //function to calculate excapeTime
{
    var z = vec2(0.0,0.0);
    var iterations = 0;
    while (length(z) <= 2 && iterations < n_t)
    {
        if ( iterations === n_t)
        {
            return n_t;  //return max iterations if complex number does not escape
        }

        z = f(z,c);  //Calculating value of complex number in madelbrot set
        iterations++;
    }
    return iterations;
}

function HSVtoRGB(h, s, v) {  //Function to convert HSV to RGB
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return vec4(r, g, b, 1.0);
}

function WebGLSetup(){
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }
    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0);
    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
}

function Buffer(vertices, colors){

        // Load the data into the GPU
        vertex_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
        // Associate out shader variables with our data buffer
        vPosition = gl.getAttribLocation(program, "vPosition");
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
    
        color_buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
        vColor = gl.getAttribLocation(program, "vColor");
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
}

function MandelBrotMaker(){
    var m
    var hue;
    var saturation;
    var value;

    for ( var y = -1; y < 1; y += 2 / canvas.height)
    {
        for ( var x = -1; x < 1; x += 2 / canvas.width)
        {
            vertices.push(vec2(x, y));  //Adding every vertex row-by-row to vertices list
            complex = vec2(x * 2, y *2);  // Finding the complex value of every pixel
            m = escapeTime(complex, n_t);  // Finding the excape Time for every pixel
            hue = m / n_t;
            saturation = 1;
            value = m != n_t ? 1 : 0;  // Pixel is black if its complex value is in the madelbrot set
            colors.push(HSVtoRGB(hue, saturation, value));  // Converting HSV to RGB
        }
    }
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.PIXELS, 0, vertices.length); //Rendering the triangle
}

window.onload = function init() {

    WebGLSetup();
    MandelBrotMaker()
    Buffer(vertices, colors)
    render();
};