import React, { useState, useRef } from "react";
import { Button, FloatingLabel, Form, ToastContainer } from "react-bootstrap";
import { toast } from "react-toastify";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../Firebase/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

function StoryPage() {
  const [webUrl, setWebUrl] = useState("");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [isMainStory, setIsMainStory] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [iconUploaded, setIconUploaded] = useState(false);
  const imageInputRef = useRef(null);
  const iconInputRef = useRef(null);

  const handlePushNotification = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storiesCollectionRef = collection(db, "stories");

      const storyData = {
        title,
        webUrl,
        imageUrl,
        iconUrl,
        isMainStory,
        viewed: false,
        timestamp: new Date(),
      };

      // Check for duplicate title and delete if exists
      const q = query(storiesCollectionRef, where("title", "==", title));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (docSnap) => {
          await deleteDoc(docSnap.ref);
        });
      }

      // Add new story and update with document ID
      const docRef = await addDoc(storiesCollectionRef, storyData);
      await updateDoc(docRef, { documentId: docRef.id });

      toast.success("Story saved to Firestore successfully!", {
        position: "top-right",
        autoClose: 5000,
      });
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file, pathPrefix, setUrl) => {
    if (!file) {
      toast.error(`No ${pathPrefix} selected!`, { position: "top-right" });
      return;
    }
    const storageRef = ref(storage, `${pathPrefix}/${Date.now()}_${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setUrl(url);
      if (pathPrefix === "images") {
        setImageUploaded(true);
      } else if (pathPrefix === "icons") {
        setIconUploaded(true);
      }
      toast.success(`${pathPrefix} uploaded successfully!`, {
        position: "top-right",
      });
    } catch (error) {
      console.error(`Error uploading ${pathPrefix}:`, error);
      toast.error(`Failed to upload ${pathPrefix}`, { position: "top-right" });
    }
  };

  return (
    <div className="container firebase-form p-4 mt-2">
      <ToastContainer />
      <div className="p-4">
        <h1 className="mb-4 text-center">Stories</h1>

        <div className="row">
          <div className="col-md-6 mb-2">
            <FloatingLabel label="Title" className="mb-4">
              <Form.Control
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </FloatingLabel>
          </div>
          <div className="col-md-6 mb-4">
            <FloatingLabel label="WebSite Url / Document Id" className="mb-4">
              <Form.Control
                type="text"
                placeholder="Web Url"
                value={webUrl}
                onChange={(e) => setWebUrl(e.target.value)}
              />
            </FloatingLabel>
          </div>

          {/* Upload Image */}
          <div className="col-md-6 mb-4">
            <label className="w-100">
              <input
                type="file"
                accept="image/*"
                hidden
                ref={imageInputRef}
                onChange={(e) => {
                  setImageFile(e.target.files[0]);
                  setImageUploaded(false);
                  if (e.target.files[0]) {
                    toast.success("Image selected!", { position: "top-right" });
                  }
                }}
              />
              <Button
                variant="secondary"
                className="w-100 mb-2"
                onClick={() => imageInputRef.current.click()}
              >
                Select Image
              </Button>
            </label>
            <Button
              variant="success"
              className="w-100 mb-4"
              onClick={() => uploadFile(imageFile, "images", setImageUrl)}
              disabled={!imageFile || imageUploaded}
            >
              {imageUploaded ? "Image Uploaded" : "Upload Image"}
            </Button>
          </div>

          {/* Upload Icon */}
          <div className="col-md-6 mb-4">
            <label className="w-100">
              <input
                type="file"
                accept="image/*"
                hidden
                ref={iconInputRef}
                onChange={(e) => {
                  setIconFile(e.target.files[0]);
                  setIconUploaded(false);
                  if (e.target.files[0]) {
                    toast.success("Icon selected!", { position: "top-right" });
                  }
                }}
              />
              <Button
                variant="secondary"
                className="w-100 mb-2"
                onClick={() => iconInputRef.current.click()}
              >
                Select Icon
              </Button>
            </label>
            <Button
              variant="success"
              className="w-100 mb-4"
              onClick={() => uploadFile(iconFile, "icons", setIconUrl)}
              disabled={!iconFile || iconUploaded}
            >
              {iconUploaded ? "Icon Uploaded" : "Upload Icon"}
            </Button>
          </div>
        </div>

        <div className="row align-items-center">
          <div className="col-md-6 mb-4">
            <Button
              variant="primary"
              className="w-100"
              onClick={handlePushNotification}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>

          <div className="col-md-6 mb-4 mt-2 custom-checkbox">
            <Form.Check
              type="checkbox"
              label="Save as Main Story"
              className="ms-5"
              checked={isMainStory}
              onChange={(e) => setIsMainStory(e.target.checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StoryPage;
