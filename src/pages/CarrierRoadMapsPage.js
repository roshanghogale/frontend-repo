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

function CarrierRoadMapsPage() {
  const { documentId } = useParams();
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [educationCategory, setEducationCategory] = useState("");
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
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (documentId) {
      setIsEditing(true);
      const fetchData = async () => {
        try {
          const docRef = doc(db, "carrierRoadMaps", documentId);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setTitle(data.title || "");
            setImageUrl(data.imageUrl || "");
            setPdfUrl(data.pdfUrl || "");
            setEducationCategory(data.educationCategory || "");
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
        docRef = doc(db, "carrierRoadMaps", documentId);
        await updateDoc(docRef, {
          title,
          imageUrl,
          pdfUrl,
          educationCategory,
          notification,
          timestamp: new Date(),
          documentId,
        });
        toast.success("Data updated in Firestore successfully!", {
          position: "top-right",
        });
      } else {
        docRef = await addDoc(collection(db, "carrierRoadMaps"), {
          title,
          imageUrl,
          pdfUrl,
          educationCategory,
          notification,
          timestamp: new Date(),
          documentId: "",
        });
        const newDocumentId = docRef.id;
        await updateDoc(doc(db, "carrierRoadMaps", newDocumentId), {
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
        imageUrl,
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

  const handleEducationChange = (e) => {
    setEducationCategory(e.target.value);
  };

  return (
    <div className="container firebase-form">
      <ToastContainer />
      <div className="p-4">
        <div className="container firebase-form p-4 mt-2">
          <h1 className="mb-4 text-center">Carrier RoadMaps</h1>
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
                controlId="floatingSelectEducation"
                label="Education Category"
              >
                <Form.Select
                  name="educationCategory"
                  value={educationCategory}
                  onChange={handleEducationChange}
                >
                  <option value="">Select Education</option>
                  <option value="arts">BA/MA (Bachelor/Master of Arts)</option>
                  <option value="science">
                    BSc/MSc (Bachelor/Master of Science)
                  </option>
                  <option value="commerce">
                    BCom/MCom (Bachelor/Master of Commerce)
                  </option>
                  <option value="business">
                    BBA/MBA (Bachelor/Master of Business Administration)
                  </option>
                  <option value="computer-applications">
                    BCA/MCA (Bachelor/Master of Computer Applications)
                  </option>
                  <option value="technology">
                    BTech/MTech (Bachelor/Master of Technology)
                  </option>
                  <option value="engineering">
                    BE/ME (Bachelor/Master of Engineering)
                  </option>
                  <option value="law">LLB/LLM (Bachelor/Master of Law)</option>
                  <option value="medicine">
                    MBBS/MD (Bachelor of Medicine, Bachelor of Surgery / Doctor
                    of Medicine)
                  </option>
                  <option value="dental">
                    BDS/MDS (Bachelor/Master of Dental Surgery)
                  </option>
                  <option value="pharmacy">
                    BPharm/MPharm (Bachelor/Master of Pharmacy)
                  </option>
                  <option value="architecture">
                    BArch/MArch (Bachelor/Master of Architecture)
                  </option>
                  <option value="fine-arts">
                    BFA/MFA (Bachelor/Master of Fine Arts)
                  </option>
                  <option value="hotel-management">
                    BHM/MHM (Bachelor/Master of Hotel Management)
                  </option>
                  <option value="education">
                    BEd/MEd (Bachelor/Master of Education)
                  </option>
                  <option value="design">
                    BDes/MDes (Bachelor/Master of Design)
                  </option>
                  <option value="physiotherapy">
                    BPT/MPT (Bachelor/Master of Physiotherapy)
                  </option>
                  <option value="social-work">
                    BSW/MSW (Bachelor/Master of Social Work)
                  </option>
                  <option value="statistics">
                    BStat/MStat (Bachelor/Master of Statistics)
                  </option>
                  <option value="physical-education">
                    BPEd/MPEd (Bachelor/Master of Physical Education)
                  </option>
                  <option value="vocation">
                    BVoc/MVoc (Bachelor/Master of Vocation)
                  </option>
                  <option value="tourism">
                    BTS/MTS (Bachelor/Master of Tourism Studies)
                  </option>
                  <option value="bba-llb">BBA LLB (Integrated Law)</option>
                  <option value="bsc-nursing">
                    BSc Nursing (Bachelor of Science in Nursing)
                  </option>
                  <option value="bvs">
                    BVS (Bachelor of Veterinary Science)
                  </option>
                  <option value="bel-ed">
                    BElEd (Bachelor of Elementary Education)
                  </option>
                  <option value="bjmc">
                    BJMC (Bachelor of Journalism and Mass Communication)
                  </option>
                  <option value="bmm">BMM (Bachelor of Mass Media)</option>
                  <option value="bfm">
                    BFM (Bachelor of Financial Markets)
                  </option>
                  <option value="bbi">
                    BBI (Bachelor of Banking and Insurance)
                  </option>
                  <option value="baslp">
                    BASLP (Bachelor of Audiology and Speech-Language Pathology)
                  </option>
                  <option value="mph">MPH (Master of Public Health)</option>
                  <option value="ms">MS (Master of Surgery)</option>
                  <option value="mbs">MBS (Master of Business Studies)</option>
                  <option value="mfsc">
                    MFSc (Master of Fisheries Science)
                  </option>
                  <option value="mfm">
                    MFM (Master of Financial Management)
                  </option>
                </Form.Select>
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
                {loading ? "Submitting..." : isEditing ? "Update" : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarrierRoadMapsPage;
