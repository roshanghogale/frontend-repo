import React, { useState } from "react";
import { Button, FloatingLabel, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../Firebase/firebaseConfig";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

function Notification() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [webUrl, setWebUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(false);
  const [fileChosen, setFileChosen] = useState(false);
  const [categories, setCategories] = useState({
    mainCategory: "",
    secondaryCategory: "",
    subCategory: "",
  });

  const handlePushNotification = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Prepare the data to send
      const fcmTopic = categories.secondaryCategory;
      const data = {
        title,
        body,
        topic: fcmTopic,
        imageUrl,
        documentId: webUrl,
      };

      // Send the notification
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

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategories((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="container firebase-form p-4 h-100">
      <ToastContainer />
      <h1 className="mb-4 text-center">Manage Notifications</h1>
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
        <div className="col-md-6 mb-2">
          <FloatingLabel controlId="floatingBody" label="Body" className="mb-4">
            <Form.Control
              type="text"
              placeholder="Body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </FloatingLabel>
        </div>

        <div className="col-md-4 mb-5">
          <FloatingLabel controlId="floatingSelectMain" label="Main Category">
            <Form.Select
              name="mainCategory"
              value={categories.mainCategory}
              onChange={handleCategoryChange}
            >
              <option value="">Select Main Category</option>
              <option value="localJob">Local Job Update</option>
              <option value="localNews">Local News</option>
            </Form.Select>
          </FloatingLabel>
        </div>
        <div className="col-md-4 mb-5">
          <FloatingLabel
            controlId="floatingSelectSecondary"
            label="Secondary Category"
          >
            <Form.Select
              name="secondaryCategory"
              value={categories.secondaryCategory}
              onChange={handleCategoryChange}
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
                MBBS/MD (Bachelor of Medicine, Bachelor of Surgery / Doctor of
                Medicine)
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
              <option value="bvs">BVS (Bachelor of Veterinary Science)</option>
              <option value="bel-ed">
                BElEd (Bachelor of Elementary Education)
              </option>
              <option value="bjmc">
                BJMC (Bachelor of Journalism and Mass Communication)
              </option>
              <option value="bmm">BMM (Bachelor of Mass Media)</option>
              <option value="bfm">BFM (Bachelor of Financial Markets)</option>
              <option value="bbi">
                BBI (Bachelor of Banking and Insurance)
              </option>
              <option value="baslp">
                BASLP (Bachelor of Audiology and Speech-Language Pathology)
              </option>

              <option value="mph">MPH (Master of Public Health)</option>
              <option value="ms">MS (Master of Surgery)</option>
              <option value="mbs">MBS (Master of Business Studies)</option>
              <option value="mfsc">MFSc (Master of Fisheries Science)</option>
              <option value="mfm">MFM (Master of Financial Management)</option>
            </Form.Select>
          </FloatingLabel>
        </div>
        <div className="col-md-4 mb-5">
          <FloatingLabel controlId="floatingSelectSub" label="Sub Category">
            <Form.Select
              name="subCategory"
              value={categories.subCategory}
              onChange={handleCategoryChange}
            >
              <option value="">Select District</option>
              <option value="ahmednagar">Ahmednagar</option>
              <option value="akola">Akola</option>
              <option value="amravati">Amravati</option>
              <option value="aurangabad">Aurangabad</option>
              <option value="beed">Beed</option>
              <option value="bhandara">Bhandara</option>
              <option value="buldhana">Buldhana</option>
              <option value="chandrapur">Chandrapur</option>
              <option value="dhule">Dhule</option>
              <option value="gadchiroli">Gadchiroli</option>
              <option value="gondia">Gondia</option>
              <option value="hingoli">Hingoli</option>
              <option value="jalgaon">Jalgaon</option>
              <option value="jalna">Jalna</option>
              <option value="kolhapur">Kolhapur</option>
              <option value="latur">Latur</option>
              <option value="mumbai-city">Mumbai City</option>
              <option value="mumbai-suburban">Mumbai Suburban</option>
              <option value="nagpur">Nagpur</option>
              <option value="nanded">Nanded</option>
              <option value="nandurbar">Nandurbar</option>
              <option value="nashik">Nashik</option>
              <option value="osmanabad">Osmanabad</option>
              <option value="palghar">Palghar</option>
              <option value="parbhani">Parbhani</option>
              <option value="pune">Pune</option>
              <option value="raigad">Raigad</option>
              <option value="ratnagiri">Ratnagiri</option>
              <option value="sangli">Sangli</option>
              <option value="satara">Satara</option>
              <option value="sindhudurg">Sindhudurg</option>
              <option value="solapur">Solapur</option>
              <option value="thane">Thane</option>
              <option value="wardha">Wardha</option>
              <option value="washim">Washim</option>
              <option value="yavatmal">Yavatmal</option>
            </Form.Select>
          </FloatingLabel>
        </div>

        <div className="col-md-6 mb-4">
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
              className="w-100 mb-4 mt-3"
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
          <FloatingLabel
            controlId="floatingFcmTopic"
            label="News IDs or Web Url"
            className="mb-3"
          >
            <Form.Control
              type="text"
              placeholder="News IDs or Web Url"
              value={webUrl}
              onChange={(e) => setWebUrl(e.target.value)}
            />
          </FloatingLabel>

          <Button
            variant="primary"
            className="w-100"
            onClick={handlePushNotification}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Notification"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Notification;
