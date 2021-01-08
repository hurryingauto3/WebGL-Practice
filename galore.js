var gl,progra,canvas
var tri_vert = []
var quad_vert = []
var tri_color = []
var quad_color = []


var vPosition , vBuffer , cBuffer , vColor
var TriMode = true;



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

//Buffer function to feed buffer vertex and color list
function Buffer(vertices, colors){

    vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
    
    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
    
    vColor = gl.getAttribLocation(program, "vColor");
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);
}

var loop = function()

	{
        //Constnatly updating vertex list is fed to buffer
        Buffer(tri_vert.concat(quad_vert), tri_color.concat(quad_color))

        //Render functions for pixels, triangles, rectangles
        PIXELS()
        TRIANGLES();
		RECTS();
        //Loop function is looped
		requestAnimationFrame(loop);
}

function PIXELS() {
    gl.drawArrays(gl.PIXELS, tri_vert.length - tri_vert.length%3 , tri_vert.length%3); 
    gl.drawArrays(gl.PIXELS, quad_vert.length - quad_vert.length%4, tri_vert.length%4);
}
function TRIANGLES(){
    //Triangles are drawn from triangle vertex list
    gl.drawArrays(gl.TRIANGLES, 0 , tri_vert.length); 
}
function RECTS(){
    
    //rectangles are drawn from rectangle vertex list
    for (var j = 0; j < quad_vert.length; j+=2)
	{
		gl.drawArrays(gl.TRIANGLES, 0 , quad_vert.length);
	}  
}

window.onload = function init() {
    
    //Initialize WebGL
    WebGLSetup();
    //Add event viewer
    window.addEventListener("click", function(event) {
        //Gets current click positon
        curpos = vec2(2 * event.clientX / canvas.width - 1,
            2 * (canvas.height - event.clientY) / canvas.height - 1)
        //Checks if triangle mode is on
        if (TriMode){
            tri_vert.push(curpos)
            tri_color.push(vec4(1,1,1,1))
        
        }
        else{
            quad_vert.push(curpos)
            quad_color.push(vec4(1,1,1,1))
        }
    });
    //Add event viewer
    window.addEventListener('keydown', (e) => {
        //Checks if triangle mode was toggled
        if (e.key == "t" || e.key == "T"){
            if(TriMode){
                TriMode = false;
            }
            else {
                TriMode = true;
            }
        }
        //Resets all previous memory
        if (e.key == "r" || e.key == "R"){

            tri_color = []
            tri_vert = []
            quad_color = []
            quad_vert = []
            TriMode = true
            
        }
 
    });
    //All vertex and color data fed to buffer
    Buffer(tri_vert.concat(quad_vert), tri_color.concat(quad_color))
    //Loop function is refreshed
    requestAnimationFrame(loop);

};
