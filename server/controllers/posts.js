import express from "express";
import mongoose from "mongoose";
import * as tf from "@tensorflow/tfjs";
// import "@tensorflow/tfjs-node";
// import fetch from "node-fetch";
// global.fetch = fetch;

import PostMessage from "../models/postMessage.js";

const router = express.Router();

export const getPosts = async (req, res) => {
  try {
    const postMessages = await PostMessage.find();

    res.status(200).json(postMessages);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getPost = async (req, res) => {
  const { id } = req.params;

  try {
    const post = await PostMessage.findById(id);

    res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
// async function predict(image1) {
//   const model = await tf.loadLayersModel("file://server/tfjs-models/VGG16/model.json");

//   //   model = await tf.loadLayersModel("http://127.0.0.1:5000/tfjs-models/model.json");
//   console.log(model);
//   let image = image1;
//   console.log(image, "555");
//   let tensor = tf.fromPixels(image).resizeNearestNeighbor([224, 224]).toFloat();

//   let meanImageNetRGB = {
//     red: 123.68,
//     green: 116.779,
//     blue: 103.939,
//   };
//   let indices = [tf.tensor1d([0], "int32"), tf.tensor1d([1], "int32"), tf.tensor1d([2], "int32")];

//   let centeredRGB = {
//     red: tf.gather(tensor, indices[0], 2).sub(tf.scalar(meanImageNetRGB.red)).reshape([50176]),
//     green: tf.gather(tensor, indices[1], 2).sub(tf.scalar(meanImageNetRGB.green)).reshape([50176]),
//     blue: tf.gather(tensor, indices[2], 2).sub(tf.scalar(meanImageNetRGB.blue)).reshape([50176]),
//   };

//   let processedTensor = tf.stack([centeredRGB.red, centeredRGB.green, centeredRGB.blue], 1).reshape([224, 224, 3]).reverse(2).expandDims();
//   let predictions = await model.predict(processedTensor).data();
//   console.log(predictions);
//   if (predictions[0] > predictions[1]) {
//     return "8px";
//   } else {
//     return "0px";
//   }
//   //   $("#bullying").html(predictions[0] * 100);
//   //   $("#non-bullying").text(predictions[1] * 100);
// }

export const createPost = async (req, res) => {
  const { title, message, selectedFile, creator, tags, blur } = req.body;
  //   console.log(selectedFile);

  // const blur = predict(selectedFile);
  console.log(req.body.blur);
  const newPostMessage = new PostMessage({ title, message, selectedFile, creator, tags, blur });

  try {
    await newPostMessage.save();

    res.status(201).json(newPostMessage);
  } catch (error) {
    res.status(409).json({ message: error.message });
  }
};

export const updatePost = async (req, res) => {
  const { id } = req.params;
  const { title, message, creator, selectedFile, tags } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

  const updatedPost = { creator, title, message, tags, selectedFile, _id: id };

  await PostMessage.findByIdAndUpdate(id, updatedPost, { new: true });

  res.json(updatedPost);
};

export const deletePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

  await PostMessage.findByIdAndRemove(id);

  res.json({ message: "Post deleted successfully." });
};

export const likePost = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

  const post = await PostMessage.findById(id);

  const updatedPost = await PostMessage.findByIdAndUpdate(id, { likeCount: post.likeCount + 1 }, { new: true });

  res.json(updatedPost);
};

export default router;
