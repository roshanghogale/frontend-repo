import React, { useState } from "react";
import { Button, FloatingLabel, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../Firebase/firebaseConfig";
import { addDoc, collection } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

function StudentUpdates() {
  const [imageUrl, setImageUrl] = useState("");
  const [details, setDetails] = useState("");
  const [note, setNote] = useState("");
  const [selectionPdfUrl, setSelectionPdfUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [applicationUrl, setApplicationUrl] = useState("");
  const [extraLinkTitle, setExtraLinkTitle] = useState("");
  const [extraLinkUrl, setExtraLinkUrl] = useState("");
  const [extraLinks, setExtraLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [selectionPdf, setSelectionPdf] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingSelectionPdf, setUploadingSelectionPdf] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState(false);
  const [uploadedSelectionPdf, setUploadedSelectionPdf] = useState(false);
  const [fileChosen, setFileChosen] = useState(false);
  const [pdfChosen, setPdfChosen] = useState(false);
  const [selectionPdfChosen, setSelectionPdfChosen] = useState(false);

  const handlePushNotification = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "studentUpdates"), {
        imageUrl,
        details,
        note,
        selectionPdfUrl,
        pdfUrl,
        applicationUrl,
        extraLinks,
      });

      toast.success("Data saved to Firestore successfully!", {
        position: "top-right",
      });

      // Reset form
      setImageUrl("");
      setDetails("");
      setNote("");
      setSelectionPdfUrl("");
      setPdfUrl("");
      setApplicationUrl("");
      setExtraLinkTitle("");
      setExtraLinkUrl("");
      setExtraLinks([]);
      setImageFile(null);
      setPdfFile(null);
      setSelectionPdf(null);
      setUploadedImage(false);
      setUploadedPdf(false);
      setUploadedSelectionPdf(false);
      setFileChosen(false);
      setPdfChosen(false);
      setSelectionPdfChosen(false);
    } catch (error) {
      console.error("Firestore error:", error.message);
      toast.error(`Failed to save data: ${error.message}`, {
        position: "top-right",
      });
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

  const handleSelectionPdfChange = (e) => {
    setSelectionPdf(e.target.files[0]);
    setSelectionPdfChosen(true);
    toast.info("Selection PDF selected successfully!", {
      position: "top-right",
    });
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

  const uploadSelectionPdf = async () => {
    if (!selectionPdf) return;

    setUploadingSelectionPdf(true);
    const storageRef = ref(storage, `pdfs/${Date.now()}_${selectionPdf.name}`);
    try {
      const snapshot = await uploadBytes(storageRef, selectionPdf);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      setSelectionPdfUrl(downloadUrl);
      toast.success("Selection PDF uploaded successfully!", {
        position: "top-right",
      });
      setUploadedSelectionPdf(true);
    } catch (error) {
      console.error("Error uploading Selection PDF: ", error);
      toast.error("Failed to upload Selection PDF", { position: "top-right" });
    } finally {
      setUploadingSelectionPdf(false);
    }
  };

  const handleAddExtraLink = () => {
    if (extraLinkTitle && extraLinkUrl) {
      setExtraLinks([
        ...extraLinks,
        { title: extraLinkTitle, url: extraLinkUrl },
      ]);
      setExtraLinkTitle("");
      setExtraLinkUrl("");
      toast.success("Extra link added!", { position: "top-right" });
    } else {
      toast.error("Please provide both title and URL for the extra link", {
        position: "top-right",
      });
    }
  };

  return (
    <div className="container firebase-form">
      <ToastContainer />
      <div className="p-4">
        <div className="container firebase-form p-4 mt-2">
          <h1 className="mb-4 text-center">Student Updates</h1>
          <div className="row">
            {/* Row 1: Details */}
            <div className="col-md-12 mb-4">
              <FloatingLabel
                controlId="floatingDetails"
                label="Details"
                className="mb-4"
              >
                <Form.Control
                  type="text"
                  placeholder="Details"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                />
              </FloatingLabel>
            </div>

            {/* Row 2: Note, Application URL */}
            <div className="col-md-6 mb-4">
              <FloatingLabel
                controlId="floatingNote"
                label="Note"
                className="mb-4"
              >
                <Form.Control
                  type="text"
                  placeholder="Note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </FloatingLabel>
            </div>
            <div className="col-md-6 mb-4">
              <FloatingLabel
                controlId="floatingApplicationUrl"
                label="Application URL"
                className="mb-4"
              >
                <Form.Control
                  type="text"
                  placeholder="Application URL"
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                />
              </FloatingLabel>
            </div>

            {/* Row 3: Extra Link Title, Extra Link URL, Add Extra Link */}
            <div className="col-md-4 mb-4">
              <FloatingLabel
                controlId="floatingExtraLinkTitle"
                label="Extra Link Title"
                className="mb-4"
              >
                <Form.Control
                  type="text"
                  placeholder="Extra Link Title"
                  value={extraLinkTitle}
                  onChange={(e) => setExtraLinkTitle(e.target.value)}
                />
              </FloatingLabel>
            </div>
            <div className="col-md-4 mb-4">
              <FloatingLabel
                controlId="floatingExtraLinkUrl"
                label="Extra Link URL"
                className="mb-4"
              >
                <Form.Control
                  type="text"
                  placeholder="Extra Link URL"
                  value={extraLinkUrl}
                  onChange={(e) => setExtraLinkUrl(e.target.value)}
                />
              </FloatingLabel>
            </div>
            <div className="col-md-4 mb-4">
              <Button
                variant="primary"
                className="w-100 mb-4 h-50"
                onClick={handleAddExtraLink}
              >
                Add Extra Link
              </Button>
            </div>

            {/* Row 4: Added Extra Links */}
            {extraLinks.length > 0 && (
              <div className="col-12 mb-4">
                <h6 className="text-center">Added Extra Links:</h6>
                <ul className="list-unstyled text-center">
                  {extraLinks.map((link, index) => (
                    <li key={index} className="mb-2">
                      {link.title}:{" "}
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {link.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Row 5: Select Image, Select PDF, Select Selection PDF */}
            <div className="col-md-4 mb-4">
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
                  className="w-100 mb-2"
                  onClick={() =>
                    document.querySelector('input[name="image"]').click()
                  }
                >
                  Select Image
                </Button>
                <Button
                  variant="success"
                  className="w-100"
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
            <div className="col-md-4 mb-4">
              <label className="w-100">
                <input
                  type="file"
                  name="pdf"
                  accept=".pdf"
                  className="mb-4"
                  onChange={handlePdfChange}
                  hidden
                />
                <Button
                  variant="secondary"
                  className="w-100 mb-2"
                  onClick={() =>
                    document.querySelector('input[name="pdf"]').click()
                  }
                >
                  Select PDF
                </Button>
                <Button
                  variant="success"
                  className="w-100"
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
            <div className="col-md-4 mb-4">
              <label className="w-100">
                <input
                  type="file"
                  name="selectionPdf"
                  accept=".pdf"
                  className="mb-4"
                  onChange={handleSelectionPdfChange}
                  hidden
                />
                <Button
                  variant="secondary"
                  className="w-100 mb-2"
                  onClick={() =>
                    document.querySelector('input[name="selectionPdf"]').click()
                  }
                >
                  Select Selection PDF
                </Button>
                <Button
                  variant="success"
                  className="w-100"
                  onClick={uploadSelectionPdf}
                  disabled={
                    !selectionPdfChosen ||
                    uploadingSelectionPdf ||
                    uploadedSelectionPdf
                  }
                >
                  {uploadingSelectionPdf
                    ? "Uploading..."
                    : uploadedSelectionPdf
                    ? "Uploaded"
                    : "Upload Selection PDF"}
                </Button>
              </label>
            </div>

            {/* Row 6: Submit Button */}
            <div className="col-12 mb-4 text-center">
              <Button
                variant="primary"
                className="w-25 mx-auto"
                onClick={handlePushNotification}
                disabled={loading}
              >
                {loading ? "Sending..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentUpdates;
