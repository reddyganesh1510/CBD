import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Paper } from "@material-ui/core";
import { useDispatch, useSelector } from "react-redux";
import FileBase from "react-file-base64";
import * as tf from "../../../../server/node_modules/@tensorflow/tfjs";

import useStyles from "./styles";
import { createPost, updatePost } from "../../actions/posts";

const Form = ({ currentId, setCurrentId }) => {
  const [postData, setPostData] = useState({ creator: "", title: "", message: "", tags: "", selectedFile: "", blur: "" });
  const post = useSelector((state) => (currentId ? state.posts.find((message) => message._id === currentId) : null));
  const dispatch = useDispatch();
  const classes = useStyles();

  useEffect(() => {
    if (post) setPostData(post);
  }, [post]);

  const clear = () => {
    setCurrentId(0);
    setPostData({ creator: "", title: "", message: "", tags: "", selectedFile: "" });
  };
  const predict = async (image1) => {
    // const model = await tf.loadLayersModel("file://server/tfjs-models/VGG16/model.json");

    const model = await tf.loadLayersModel("http://127.0.0.1:4000/tfjs-models/VGG16/model.json");
    console.log(model);
    let image2 = image1;
    // console.log(image, "555");
    let image = document.createElement("img");
    image.setAttribute("src", image2);
    image.setAttribute("width", "350px");
    image.setAttribute("height", "350px");

    console.log(image);

    let tensor = tf.browser.fromPixels(image).resizeNearestNeighbor([224, 224]).toFloat();

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
    if (predictions[0] > predictions[1]) {
      return "8px";
    } else {
      return "0px";
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (currentId === 0) {
      const blur = await predict(postData.selectedFile);
      postData.blur = blur;
      console.log(blur);
      const interval = setInterval(() => {
        if (JSON.stringify(blur) != "{}") {
          console.log(blur);
          dispatch(createPost(postData));
          clear();
          clearInterval(interval);
        }
      }, 1000);

      // setTimeout(() => {
      //   dispatch(createPost(postData));
      //   clear();
      // }, 2000);
    } else {
      dispatch(updatePost(currentId, postData));
      clear();
    }
  };

  return (
    <Paper className={classes.paper}>
      <form autoComplete="off" noValidate className={`${classes.root} ${classes.form}`} onSubmit={handleSubmit}>
        <Typography variant="h6">{currentId ? `Editing "${post.title}"` : "Creating a Memory"}</Typography>
        <TextField name="creator" variant="outlined" label="Creator" fullWidth value={postData.creator} onChange={(e) => setPostData({ ...postData, creator: e.target.value })} />
        <TextField name="title" variant="outlined" label="Title" fullWidth value={postData.title} onChange={(e) => setPostData({ ...postData, title: e.target.value })} />
        <TextField name="message" variant="outlined" label="Message" fullWidth multiline rows={4} value={postData.message} onChange={(e) => setPostData({ ...postData, message: e.target.value })} />
        <TextField name="tags" variant="outlined" label="Tags (coma separated)" fullWidth value={postData.tags} onChange={(e) => setPostData({ ...postData, tags: e.target.value.split(",") })} />
        <div className={classes.fileInput}>
          <FileBase type="file" multiple={false} onDone={({ base64 }) => setPostData({ ...postData, selectedFile: base64 })} />
        </div>
        <Button className={classes.buttonSubmit} variant="contained" color="primary" size="large" type="submit" fullWidth>
          Submit
        </Button>
        <Button variant="contained" color="secondary" size="small" onClick={clear} fullWidth>
          Clear
        </Button>
      </form>
    </Paper>
  );
};

export default Form;
