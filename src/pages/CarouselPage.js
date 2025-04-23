import React, { useState, useEffect } from "react";
import { Button, FloatingLabel, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../Firebase/firebaseConfig";
import { addDoc, collection, getDocs } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

function CarouselPage() {
  const [webUrl, setWebUrl] = useState("");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(false);
  const [fileChosen, setFileChosen] = useState(false);

  const handlePushNotification = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Upload data to Firestore and get the document ID
      const docRef = await addDoc(collection(db, "carousel"), {
        title,
        webUrl,
        imageUrl,
        timestamp: new Date(),
      });

      // Get the document ID
      const documentId = docRef.id;

      toast.success("Data saved to Firestore successfully!", {
        position: "top-right",
      });

      // Prepare the data to send
      const fcmTopic = "all";
      const data = {
        title,
        topic: fcmTopic,
        imageUrl,
        documentId,
      };
    } catch (error) {
      console.error("Error: ", error);
      toast.error("An error occurred", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
    setFileChosen(true);
    setUploadedImage(false);

    toast.info("Image selected successfully!", { position: "top-right" });
  };

  const uploadImage = async () => {
    if (!imageFile) return;

    setUploadingImage(true);
    const storageRef = ref(storage, `images/${Date.now()}_${imageFile.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, imageFile);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      setImageUrl(downloadUrl);

      toast.success("Image uploaded successfully!", { position: "top-right" });
      setUploadedImage(true);
    } catch (error) {
      console.error("Error uploading image: ", error);
      toast.error("Failed to upload image", { position: "top-right" });
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="container firebase-form p-4 mt-2">
      <ToastContainer />
      <div className="p-4">
        <div className="container firebase-form p-4 mt-2">
          <h1 className="mb-4 text-center">Carousel</h1>
          <div className="row">
            <div className="col-md-6 mb-2">
              <FloatingLabel
                controlId="floatingInput"
                label="Title"
                className="mb-4"
              >
                <Form.Control
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </FloatingLabel>
            </div>
            <div className="col-md-6 mb-4">
              <FloatingLabel
                controlId="floatingFcmTopic"
                label="WebSite Url"
                className="mb-4"
              >
                <Form.Control
                  type="text"
                  placeholder="WebSite Url"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                />
              </FloatingLabel>
            </div>
            <div className="row">
              <div className="col-md-6 mb-2">
                <label className="w-100">
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    className="mb-4"
                    onChange={handleImageChange}
                    hidden
                  />
                  <Button
                    variant="secondary"
                    className="w-100 mb-4"
                    onClick={() =>
                      document.querySelector('input[name="image"]').click()
                    }
                  >
                    Select Image
                  </Button>
                  <Button
                    variant="success"
                    className="w-100 mb-2"
                    onClick={uploadImage}
                    disabled={!fileChosen || uploadingImage || uploadedImage}
                  >
                    {uploadingImage
                      ? "Uploading..."
                      : uploadedImage
                      ? "Uploaded"
                      : "Upload Image"}
                  </Button>
                </label>
              </div>

              <div className="col-md-6 mb-4">
                <Button
                  variant="primary"
                  className="w-100"
                  onClick={handlePushNotification}
                  disabled={loading}
                >
                  {loading ? "Submiting..." : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarouselPage;
