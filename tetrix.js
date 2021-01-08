var gl;
var vertices = [];
var colors = [];
var triVertices = [];
var triColors = [];
var sierColorf0 = vec4(0.68, 0.26, 0.34, 1.0);
var sierColorf1 = vec4(12 / 256, 33 / 256, 39 / 256, 1.0);
var sierColorf2 = vec4(212 / 256, 187 / 256, 163 / 256, 1.0);
var sierColorf3 = vec4(162 / 256, 200 / 256, 236 / 256);
var program
var canvas
var recursive_depth;
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");

//WebGL setup code
function WebGLSetup(){
    canvas = document.getElementById("gl-canvas");
    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }
    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1.0);
    gl.enable(gl.DEPTH_TEST);    //  Load shaders and initialize attribute buffers
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);
}

//Tetrix Creator
function tetrixRecursive(depth, startPoint, height)
{
    //Choses the four vertices of the tetrix
    var p0 = vec4(startPoint);
    var p3 = vec4(p0[0] + (height / 2), p0[1] + height, p0[2], 1);
    var p2 = vec4(p0[0] + height, p0[1], p0[2], 1);
    var p1 = vec4((p0[0] + p3[0] + p2[0]) / 3, (p0[1] + p3[1] + p2[1]) / 3, p0[2] + height, 1);
    //Base case
    if (depth == 0)
    {   
        //To create a connected triangle, each vertex shares 3 faces, 
        //therefore each vertex is duplicated three times

        vertices.push(p0, p1, p2, p1, p0, p3, 
                    p2, p1, p3, p0, p3, p2);
        
        //Similarly each vertex must have the same color on all faces

        colors.push(sierColorf0);
        colors.push(sierColorf1);
        colors.push(sierColorf2);
        colors.push(sierColorf1);
        colors.push(sierColorf0);
        colors.push(sierColorf3);
        colors.push(sierColorf2);
        colors.push(sierColorf1);
        colors.push(sierColorf3);
        colors.push(sierColorf0);
        colors.push(sierColorf3);
        colors.push(sierColorf2);
        
    }
    else 
    {
        // The recursive function is called for each face
        tetrixRecursive(depth - 1, startPoint, height / 2);
        tetrixRecursive(depth - 1, mix(p0, p2, 0.5), height / 2);
        tetrixRecursive(depth - 1, mix(p0, p3, 0.5), height / 2);
        tetrixRecursive(depth - 1, mix(p0, p1, 0.5), height / 2);
    
}}


window.onload = function init() {
    //Setup WebGL
    WebGLSetup();
    //Calls the tetrix Creator
    tetrixRecursive(slider.value, vec4(-0.5, 0, -0.5, 1), 0.5);
    
    //Load graphics data to buffer
    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);


    var matRotationUniformLocation = gl.getUniformLocation(program, "mRotation");
    //The angle from any axis is set to 0
    var angle = 0;
    //Rotation matrices are used to find the position on each axis
    var rotationXMatrix = rotateX(angle);
    var rotationYMatrix = rotateY(angle);
    var rotationZMatrix = rotateZ(angle);
    var sliVal;
    //Loop function declared
    var loop = function()
    {
        gl.clear(gl.COLOR_BUFFER_BIT);
        //Slider value is fed to the recursive tetrix function
        slider.oninput = function(){
            output.innerHTML = this.value;
            vertices = [];
            colors = [];
            sliVal = this.value;
            console.log(sliVal);
            tetrixRecursive(sliVal, vec4(-0.5, 0, -0.5, 1), 0.5);
            //The new grpahics data is fed to the buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
            gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
            gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

        };
        //The three radio buttons are defined
        rd1 = document.getElementById("x_axis").checked;
        rd2 = document.getElementById("y_axis").checked;
        rd3 = document.getElementById("z_axis").checked;
        
        //The angle is changed as the loop runs
        angle = performance.now() / 1000 / 6 * 2 * Math.PI * 100;

        rotationXMatrix = rotateX(angle);
        rotationYMatrix = rotateY(angle);
        rotationZMatrix = rotateZ(angle);
        
        //The radio buttons are checked to see which axis to rotate on
        if (rd1)
            gl.uniformMatrix4fv(matRotationUniformLocation, gl.false, flatten(rotationXMatrix));
        else if (rd2)
            gl.uniformMatrix4fv(matRotationUniformLocation, gl.false, flatten(rotationYMatrix));
        else if (rd3)
            gl.uniformMatrix4fv(matRotationUniformLocation, gl.false, flatten(rotationZMatrix));
        
        //The vertices are drawn
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
        //The function is looped
        requestAnimationFrame(loop);
    }
    //The loop function is called 
    requestAnimationFrame(loop);
};  

