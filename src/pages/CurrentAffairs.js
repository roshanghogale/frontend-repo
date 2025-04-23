import React, { useState } from "react";
import { Button, FloatingLabel, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../Firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

function CurrentAffairs() {
  const [selectedDate, setSelectedDate] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState(false);
  const [fileChosen, setFileChosen] = useState(false);
  const [pdfChosen, setPdfChosen] = useState(false);
  const [notification, setNotification] = useState(false);

  const handlePushNotification = async (e) => {
    e.preventDefault();

    if (!notification) {
      toast.error(
        "Notification checkbox is not checked. The notification will not be sent.",
        {
          position: "top-right",
        }
      );
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "currentAffairs"), {
        selectedDate,
        imageUrl,
        pdfUrl,
        notification,
      });

      const documentId = docRef.id;

      toast.success("Data saved to Firestore successfully!", {
        position: "top-right",
      });

      const fcmTopic = "all";
      const data = {
        imageUrl,
        topic: fcmTopic,
        documentId,
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

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
    setFileChosen(true);
    setUploadedImage(false);
    toast.info("Image selected successfully!", { position: "top-right" });
  };

  const handlePdfChange = (e) => {
    setPdfFile(e.target.files[0]);
    setPdfChosen(true);
    toast.info("PDF selected successfully!", { position: "top-right" });
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

  const uploadPdf = async () => {
    if (!pdfFile) return;

    setUploadingPdf(true);
    const storageRef = ref(storage, `pdfs/${Date.now()}_${pdfFile.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, pdfFile);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      setPdfUrl(downloadUrl);
      toast.success("PDF uploaded successfully!", { position: "top-right" });
      setUploadedPdf(true);
    } catch (error) {
      console.error("Error uploading PDF: ", error);
      toast.error("Failed to upload PDF", { position: "top-right" });
    } finally {
      setUploadingPdf(false);
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
          <h1 className="mb-4 text-center">Current Affairs</h1>
          <div className="row">
            <div className="col-md-6 mb-4">
              <FloatingLabel
                controlId="floatingDate"
                label="Date"
                className="mb-4"
              >
                <Form.Control
                  type="date"
                  placeholder="Date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </FloatingLabel>
            </div>
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
            <div className="col-md-6 mb-2">
              <label className="w-100 mb-2">
                <input
                  type="file"
                  name="pdf"
                  accept=".pdf"
                  onChange={handlePdfChange}
                  hidden
                />
                <Button
                  variant="secondary"
                  className="w-100 mb-4"
                  onClick={() =>
                    document.querySelector('input[name="pdf"]').click()
                  }
                >
                  Select PDF
                </Button>
                <Button
                  variant="success"
                  className="w-100 mb-2"
                  onClick={uploadPdf}
                  disabled={!pdfChosen || uploadingPdf || uploadedPdf}
                >
                  {uploadingPdf
                    ? "Uploading..."
                    : uploadedPdf
                    ? "Uploaded"
                    : "Upload PDF"}
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
                {loading ? "Submiting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurrentAffairs;
