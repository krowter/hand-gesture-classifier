const canvas = document.getElementById("canvas");
const video = document.getElementById("video");
const resultText = document.getElementById("result");
const confidenceText = document.getElementById("confidence");

const URL = "./model/";

let model, webcam, maxPredictions;

async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  navigator.getUserMedia(
    { video: true },
    stream => (video.srcObject = stream),
    () => {}
  );

  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  const flip = true;
  webcam = new tmImage.Webcam(200, 200, flip);
  await webcam.setup();
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
  const prediction = await model.predict(canvas);
  let bestGuessConfidence = -Infinity;

  for (let i = 0; i < maxPredictions; i++) {
    if (
      parseFloat(prediction[i].probability) > bestGuessConfidence &&
      parseFloat(prediction[i].probability) > 0.8
    ) {
      bestGuessConfidence = parseFloat(prediction[i].probability);
      label = prediction[i].className;
      confidenceText.textContent =
        "Confidence: " + bestGuessConfidence.toFixed(2);
      (function (oldLabel) {
        setTimeout(function () {
          if (oldLabel === label && label !== "_") {
            resultText.textContent = (resultText.textContent + label).replace(
              /(.)\1/,
              "$1"
            );
          }
        }, 2000);
      })(label);
    }
  }
  document.getElementById("guess").textContent = label;
}

function clearText() {
  resultText.textContent = "";
}
