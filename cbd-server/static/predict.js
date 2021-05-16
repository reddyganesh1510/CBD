$("#image-selector").change(function () {
  let reader = new FileReader();
  reader.onload = function () {
    let dataURL = reader.result;
    $("#selected-image").attr("src", dataURL);
  };
  let file = $("#image-selector").prop("files")[0];
  reader.readAsDataURL(file);
});

let model;
(async function () {
  console.log(tf);
  model = await tf.loadModel("http://127.0.0.1:4000/tfjs-models/VGG16/model.json");
  $(" .progress-bar").hide();
  console.log(model);
})();

$("#predict-button").click(async function () {
  let image = $("#selected-image").get(0);
  console.log(image, "555");
  let tensor = tf.fromPixels(image).resizeNearestNeighbor([224, 224]).toFloat();

  let meanImageNetRGB = {
    red: 123.68,
    green: 116.779,
    blue: 103.939,
  };
  let indices = [tf.tensor1d([0], "int32"), tf.tensor1d([1], "int32"), tf.tensor1d([2], "int32")];

  let centeredRGB = {
    red: tf.gather(tensor, indices[0], 2).sub(tf.scalar(meanImageNetRGB.red)).reshape([50176]),
    green: tf.gather(tensor, indices[1], 2).sub(tf.scalar(meanImageNetRGB.green)).reshape([50176]),
    blue: tf.gather(tensor, indices[2], 2).sub(tf.scalar(meanImageNetRGB.blue)).reshape([50176]),
  };

  let processedTensor = tf.stack([centeredRGB.red, centeredRGB.green, centeredRGB.blue], 1).reshape([224, 224, 3]).reverse(2).expandDims();
  let predictions = await model.predict(processedTensor).data();
  console.log(predictions);
  $("#bullying").html(predictions[0] * 100);
  $("#non-bullying").text(predictions[1] * 100);
});
