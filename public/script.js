const canvas = document.getElementById("canvas");
const video = document.getElementById("video");
const resultText = document.getElementById("result");

const URL = "./model/";

let model, webcam, maxPredictions;

// Load the image model and setup the webcam
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  navigator.getUserMedia(
    { video: true },
    stream => (video.srcObject = stream),
    () => {}
  );

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  // Convenience function to setup a webcam
  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);
}

async function loop() {
  webcam.update();
  canvas.getContext("2d").drawImage(video, 0, 0, 500, 500, 0, 0, 500, 520);

  await predict();
  window.requestAnimationFrame(loop);
}

let label = "";

async function predict() {
  // predict can take in an image, video or canvas html element
  const prediction = await model.predict(canvas);
  let bestGuessConfidence = -Infinity;

  for (let i = 0; i < maxPredictions; i++) {
    if (
      parseFloat(prediction[i].probability) > bestGuessConfidence &&
      parseFloat(prediction[i].probability) > 0.85
    ) {
      bestGuessConfidence = parseFloat(prediction[i].probability);
      label = prediction[i].className;

      (function (oldLabel) {
        setTimeout(function () {
          if (oldLabel === label && label !== "_") {
            resultText.textContent = (resultText.textContent + label).replace(
              /(.)\1/,
              "$1"
            );
          }
        }, 1000);
      })(label);
    }
  }
  document.getElementById("guess").textContent = label;
}

function clearText() {
  resultText.textContent = "";
}
