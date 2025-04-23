import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button, FloatingLabel, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../Firebase/firebaseConfig";
import { addDoc, collection, doc, updateDoc, getDoc } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

function ReelsPage() {
  const { documentId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [imageUrl, setimageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [iconFile, setIconFile] = useState(null);
  const [image2File, setImage2File] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingImage2, setUploadingImage2] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadedIcon, setUploadedIcon] = useState(false);
  const [uploadedImage2, setUploadedImage2] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(false);
  const [iconChosen, setIconChosen] = useState(false);
  const [image2Chosen, setImage2Chosen] = useState(false);
  const [videoChosen, setVideoChosen] = useState(false);
  const [notification, setNotification] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (documentId) {
      setIsEditing(true);
      const fetchData = async () => {
        try {
          const docRef = doc(db, "reels", documentId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || "");
            setDescription(data.description || "");
            setIconUrl(data.iconUrl || "");
            setimageUrl(data.imageUrl || "");
            setVideoUrl(data.videoUrl || "");
            setLikeCount(data.likeCount || 0);
            setViewCount(data.viewCount || 0);
            setNotification(data.notification || false);
          } else {
            toast.error("No such document!", { position: "top-right" });
          }
        } catch (error) {
          console.error("Error fetching document: ", error);
          toast.error("Failed to fetch document", { position: "top-right" });
        }
      };
      fetchData();
    }
  }, [documentId]);

  const handlePushNotification = async (e) => {
    e.preventDefault();

    if (!notification) {
      toast.warn(
        "Notification checkbox is not checked. The notification will not be sent.",
        { position: "top-right" }
      );
    }

    setLoading(true);
    try {
      let docRef;
      if (isEditing && documentId) {
        docRef = doc(db, "reels", documentId);
        await updateDoc(docRef, {
          title,
          description,
          iconUrl,
          imageUrl,
          videoUrl,
          likeCount,
          viewCount,
          notification,
          timestamp: new Date(),
          documentId,
        });
        toast.success("Data updated in Firestore successfully!", {
          position: "top-right",
        });
      } else {
        docRef = await addDoc(collection(db, "reels"), {
          title,
          description,
          iconUrl,
          imageUrl,
          videoUrl,
          likeCount: 0,
          viewCount: 0,
          notification,
          timestamp: new Date(),
          documentId: "",
        });
        const newDocumentId = docRef.id;
        await updateDoc(doc(db, "reels", newDocumentId), {
          documentId: newDocumentId,
        });
        toast.success("Data saved to Firestore successfully!", {
          position: "top-right",
        });
      }

      const fcmTopic = "all";
      const data = {
        title,
        topic: fcmTopic,
        iconUrl,
        documentId: documentId || docRef.id,
      };

      if (notification) {
        const result = await axios.post(
          "http://localhost:3000/api/firebase/send-notification",
          data
        );

        if (result.status === 200) {
          toast.success("Notification sent successfully", {
            position: "top-right",
          });
        } else {
          toast.error("Failed to send notification", { position: "top-right" });
        }
      }
    } catch (error) {
      console.error("Error: ", error);
      toast.error("An error occurred", { position: "top-right" });
    } finally {
      setLoading(false);
    }
  };

  const handleIconChange = (e) => {
    setIconFile(e.target.files[0]);
    setIconChosen(true);
    setUploadedIcon(false);
    toast.info("Icon selected successfully!", { position: "top-right" });
  };

  const handleImage2Change = (e) => {
    setImage2File(e.target.files[0]);
    setImage2Chosen(true);
    setUploadedImage2(false);
    toast.info("Second image selected successfully!", {
      position: "top-right",
    });
  };

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
    setVideoChosen(true);
    setUploadedVideo(false);
    toast.info("Video selected successfully!", { position: "top-right" });
  };

  const uploadIcon = async () => {
    if (!iconFile) return;

    setUploadingIcon(true);
    const storageRef = ref(storage, `icons/${Date.now()}_${iconFile.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, iconFile);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      setIconUrl(downloadUrl);
      toast.success("Icon uploaded successfully!", { position: "top-right" });
      setUploadedIcon(true);
    } catch (error) {
      console.error("Error uploading icon: ", error);
      toast.error("Failed to upload icon", { position: "top-right" });
    } finally {
      setUploadingIcon(false);
    }
  };

  const uploadImage2 = async () => {
    if (!image2File) return;

    setUploadingImage2(true);
    const storageRef = ref(storage, `images/${Date.now()}_${image2File.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, image2File);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      setimageUrl(downloadUrl);
      toast.success("Second image uploaded successfully!", {
        position: "top-right",
      });
      setUploadedImage2(true);
    } catch (error) {
      console.error("Error uploading second image: ", error);
      toast.error("Failed to upload second image", { position: "top-right" });
    } finally {
      setUploadingImage2(false);
    }
  };

  const uploadVideo = async () => {
    if (!videoFile) return;

    setUploadingVideo(true);
    const storageRef = ref(storage, `videos/${Date.now()}_${videoFile.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, videoFile);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      setVideoUrl(downloadUrl);
      toast.success("Video uploaded successfully!", { position: "top-right" });
      setUploadedVideo(true);
    } catch (error) {
      console.error("Error uploading video: ", error);
      toast.error("Failed to upload video", { position: "top-right" });
    } finally {
      setUploadingVideo(false);
    }
  };

  const handleCheckboxChange = (e) => {
    setNotification(!notification);
  };

  return (
    <div className="container firebase-form">
      <ToastContainer />
      <div className="p-4">
        <div className="container firebase-form p-4 mt-2">
          <h1 className="mb-4 text-center">Reels Management</h1>
          <div className="row">
            <div className="col-md-6 mb-2">
              <FloatingLabel
                controlId="floatingTitle"
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
            <div className="col-md-6 mb-2">
              <FloatingLabel
                controlId="floatingDescription"
                label="Description"
                className="mb-4"
              >
                <Form.Control
                  type="text"
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FloatingLabel>
            </div>
            <div className="col-md-4 mb-2">
              <label className="w-100">
                <input
                  type="file"
                  name="icon"
                  accept="image/*"
                  className="mb-4"
                  onChange={handleIconChange}
                  hidden
                />
                <Button
                  variant="secondary"
                  className="w-100 mb-4"
                  onClick={() =>
                    document.querySelector('input[name="icon"]').click()
                  }
                >
                  Select Icon
                </Button>
                <Button
                  variant="success"
                  className="w-100 mb-2"
                  onClick={uploadIcon}
                  disabled={!iconChosen || uploadingIcon || uploadedIcon}
                >
                  {uploadingIcon
                    ? "Uploading..."
                    : uploadedIcon
                    ? "Uploaded"
                    : "Upload Icon"}
                </Button>
              </label>
            </div>
            <div className="col-md-4 mb-2">
              <label className="w-100">
                <input
                  type="file"
                  name="image2"
                  accept="image/*"
                  className="mb-4"
                  onChange={handleImage2Change}
                  hidden
                />
                <Button
                  variant="secondary"
                  className="w-100 mb-4"
                  onClick={() =>
                    document.querySelector('input[name="image2"]').click()
                  }
                >
                  Select Second Image
                </Button>
                <Button
                  variant="success"
                  className="w-100 mb-2"
                  onClick={uploadImage2}
                  disabled={!image2Chosen || uploadingImage2 || uploadedImage2}
                >
                  {uploadingImage2
                    ? "Uploading..."
                    : uploadedImage2
                    ? "Uploaded"
                    : "Upload Second Image"}
                </Button>
              </label>
            </div>
            <div className="col-md-4 mb-2">
              <label className="w-100 mb-2">
                <input
                  type="file"
                  name="video"
                  accept="video/*"
                  onChange={handleVideoChange}
                  hidden
                />
                <Button
                  variant="secondary"
                  className="w-100 mb-4"
                  onClick={() =>
                    document.querySelector('input[name="video"]').click()
                  }
                >
                  Select Video
                </Button>
                <Button
                  variant="success"
                  className="w-100 mb-2"
                  onClick={uploadVideo}
                  disabled={!videoChosen || uploadingVideo || uploadedVideo}
                >
                  {uploadingVideo
                    ? "Uploading..."
                    : uploadedVideo
                    ? "Uploaded"
                    : "Upload Video"}
                </Button>
              </label>
            </div>
            <div className="col-md-6 mb-4 d-flex align-items-center custom-checkbox">
              <Form.Check
                type="checkbox"
                id="notification"
                label="Notification"
                name="notification"
                className="ms-5 d-flex align-items-center"
                checked={notification}
                onChange={handleCheckboxChange}
                style={{ display: "flex", alignItems: "center" }}
              />
            </div>
            <div className="col-md-6 mb-4">
              <Button
                variant="primary"
                className="w-100"
                onClick={handlePushNotification}
                disabled={loading}
              >
                {loading ? "Submitting..." : isEditing ? "Update" : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReelsPage;
