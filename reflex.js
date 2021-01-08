var gl;
var vertices = []
var colors = []
var score = 0;
var pointsLst = [];
var edgeLen = 0.1;
var interval = 1000;
var didClick = false;
var threeClicks = [];

function randomFloat(min,max) // Generate Random Float
{
    return Math.random() * (max - min) + min;
};

function randomInt(min, max)  // Generate Random Integer
{
    return Math.round(Math.random() * (max - min)) + min;
}

function drawRandomPoly()  //Random Convex Polygons are rendered by drawing equilateral triangles around a random circle.
{
    var sides = randomInt(3,7);
    var center = vec2(randomFloat(-1 + edgeLen,1 - edgeLen),randomFloat(-1 + edgeLen,1 + edgeLen)) // To limit senter within canvas
    pointsLst = [];  //empty this list
    for (var i = 0; i < 2 * Math.PI; i += (2 * Math.PI) / sides)  //Find x and y postion of vertices using trigonometry 
    {
        xVal = center[0] + (Math.cos(i) * 0.25);
        yVal = center[1] + (Math.sin(i) * 0.25);
        pointsLst.push(vec2(xVal, yVal));
    }

    vertices = []; //Emptying vertices list

    for (var i = 0; i < pointsLst.length; i++)
    {
        vertices.push(center);
        vertices.push(pointsLst[i]);
        vertices.push(pointsLst[(i+1) % pointsLst.length]);
    }

    colors = [];
    for (var i = 0; i < vertices.length; i++) {
        color = Math.random()
        colors.push(vec4(0,1,0,1.0));
    }

};


function checkInside(point)
{
    var vertex1;
    var vertex2;
    var edgeVector;
    var pointVector;
    var firstSide;
    var currentSide;
    for (var i = 0; i < pointsLst.length; i++)
    {
        vertex1 = pointsLst[i];
        vertex2 = pointsLst[(i + 1) % pointsLst.length];

        edgeVector = subtract(vertex2, vertex1);  //Create vector for an edge
        pointVector = subtract(point, vertex1);   // Create vector for point and vertex of polygon

        currentSide = getSideNum(edgeVector, pointVector);
        if (i == 0 && currentSide != null) //If the value returned for currentSide is always the same, the point is inside.
        {
            firstSide = currentSide;  //Keeping track of first value
        }

        if (currentSide == null)
        {
            return false;
        }

        if (currentSide != firstSide)
        {
            return false;
        }
    }
    return true;
}


function getSideNum(x, y)  //Returning a value based of which side of the edge the point is on
{
    var num = cosSign(x, y);
    if ( num < 0)
    {
        return -1;
    }
    else if (num > 0)
    {
        return +1;
    }
    return null;
}


function cosSign(x, y)
{
    return x[0] * y[1] - x[1] * y[0];
}


function vertexSub(x, y)
{
    return vec2(x[0] - y[0], x[1] - y[1]);
};


window.onload = function init() {
    var canvas = document.getElementById("gl-canvas");

    gl = WebGLUtils.setupWebGL(canvas);
    if (!gl) { alert("WebGL isn't available"); }
    var output = document.getElementById("demo");

    output.innerHTML = score;

    //  Configure WebGL
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.1, 0);

    //  Load shaders and initialize attribute buffers
    var program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    //Vertices and colors for triangle
    drawRandomPoly();

    var timer;

    timer = function(){  //This function will re-run after a specific interval has passed
        if (score > -1)
        {
        drawRandomPoly();

        gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);
        }

    }

    var checkThree;

    checkThree = function(){  //Fucntion to check if a click event occured in the last 3 iterations
        if (score > -1)
        {
            var tempLst = []
            var scoreDecrease = true;
            if (threeClicks.length == 3){
                for (var i = 1; i < 3; i++)
                {
                    tempLst.push(threeClicks[i]); //List of length 3 containing boolean value elements that indicate if a click event happened.
                }
                tempLst.push(didClick);

                for (var i = 0; i < 3; i++)
                {
                    if (tempLst[i] == true)
                    {
                        scoreDecrease = false;
                        break;  //Do nothing if a click event has occured in lasts 3 iterations
                    }
                }

                if (scoreDecrease) //Otherwise decrease score.
                {
                    score--;
                }

                threeClicks = tempLst;
            }
            else{
                threeClicks.push(didClick);
            }
            didClick = false;  //Value of boolean variable is reset
            output.innerHTML = score;
        }

    }

    // Load the data into the GPU
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

    if (score >= 0){

        var time;
        time = setInterval(timer, interval);

        var time2;
        time2 = setInterval(checkThree, interval);

        var xPos;
        var yPos;
        var ifInside;
        canvas.addEventListener("click", function(event)
        {
            didClick = true;  //True whenever a click event occurs
            xPos = 2 * event.clientX / canvas.width - 1;  //Converting to canvas co-ordinates
            yPos = 2 * (canvas.height - event.clientY) / canvas.height - 1;
            ifInside = checkInside(vec2(xPos, yPos));

            if (score > -1)
            {
                if (ifInside) 
                {
                    score++;
                    clearInterval(time);
                    clearInterval(time2);
                    gl.clear(gl.COLOR_BUFFER_BIT);
                    drawRandomPoly();

                    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(vertices), gl.STATIC_DRAW);
                
                    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
                    gl.bufferData(gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW);

                    gl.drawArrays(gl.TRIANGLES,0,vertices.length);
                    time = setInterval(timer, interval);
                    time2 = setInterval(checkThree, interval);
                    output.innerHTML = score;
                }
                else
                {
                        score--;
                        
                        output.innerHTML = score;
                        if (score == -1)
                        {
                            clearInterval(time);  //Reset both timers
                            clearInterval(time2);
                            vertices = []
                            gl.clearColor(1,0,0,1);
                        }
                }
                
            }

        });


        var loop = function()
        {   
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES,0,vertices.length);
            //Rendering the triangles
            
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    };
};


// window.onload = init;

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length); //Rendering the triangle
}
