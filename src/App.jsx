import React, { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as mobilenet from "@tensorflow-models/mobilenet";
import { FaRegObjectGroup } from "react-icons/fa6";

const App = () => {
  const [cocoModelLoadTime, setCocoModelLoadTime] = useState(null);
  const [mobileNetModelLoadTime, setMobileNetModelLoadTime] = useState(null);
  const [isCocoOnline, setIsCocoOnline] = useState(false);
  const [isMobileNetOnline, setIsMobileNetOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageURL, setImageURL] = useState(null);
  const [cocoPredictions, setCocoPredictions] = useState([]);
  const [mobileNetPredictions, setMobileNetPredictions] = useState([]);
  const [cocoModel, setCocoModel] = useState(null);
  const [mobileNetModel, setMobileNetModel] = useState(null);

  useEffect(() => {
    const loadCocoModel = async () => {
      try {
        setLoading(true);
        const cocoStartTime = performance.now();
        const model = await cocoSsd.load();
        const cocoEndTime = performance.now();
        setCocoModel(model);
        setCocoModelLoadTime((cocoEndTime - cocoStartTime).toFixed(2));
        setIsCocoOnline(true);
      } catch (error) {
        setIsCocoOnline(false);
      } finally {
        setLoading(false);
      }
    };

    const loadMobileNetModel = async () => {
      try {
        setLoading(true);
        const mobileNetStartTime = performance.now();
        const model = await mobilenet.load();
        const mobileNetEndTime = performance.now();
        setMobileNetModel(model);
        setMobileNetModelLoadTime(
          (mobileNetEndTime - mobileNetStartTime).toFixed(2)
        );
        setIsMobileNetOnline(true);
      } catch (error) {
        setIsMobileNetOnline(false);
      } finally {
        setLoading(false);
      }
    };

    loadCocoModel();
    loadMobileNetModel();
  }, []);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageURL(url);
      setCocoPredictions([]);
      setMobileNetPredictions([]);
    }
  };

  const handleImageLoad = async () => {
    const imageElement = document.getElementById("uploaded-image");

    if (cocoModel && imageURL) {
      const cocoPredictions = await cocoModel.detect(imageElement);
      setCocoPredictions(cocoPredictions);
    }

    if (mobileNetModel && imageURL) {
      const mobileNetPredictions = await mobileNetModel.classify(imageElement);
      setMobileNetPredictions(mobileNetPredictions);
    }
  };

  const statusMessage = loading
    ? "Loading..."
    : isCocoOnline && isMobileNetOnline
    ? "Online"
    : isCocoOnline
    ? "COCO-SSD is online"
    : isMobileNetOnline
    ? "MobileNet is online"
    : "Both models are offline";

  const statusColorClass = loading
    ? "text-yellow-500"
    : isCocoOnline || isMobileNetOnline
    ? "text-green-500"
    : "text-red-500";

  return (
    <div class="py-10 px-10">
      <div>
        <h1 class="text-2xl font-bold">
          <img src="./logo.png" class="inline mr-2 size-7 mb-1" /> Object
          Detection
        </h1>
        <hr class="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
        <div class="flex items-center">
          <span class={`${statusColorClass} font-semibold`}>
            {statusMessage}
          </span>
          <span class="relative flex h-3 w-3 ml-2">
            <span
              class={
                isCocoOnline || isMobileNetOnline
                  ? "animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                  : "hidden"
              }></span>
            <span
              class={
                isCocoOnline || isMobileNetOnline
                  ? "relative inline-flex rounded-full h-3 w-3 bg-green-500"
                  : "hidden"
              }></span>
          </span>
        </div>
        {isMobileNetOnline ? (
          <p>
            MobileNet Model loaded in{" "}
            {(mobileNetModelLoadTime / 1000).toFixed(2)} seconds.
          </p>
        ) : (
          <p>MobileNet Model failed to load.</p>
        )}
        {isCocoOnline ? (
          <p>
            COCO-SSD Model loaded in {(cocoModelLoadTime / 1000).toFixed(2)}{" "}
            seconds.
          </p>
        ) : (
          <p>COCO-SSD Model failed to load.</p>
        )}
        <div class="md:max-w-[40%]">
          <h1 class="text-lg mt-4 font-semibold">
            Get started by uploading an image.
          </h1>
          <p>This application will detect the object in the image.</p>
        </div>

        <br />
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
      {imageURL && (
        <div>
          <div>
            <img
              id="uploaded-image"
              src={imageURL}
              alt="Uploaded"
              onLoad={handleImageLoad}
              style={{ width: "auto", maxHeight: "250px" }}
            />
          </div>
          <div>
            {cocoModel && (
              <>
                <h3>COCO-SSD Predictions:</h3>
                <ol>
                  {cocoPredictions.map((prediction, index) => (
                    <li key={index}>
                      {prediction.class} - Probability:{" "}
                      {Math.round(prediction.score * 100)}%
                    </li>
                  ))}
                </ol>
              </>
            )}
            {mobileNetModel && (
              <>
                <h3>MobileNet Predictions:</h3>
                <ol>
                  {mobileNetPredictions.map((prediction, index) => (
                    <li key={index}>
                      {prediction.className} - Probability:{" "}
                      {prediction.probability.toFixed(2)}
                    </li>
                  ))}
                </ol>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
