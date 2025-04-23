import React, { useState } from "react";
import { Button, FloatingLabel, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../Firebase/firebaseConfig";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

function ResultHallTicketUpdates({ subCategory = "result" }) {
  const [iconUrl, setIconUrl] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [subCategoryState, setSubCategoryState] = useState(subCategory);
  const [resultDetails, setResultDetails] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [websiteUrlTitle, setWebsiteUrlTitle] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [websiteUrls, setWebsiteUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [iconFile, setIconFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadedIcon, setUploadedIcon] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState(false);
  const [iconChosen, setIconChosen] = useState(false);
  const [fileChosen, setFileChosen] = useState(false);
  const [pdfChosen, setPdfChosen] = useState(false);

  const handlePushNotification = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!title.trim() || !resultDetails.trim()) {
      toast.error("Title and Result Details are required.", {
        position: "top-right",
      });
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(
        collection(db, "resultAndHallticketUpdates"),
        {
          iconUrl,
          lastDate,
          title: title.trim(),
          category,
          subCategory: subCategoryState,
          resultDetails: resultDetails.trim(),
          imageUrl,
          pdfUrl,
          websiteUrls,
          timestamp: new Date(),
        }
      );

      const documentId = docRef.id;
      await updateDoc(doc(db, "resultAndHallticketUpdates", documentId), {
        documentId,
      });

      toast.success(
        `Data saved to Firestore successfully for ${
          subCategoryState === "result" ? "Results" : "Hall Tickets"
        }!`,
        {
          position: "top-right",
        }
      );

      // Reset form
      setIconUrl("");
      setLastDate("");
      setTitle("");
      setCategory("");
      setSubCategoryState(subCategory);
      setResultDetails("");
      setImageUrl("");
      setPdfUrl("");
      setWebsiteUrls([]);
      setWebsiteUrlTitle("");
      setWebsiteUrl("");
      setIconFile(null);
      setImageFile(null);
      setPdfFile(null);
      setUploadedIcon(false);
      setUploadedImage(false);
      setUploadedPdf(false);
      setIconChosen(false);
      setFileChosen(false);
      setPdfChosen(false);
    } catch (error) {
      console.error("Firestore error:", error.message);
      toast.error(`Failed to save data: ${error.message}`, {
        position: "top-right",
      });
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

  const uploadIcon = async () => {
    if (!iconFile) return;

    setUploadingIcon(true);
    const storageRef = ref(
      storage,
      `${subCategoryState}/${Date.now()}_${iconFile.name}`
    );
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

  const uploadImage = async () => {
    if (!imageFile) return;

    setUploadingImage(true);
    const storageRef = ref(
      storage,
      `${subCategoryState}/${Date.now()}_${imageFile.name}`
    );
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
    const storageRef = ref(
      storage,
      `${subCategoryState}/${Date.now()}_${pdfFile.name}`
    );
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

  const handleAddWebsiteUrl = () => {
    if (websiteUrlTitle && websiteUrl) {
      setWebsiteUrls([
        ...websiteUrls,
        { title: websiteUrlTitle, url: websiteUrl },
      ]);
      setWebsiteUrlTitle("");
      setWebsiteUrl("");
      toast.success("Website URL added!", { position: "top-right" });
    } else {
      toast.error("Please provide both title and URL for the website", {
        position: "top-right",
      });
    }
  };

  return (
    <div className="container firebase-form">
      <ToastContainer />
      <div className="p-4">
        <div className="container firebase-form p-4 mt-2">
          <h1 className="mb-4 text-center">
            {subCategoryState === "result"
              ? "Results Upload"
              : "Hall Tickets Upload"}
          </h1>
          <div className="row">
            {/* Row 1: Title, Result Details */}
            <div className="col-md-6 mb-4">
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
            <div className="col-md-6 mb-4">
              <FloatingLabel
                controlId="floatingResultDetails"
                label="Result Details"
                className="mb-4"
              >
                <Form.Control
                  type="text"
                  placeholder="Result Details"
                  value={resultDetails}
                  onChange={(e) => setResultDetails(e.target.value)}
                />
              </FloatingLabel>
            </div>

            {/* Row 2: Last Date */}
            <div className="col-md-6 mb-4">
              <FloatingLabel
                controlId="floatingLastDate"
                label="Last Date (Exam)"
                className="mb-4"
              >
                <Form.Control
                  type="date"
                  placeholder="Last Date (Exam)"
                  value={lastDate}
                  onChange={(e) => setLastDate(e.target.value)}
                />
              </FloatingLabel>
            </div>
            <div className="col-md-6 mb-4"></div>

            {/* Row 3: Category, Sub Category */}
            <div className="col-md-6 mb-4">
              <FloatingLabel
                controlId="floatingCategory"
                label="Category (State)"
              >
                <Form.Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Select State</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Tamil Nadu">Tamil Nadu</option>
                </Form.Select>
              </FloatingLabel>
            </div>
            <div className="col-md-6 mb-4">
              <FloatingLabel
                controlId="floatingSubCategory"
                label="Sub Category"
              >
                <Form.Select
                  value={subCategoryState}
                  onChange={(e) => setSubCategoryState(e.target.value)}
                >
                  <option value="result">Result</option>
                  <option value="hall-ticket">Hall Ticket</option>
                </Form.Select>
              </FloatingLabel>
            </div>

            {/* Row 4: Website URL Title, Website URL, Add Website URL */}
            <div className="col-md-4 mb-4">
              <FloatingLabel
                controlId="floatingWebsiteUrlTitle"
                label="Website URL Title"
                className="mb-4"
              >
                <Form.Control
                  type="text"
                  placeholder="Website URL Title"
                  value={websiteUrlTitle}
                  onChange={(e) => setWebsiteUrlTitle(e.target.value)}
                />
              </FloatingLabel>
            </div>
            <div className="col-md-4 mb-4">
              <FloatingLabel
                controlId="floatingWebsiteUrl"
                label="Website URL"
                className="mb-4"
              >
                <Form.Control
                  type="text"
                  placeholder="Website URL"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                />
              </FloatingLabel>
            </div>
            <div className="col-md-4 mb-4">
              <Button
                variant="primary"
                className="w-100"
                onClick={handleAddWebsiteUrl}
              >
                Add Website URL
              </Button>
            </div>

            {/* Row 5: Added Website URLs */}
            {websiteUrls.length > 0 && (
              <div className="col-12 mb-4">
                <h6 className="text-center">Added Website URLs:</h6>
                <ul className="list-unstyled text-center">
                  {websiteUrls.map((website, index) => (
                    <li key={index} className="mb-2">
                      {website.title}:{" "}
                      <a
                        href={website.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {website.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Row 6: Select Icon, Select Image, Select PDF */}
            <div className="col-md-4 mb-4">
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
                  className="w-100 mb-2"
                  onClick={() =>
                    document.querySelector('input[name="icon"]').click()
                  }
                >
                  Select Icon
                </Button>
                <Button
                  variant="success"
                  className="w-100"
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

            {/* Row 7: Submit Button */}
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

export default ResultHallTicketUpdates;
