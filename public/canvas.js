let canvas = document.querySelector("canvas");

function setCanvasSize() {
  if (window.innerWidth <= 600) {
    canvas.width = window.innerWidth * 0.8; // Set canvas width to 80% of window width
    canvas.height = window.innerHeight * 0.5; // Set canvas height to 50% of window height
  } else {
    // Reset the canvas size for larger screens
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
}

// Call the function initially
setCanvasSize();

// Add an event listener to execute the function whenever the window is resized
window.addEventListener("resize", setCanvasSize);

let pencilColor = document.querySelectorAll(".pencil__color");
let pencilWidthElem = document.querySelector(".pencil__width");
let eraserWidthElem = document.querySelector(".eraser__width");
let download = document.querySelector(".download");
let redo = document.querySelector(".redo");
let undo = document.querySelector(".undo");

let penColor = "red";
let eraserColor = "rgba(255, 255, 255, 1)"; // Use a solid white color for erasing
let pencilWidth = pencilWidthElem.value;
let eraserWidth = eraserWidthElem.value;

let undoRedoTracker = []; //Data
let track = 0; //Represent which action from tracker array

//API
let tool = canvas.getContext("2d");

tool.strokeStyle = penColor;
tool.lineWidth = pencilWidth;

//mousedown -> start new path
//mousemove -> path fill (graphics)

let mousedown = false;

canvas.addEventListener("mousedown", (e) => {
  mousedown = true;
  let data = {
    x: e.clientX,
    y: e.clientY,
  };

  //send data to servver
  socket.emit("beginPath", data);
});

canvas.addEventListener("mousemove", (e) => {
  if (mousedown) {
    let data = {
      x: e.clientX,
      y: e.clientY,
      color: eraserFlag ? eraserColor : penColor,
      with: eraserFlag ? eraserWidth : pencilWidth,
    };
    socket.emit("drawStroke", data);
  }
});

canvas.addEventListener("mouseup", (e) => {
  mousedown = false;
  let url = canvas.toDataURL();
  undoRedoTracker.push(url);
  track = undoRedoTracker.length - 1;
});

undo.addEventListener("click", (e) => {
  if (track > 0) {
    track--;
  }

  let data = {
    trackValue: track,
    undoRedoTracker,
  };

  socket.emit("redoUndo", data);
});

redo.addEventListener("click", (e) => {
  if (track < undoRedoTracker.length - 1) {
    track++;
  }

  let data = {
    trackValue: track,
    undoRedoTracker,
  };
  socket.emit("redoUndo", data);
});

function undoRedoCanvas(trackObj) {
  track = trackObj.trackValue;
  undoRedoTracker = trackObj.undoRedoTracker;
  let url = undoRedoTracker[track];
  let img = new Image(); //new Image reference element
  img.src = url;
  img.onload = (e) => {
    tool.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
}

function beginPath(strokeObj) {
  tool.beginPath();
  tool.moveTo(strokeObj.x, strokeObj.y);
}

function drawStroke(strokeObj) {
  tool.strokeStyle = strokeObj.color;
  tool.lineWidth = strokeObj.with;
  tool.lineTo(strokeObj.x, strokeObj.y);
  tool.stroke();
}

pencilColor.forEach((colorElem) => {
  colorElem.addEventListener("click", (e) => {
    let color = colorElem.classList[0];
    penColor = color;
    tool.strokeStyle = penColor;
  });
});

pencilWidthElem.addEventListener("change", (e) => {
  pencilWidth = pencilWidthElem.value;
  tool.lineWidth = pencilWidth;
});

eraserWidthElem.addEventListener("change", (e) => {
  eraserWidth = eraserWidthElem.value;
  tool.lineWidth = eraserWidth;
});

eraser.addEventListener("click", (e) => {
  if (eraserFlag) {
    tool.strokeStyle = eraserColor;
    tool.lineWidth = eraserWidth;
  } else {
    tool.strokeStyle = penColor;
    tool.lineWidth = pencilWidth;
  }
});

download.addEventListener("click", (e) => {
  let url = canvas.toDataURL();
  let a = document.createElement("a");
  a.href = url;
  a.download = "board.jpg";
  a.click();
});

socket.on("beginPath", (data) => {
  //data -> data from server
  beginPath(data);
});

socket.on("drawStroke", (data) => {
  //data -> data from server
  drawStroke(data);
});

socket.on("redoUndo", (data) => {
  //data -> data from server
  undoRedoCanvas(data);
});
