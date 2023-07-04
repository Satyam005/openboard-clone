let optionsContainer = document.querySelector(".options__container");
let toolsContainer = document.querySelector(".tools__container");
let optionsFlag = true;
let pencilToolContainer = document.querySelector(".pencil__tool");
let eraserToolContainer = document.querySelector(".eraser__tool");
let pencil = document.querySelector(".pencil");
let eraser = document.querySelector(".eraser");
let sticky = document.querySelector(".sticky");
let upload = document.querySelector(".upload");
let pencilFlag = false;
let eraserFlag = false;

//true -> tools show, false -> tools hide
optionsContainer.addEventListener("click", (e) => {
  optionsFlag = !optionsFlag;
  let iconElem = optionsContainer.children[0];

  if (optionsFlag) {
    openTools(iconElem);
  } else closeTools(iconElem);
});

const openTools = (element) => {
  element.classList.remove("fa-times");
  element.classList.add("fa-bars");
  toolsContainer.style.display = "flex";
};

const closeTools = (element) => {
  element.classList.remove("fa-bars");
  element.classList.add("fa-times");
  toolsContainer.style.display = "none";
  pencilToolContainer.style.display = "none";
  eraserToolContainer.style.display = "none";
};

pencil.addEventListener("click", (e) => {
  //true -> show pencil tool, false -> hide pencil tool
  pencilFlag = !pencilFlag;

  if (pencilFlag) {
    pencilToolContainer.style.display = "block";
  } else {
    pencilToolContainer.style.display = "none";
  }
});

eraser.addEventListener("click", (e) => {
  //true -> show eraser tool, false -> hide eraser tool
  eraserFlag = !eraserFlag;

  if (eraserFlag) {
    eraserToolContainer.style.display = "flex";
  } else {
    eraserToolContainer.style.display = "none";
  }
});

function createSticky(stickyTemplateHTML) {
  let stickyContainer = document.createElement("div");
  stickyContainer.setAttribute("class", "sticky__container");
  stickyContainer.innerHTML = stickyTemplateHTML;

  document.body.appendChild(stickyContainer);

  let minimize = stickyContainer.querySelector(".minimize");
  let remove = stickyContainer.querySelector(".remove");

  noteActions(minimize, remove, stickyContainer);

  stickyContainer.onmousedown = function (event) {
    dragAndDrop(stickyContainer, event);
  };

  stickyContainer.ondragstart = function () {
    return false;
  };
}

upload.addEventListener("click", (e) => {
  //Open File Explorer
  let input = document.createElement("input");
  input.setAttribute("type", "file");
  input.click();

  input.addEventListener("change", (e) => {
    let file = input.files[0];
    let url = URL.createObjectURL(file);

    let stickyTemplateHTML = `
    <div class="header__container">
        <div class="minimize"></div>
        <div class="remove"></div>
    </div>
    <div class="note__container">
        <img src='${url}'/>
    </div>`;

    createSticky(stickyTemplateHTML);
  });
});

sticky.addEventListener("click", (e) => {
  let stickyTemplateHTML = `
    <div class="header__container">
        <div class="minimize"></div>
        <div class="remove"></div>
    </div>
    <div class="note__container">
        <textarea spellcheck="false"></textarea>
    </div>`;

  createSticky(stickyTemplateHTML);
});

function noteActions(minimize, remove, element) {
  remove.addEventListener("click", (e) => {
    element.remove();
  });

  minimize.addEventListener("click", (e) => {
    let noteContainer = element.querySelector(".note__container");
    let display = getComputedStyle(noteContainer).getPropertyValue("display");
    if (display === "none") {
      noteContainer.style.display = "block";
    } else {
      noteContainer.style.display = "none";
    }
  });
}

function dragAndDrop(element, event) {
  let shiftX = event.clientX - element.getBoundingClientRect().left;
  let shiftY = event.clientY - element.getBoundingClientRect().top;

  element.style.position = "absolute";
  element.style.zIndex = 1000;

  moveAt(event.pageX, event.pageY);

  // moves the note at (pageX, pageY) coordinates
  // taking initial shifts into account
  function moveAt(pageX, pageY) {
    element.style.left = pageX - shiftX + "px";
    element.style.top = pageY - shiftY + "px";
  }

  function onMouseMove(event) {
    moveAt(event.pageX, event.pageY);
  }

  // move the note on mousemove
  document.addEventListener("mousemove", onMouseMove);

  // drop the note, remove unneeded handlers
  element.onmouseup = function () {
    document.removeEventListener("mousemove", onMouseMove);
    element.onmouseup = null;
  };
}
