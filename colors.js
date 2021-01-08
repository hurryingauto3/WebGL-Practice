var gl, canvas, program
var colors, icolors = []
var vertices = [vec2(-1, -1), vec2(0, 1), vec2(1, -1)] // Boundary Vertices
var ivertices = [vec2(-0.99, -0.99), vec2(0, 0.99), vec2(0.99, -0.99)] //Interior Vertices
var vertex11,vertex22 ,vertex33 ,ivertex11,ivertex22,ivertex33
var boundary,fill,randboundary,randfill


//Color picker returns color in HEX;
//HEX is converted to RGB array
String.prototype.convertToRGB = function(){
    if(this.length != 6){
        throw "Only six-digit hex colors are allowed.";
    }

    var aRgbHex = this.match(/.{1,2}/g);
    var aRgb = [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16)
    ];
    return aRgb;
}

//Converts HTML variables into JS variables
function checkInput(){

//Gets Boundary colors from color picker
vertex11 = vertex1.value.slice(1).convertToRGB();
vertex22 = vertex2.value.slice(1).convertToRGB();
vertex33 = vertex3.value.slice(1).convertToRGB();

//Gets Interior colors from color picker
ivertex11 = ivertex1.value.slice(1).convertToRGB();
ivertex22 = ivertex2.value.slice(1).convertToRGB();
ivertex33 = ivertex3.value.slice(1).convertToRGB();

//Gets status of toggle switches
boundary=document.getElementById("switch1").checked;
fill=document.getElementById("switch2").checked;
randboundary=document.getElementById("switch3").checked;
randfill=document.getElementById("switch4").checked;

}

//Chooses colors based on toggle switches.
function ColorSelect(randfill, randboundary){
    //Boundary and Interior colors array is created.
    colors = [
                vec4(vertex11[0]/255, vertex11[1]/255, 
                    vertex11[2]/255, 1.0),

                vec4(vertex22[0]/255, vertex22[1]/255, 
                    vertex22[2]/255, 1.0),
                
                vec4(vertex33[0]/255, vertex33[1]/255, 
                    vertex33[2]/255, 1.0)]
    icolors = [
                vec4(ivertex11[0]/255, ivertex11[1]/255, 
                    ivertex11[2]/255, 1.0),

                vec4(ivertex22[0]/255, ivertex22[1]/255, 
                    ivertex22[2]/255, 1.0),
                
                vec4(ivertex33[0]/255, ivertex33[1]/255, 
                    ivertex33[2]/255, 1.0)
                ]
    //Assigns random colors to interior vertices
    if (randfill){
        icolors = [
            vec4(Math.random(), Math.random(), 
            Math.random(), 1.0),
            
            vec4(Math.random(), Math.random(), 
            Math.random(), 1.0),
            
            vec4(Math.random(), Math.random(), 
            Math.random(), 1.0)
        ];    
    }
    //Assigns random colors to boundary vertices
    if (randboundary){
        colors = [
            vec4(Math.random(), Math.random(), 
            Math.random(), 1.0),

            vec4(Math.random(), Math.random(), 
            Math.random(), 1.0),
            
            vec4(Math.random(), Math.random(), 
            Math.random(), 1.0)
            ]; 
    }
}

 //Bloatware code to setup the canvas and its properties, converted into a function.
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

//Buffer function assigns colors to vertices on the canvas
function Buffer(vertices, colors){

    var vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);

    // Associate out shader variables with our data buffer
    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var color_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

}

//Render function has multiple functionalies
    // - Calls the checkInput function to detect changes
    // - Calls colorselect function to update colors
    // - Uses the status of the boundary and fill toggle switches
    // to correctly display the triangle

function render(boundary, fill, randfill, randboundary) {

    gl.clear(gl.COLOR_BUFFER_BIT);
    checkInput();
    ColorSelect(randfill, randboundary);

    //Displays the boundary and the interior color of the triangle
    if (boundary & fill){
        //Sets interior and boundary colors at their respective vertices
        Buffer(ivertices, icolors);
        Buffer(vertices, colors); 

        //Creates triangle interior
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
        //Creates triangle boundary
        gl.drawArrays(gl.LINE_LOOP, 0, vertices.length); //Rendering the triangle
        
    }
    //Only displays boundary triangle
    if (boundary){
        Buffer(vertices, colors);
        gl.drawArrays(gl.LINE_LOOP, 0, vertices.length);
    }
    //Only displays interior triangle
    if (fill){
        Buffer(ivertices, icolors);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length); //Rendering the triangle
    }
         
} 

//Window onload function called when window loads
    // - WebGL function is called to setup canvas

window.onload = function init() {

    WebGLSetup();

    //The render function is called when the draw button is pressed on the HTML file to update the triangle.
    
};
