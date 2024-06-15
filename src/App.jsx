import React, { useEffect, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as mobilenet from "@tensorflow-models/mobilenet";

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

  const images = [
    { src: "./cow.jpg", alt: "Cow" },
    { src: "./pizza.jpg", alt: "Pizza" },
    { src: "./schoolbus.png", alt: "School Bus" },
    { src: "./beach.jpg", alt: "Beach" },
    { src: "./burger.jpeg", alt: "Burger" },
    { src: "./strawberry.jpg", alt: "Strawberry" },
    { src: "./tennisball.jpg", alt: "Tennis Ball" },
    { src: "./phone.jpg", alt: "Phone" },
    { src: "./dog.jpg", alt: "Dog" },
    { src: "./apple.jpg", alt: "Apple" },
    { src: "./icecream.jpg", alt: "Ice Cream" },
    { src: "./dumbbell.jpg", alt: "Dumbbells" },
  ];

  const statusColorClass = loading
    ? "text-yellow-500"
    : isCocoOnline || isMobileNetOnline
    ? "text-green-500"
    : "text-red-500";

  const handleLogoClick = (url) => {
    setImageURL(url);
  };

  useEffect(() => {
    if (imageURL) {
      handleImageLoad();
    }
  }, [imageURL]);

  return (
    <div class="flex flex-col  py-10 px-10 md:flex-row md:px-20">
      <div class="md:w-2/3 pr-5 pb-10">
        <h1 class="text-2xl font-bold">
          <img src="./logo.png" class="inline mr-2 size-7 mb-1" /> Object
          Detection
        </h1>
        <hr class="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
        <div>
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
          <h1 class="text-lg mt-4 font-semibold">
            Get started by uploading an image.
          </h1>
          <p class="mb-4">
            This application will detect the object in the image.
          </p>

          <input
            id="file-input"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
        {imageURL && (
          <div class="mt-4">
            <div>
              <img
                id="uploaded-image"
                src={imageURL}
                alt="Uploaded"
                onLoad={handleImageLoad}
                class="rounded-lg max-h-[250px] max-w-[250px]"
              />
            </div>
            <div class="mt-4">
              {cocoModel && (
                <div class="mt-4">
                  <h3 class="text-md font-bold mb-2">COCO-SSD Predictions:</h3>
                  {cocoPredictions.length > 0 ? (
                    <ol class="list-decimal pl-5">
                      {cocoPredictions.map((prediction, index) => (
                        <li key={index}>
                          <span className="font-bold">{prediction.class}:</span>{" "}
                          Probability: {prediction.score.toFixed(2)}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p>No COCO-SSD predictions found.</p>
                  )}
                </div>
              )}
              {mobileNetModel && (
                <div class="mt-4">
                  <h3 class="text-md font-bold mb-2">MobileNet Predictions:</h3>
                  {mobileNetPredictions.length > 0 ? (
                    <ul class="list-decimal pl-5">
                      {mobileNetPredictions.map((prediction, index) => (
                        <li key={index}>
                          <span className="font-bold">
                            {prediction.className}:
                          </span>{" "}
                          Probability: {prediction.probability.toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No MobileNet predictions found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div class="md:w-1/3">
        <h1 class="text-2xl font-bold">
          <img src="./smiley.png" class="inline mr-2 size-7 mb-1" /> Try It!
        </h1>
        <hr class="h-px my-2 bg-gray-200 border-0 dark:bg-gray-700" />
        <p>Click images below to try out the Tensor Flow models.</p>
        <div className="grid grid-cols-4 gap-4 mt-4">
          {images.map((image, index) => (
            <img
              key={index}
              src={image.src}
              alt={image.alt}
              className="w-full h-full object-cover rounded"
              onClick={() => handleLogoClick(image.src)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
