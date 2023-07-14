const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const outputCanvas = document.getElementById('output');
const outputCtx = outputCanvas.getContext('2d');


const outputType='image/png';
const quality=.92;

function getDataURL(imgData) {
  canvas.width = imgData.width;
  canvas.height = imgData.height;
  ctx.putImageData(imgData, 0, 0);
  return new Promise(resolve => {
    canvas.toBlob(blob => resolve(URL.createObjectURL(blob)), outputType, quality);
  });
}

const dom = {
  imageInput: document.getElementById('imageInput'),
  faces: document.getElementById('faces'),
  generating: document.getElementById('generating'),
  download: document.getElementById('download')
};

dom.imageInput.addEventListener('change', loadImage);

window.addEventListener('paste', (e) => {
  console.log('oas')
  imageInput.files = e.clipboardData.files;
  console.log(imageInput.files)
  loadImage();
});

dom.download.addEventListener('click', () => {
  //outputCanvas.toBlob(blob => console.log(blob), outputType, quality);
  const dataURL = outputCanvas.toDataURL('image/png');
  // const dataURL = outputCanvas.toDataURL('image/jpeg', 0.1); // Set the desired format and quality

  // const img = new Image();
  // img.src=dataURL;
  // img.onload = function() {
  //   // Draw the image onto the canvas
  //   console.log('drawing');
  //   outputCtx.drawImage(img,0,0);
  // };

  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'skybox.png';
  
  link.click();
})

const facePositions = {
  pz: {x: 1, y: 1},
  nz: {x: 2, y: 0},
  px: {x: 2, y: 1},
  nx: {x: 0, y: 1},
  py: {x: 1, y: 0},
  ny: {x: 0, y: 0}
};

function loadImage() {
  const file = dom.imageInput.files[0];

  if (!file) {
    return;
  }

  const img = new Image();

  img.src = URL.createObjectURL(file);

  img.addEventListener('load', () => {
    const {width, height} = img;
    canvas.width = width;
    canvas.height = height;
    outputCanvas.width=width/4*3;
    outputCanvas.height=height;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, width, height);
    processImage(data);
  });
}


function processImage(data) {


  for (let [faceName, position] of Object.entries(facePositions)) {
    renderFace(data, faceName, position);
  }
}


function renderFace(data, faceName, position) {

  const options = {
    data: data,
    face: faceName,
    rotation: Math.PI,
    interpolation: 'lanczos'
  };

  const worker = new Worker('worker.js');

  const setPreview = (output) => {
      // const x = imageData.width * position.x;
      // const y = imageData.height * position.y;

      // getDataURL(imageData, 'jpg')
      //   .then(url => face.setPreview(url, x, y));

      // worker.onmessage = setDownload;
      console.log(output)
      // worker.postMessage(options);
      outputCtx.putImageData(output.data.writeData,facePositions[output.data.face].x*output.data.writeData.width,facePositions[output.data.face].y*output.data.writeData.width);
  };

  worker.postMessage(options);
  worker.onmessage = setPreview;
  worker.onerror = () => {
    console.log('error')
  };


  //workers.push(worker);
}