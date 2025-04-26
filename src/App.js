import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
import { Button, FloatingLabel, Form } from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "./Firebase/firebaseConfig";
import { addDoc, collection, doc, updateDoc } from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// React Bootstrap Components
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Container from "react-bootstrap/Container";

// Import your pages
import CarouselPage from "./pages/CarouselPage";
import SliderPage from "./pages/SliderPage";
import JobUpdates from "./pages/StoryPage";
import CurrentAffairs from "./pages/CurrentAffairs";
import Notification from "./pages/Notification";
import ManageAll from "./pages/ManageAll";
import Details from "./pages/Details";
import CarrierRoadMapsPage from "./pages/CarrierRoadMapsPage";
import CareerRoadMapPage from "./pages/CareerRoadMapPage";
import StudentUpdates from "./pages/StudentUpdates";
import ResultHallTicketUpdates from "./pages/ResultHallTicketUpdates";

function App() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [lastDate, setLastDate] = useState("");
  const [applicationLink, setApplicationLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [iconUrl, setIconUrl] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [selectionPdfUrl, setSelectionPdfUrl] = useState("");
  const [extraLinkTitle, setExtraLinkTitle] = useState("");
  const [extraLinkUrl, setExtraLinkUrl] = useState("");
  const [extraLinks, setExtraLinks] = useState([]);
  const [salary, setSalary] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [iconFile, setIconFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [selectionPdf, setSelectionPdf] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);
  const [uploadingSelectionPdf, setUploadingSelectionPdf] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(false);
  const [uploadedIcon, setUploadedIcon] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState(false);
  const [uploadedSelectionPdf, setUploadedSelectionPdf] = useState(false);
  const [fileChosen, setFileChosen] = useState(false);
  const [iconChosen, setIconChosen] = useState(false);
  const [pdfChosen, setPdfChosen] = useState(false);
  const [selectionPdfChosen, setSelectionPdfChosen] = useState(false);
  const [notification, setNotification] = useState(false);
  const [categories, setCategories] = useState({
    mainCategory: "",
    secondaryCategory: "",
    subCategory: "",
  });

  const categorySubcategoryMap = {
    bank: [
      { value: "private-bank", label: "Private Bank" },
      { value: "govt-bank", label: "Govt. Bank" },
    ],
    govt: [
      { value: "maha-govt", label: "Maha Govt." },
      { value: "central-govt", label: "Central Govt." },
    ],
    private: [
      { value: "work-home", label: "Work Home" },
      { value: "regular-job", label: "Regular Job" },
    ],
  };

  const handlePushNotification = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!title.trim() || !body.trim()) {
      toast.error("Title and Details are required.", { position: "top-right" });
      return;
    }

    if (notification && !categories.secondaryCategory.trim()) {
      toast.error("Secondary Category is required for notifications.", {
        position: "top-right",
      });
      return;
    }

    if (!notification) {
      toast.warn(
        "Notification checkbox is not checked. Data will be saved without sending a notification.",
        { position: "top-right" }
      );
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, "jobUpdate"), {
        title: title.trim(),
        details: body.trim(),
        iconUrl,
        imageUrl,
        pdfUrl,
        selectionPdfUrl,
        applicationLink,
        extraLinks,
        salary: Number(salary) || 0,
        categories,
        notification,
        timestamp: new Date(),
        lastDate,
        documentId: "",
        note: note || "",
        mainCategory: categories.mainCategory,
        secondaryCategory: categories.secondaryCategory,
        subCategory: categories.subCategory,
      });

      const documentId = docRef.id;
      await updateDoc(doc(db, "jobUpdate", documentId), { documentId });

      toast.success("Data saved to Firestore successfully!", {
        position: "top-right",
      });

      if (notification) {
        const fcmTopic = categories.secondaryCategory;
        const data = {
          title: title.trim(),
          body: body.trim(),
          topic: fcmTopic,
          imageUrl,
          documentId,
        };

        try {
          const result = await axios.post(
            "/api/firebase/send-notification",
            data
          );
          if (result.status === 200) {
            toast.success("Notification sent successfully", {
              position: "top-right",
            });
          } else {
            toast.error(`Notification failed: ${result.statusText}`, {
              position: "top-right",
            });
          }
        } catch (axiosError) {
          console.error("Axios error:", axiosError);
          toast.error("Failed to send notification. Check server status.", {
            position: "top-right",
          });
        }
      }

      // Reset form
      setTitle("");
      setBody("");
      setLastDate("");
      setApplicationLink("");
      setIconUrl("");
      setPdfUrl("");
      setSelectionPdfUrl("");
      setExtraLinks([]);
      setSalary("");
      setNote("");
      setImageFile(null);
      setIconFile(null);
      setPdfFile(null);
      setSelectionPdf(null);
      setUploadedImage(false);
      setUploadedIcon(false);
      setUploadedPdf(false);
      setUploadedSelectionPdf(false);
      setFileChosen(false);
      setIconChosen(false);
      setPdfChosen(false);
      setSelectionPdfChosen(false);
      setCategories({
        mainCategory: "",
        secondaryCategory: "",
        subCategory: "",
      });
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

  const handleIconChange = (e) => {
    setIconFile(e.target.files[0]);
    setIconChosen(true);
    setUploadedIcon(false);
    toast.info("Icon selected successfully!", { position: "top-right" });
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

  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setCategories((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "mainCategory" ? { subCategory: "" } : {}),
    }));
  };

  const handleCheckboxChange = (e) => {
    setNotification(!notification);
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
    <Router>
      <ToastContainer />
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse
            id="basic-navbar-nav"
            className="justify-content-center"
          >
            <Nav>
              <Nav.Link as={NavLink} to="/" end>
                Job Updates
              </Nav.Link>
              <Nav.Link as={NavLink} to="/current-affairs">
                Current Affairs
              </Nav.Link>
              <Nav.Link as={NavLink} to="/carrier-roadmaps">
                Career RoadMaps
              </Nav.Link>
              <Nav.Link as={NavLink} to="/student-updates">
                StudentUpdates
              </Nav.Link>
              <Nav.Link as={NavLink} to="/randh-ticket">
                R/H Ticket
              </Nav.Link>
              <Nav.Link as={NavLink} to="/career-roadmap">
                Reel
              </Nav.Link>
              <Nav.Link as={NavLink} to="/job-updates">
                Story
              </Nav.Link>
              <Nav.Link as={NavLink} to="/carousel">
                Carousel
              </Nav.Link>
              <Nav.Link as={NavLink} to="/slider">
                Slider
              </Nav.Link>
              <Nav.Link as={NavLink} to="/notification">
                Notification
              </Nav.Link>
              <Nav.Link as={NavLink} to="/manage-all">
                Manage All
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="p-4">
        <Routes>
          <Route
            path="/"
            element={
              <div className="container firebase-form p-4 mt-2">
                <h1 className="mb-4 text-center">Job Updates</h1>
                <div className="row">
                  {/* Row 1: Title, Details */}
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
                    <FloatingLabel
                      controlId="floatingBody"
                      label="Details"
                      className="mb-4"
                    >
                      <Form.Control
                        type="text"
                        placeholder="Details"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                      />
                    </FloatingLabel>
                  </div>

                  {/* Row 2: Salary, Main Category, Sub Category, Secondary Category */}
                  <div className="col-md-3 mb-4">
                    <FloatingLabel
                      controlId="floatingSalary"
                      label="Salary (INR)"
                      className="mb-4"
                    >
                      <Form.Control
                        type="number"
                        placeholder="Salary (INR)"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        min="0"
                      />
                    </FloatingLabel>
                  </div>
                  <div className="col-md-3 mb-4">
                    <FloatingLabel
                      controlId="floatingSelectMain"
                      label="Main Category"
                    >
                      <Form.Select
                        name="mainCategory"
                        value={categories.mainCategory}
                        onChange={handleCategoryChange}
                      >
                        <option value="">Select Main Category</option>
                        <option value="govt">Government Job</option>
                        <option value="bank">Bank Job</option>
                        <option value="private">Private Job</option>
                      </Form.Select>
                    </FloatingLabel>
                  </div>
                  <div className="col-md-3 mb-4">
                    <FloatingLabel
                      controlId="floatingSelectSub"
                      label="Sub Category"
                    >
                      <Form.Select
                        name="subCategory"
                        value={categories.subCategory}
                        onChange={handleCategoryChange}
                        disabled={!categories.mainCategory}
                      >
                        <option value="">Select Sub Category</option>
                        {categories.mainCategory &&
                          categorySubcategoryMap[categories.mainCategory]?.map(
                            (subCat) => (
                              <option key={subCat.value} value={subCat.value}>
                                {subCat.label}
                              </option>
                            )
                          )}
                      </Form.Select>
                    </FloatingLabel>
                  </div>
                  <div className="col-md-3 mb-4">
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
                        <option value="arts">
                          BA/MA (Bachelor/Master of Arts)
                        </option>
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
                        <option value="law">
                          LLB/LLM (Bachelor/Master of Law)
                        </option>
                        <option value="medicine">
                          MBBS/MD (Bachelor of Medicine, Bachelor of Surgery /
                          Doctor of Medicine)
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
                        <option value="bba-llb">
                          BBA LLB (Integrated Law)
                        </option>
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
                        <option value="bmm">
                          BMM (Bachelor of Mass Media)
                        </option>
                        <option value="bfm">
                          BFM (Bachelor of Financial Markets)
                        </option>
                        <option value="bbi">
                          BBI (Bachelor of Banking and Insurance)
                        </option>
                        <option value="baslp">
                          BASLP (Bachelor of Audiology and Speech-Language
                          Pathology)
                        </option>
                        <option value="mph">
                          MPH (Master of Public Health)
                        </option>
                        <option value="ms">MS (Master of Surgery)</option>
                        <option value="mbs">
                          MBS (Master of Business Studies)
                        </option>
                        <option value="mfsc">
                          MFSc (Master of Fisheries Science)
                        </option>
                        <option value="mfm">
                          MFM (Master of Financial Management)
                        </option>
                      </Form.Select>
                    </FloatingLabel>
                  </div>

                  {/* Row 3: Last Date, Application Link, Extra Link Title, Extra Link URL */}
                  <div className="col-md-3 mb-4">
                    <FloatingLabel
                      controlId="floatingLastDate"
                      label="Last Date"
                      className="mb-4"
                    >
                      <Form.Control
                        type="date"
                        placeholder="Last Date"
                        value={lastDate}
                        onChange={(e) => setLastDate(e.target.value)}
                      />
                    </FloatingLabel>
                  </div>
                  <div className="col-md-3 mb-4">
                    <FloatingLabel
                      controlId="floatingApplicationLink"
                      label="Application Link"
                      className="mb-4"
                    >
                      <Form.Control
                        type="text"
                        placeholder="Application Link"
                        value={applicationLink}
                        onChange={(e) => setApplicationLink(e.target.value)}
                      />
                    </FloatingLabel>
                  </div>
                  <div className="col-md-3 mb-4">
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
                  <div className="col-md-3 mb-4">
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

                  {/* Row 4: Add Extra Link, Select Icon, Select Image, Select PDF */}
                  <div className="col-md-3 mb-2">
                    <Button
                      variant="primary"
                      className="w-100 mb-4"
                      onClick={handleAddExtraLink}
                    >
                      Add Extra Link
                    </Button>
                    {extraLinks.length > 0 && (
                      <div className="mt-2">
                        <h6>Added Extra Links:</h6>
                        <ul className="list-unstyled">
                          {extraLinks.map((link, index) => (
                            <li key={index}>
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
                  </div>
                  <div className="col-md-3 mb-2">
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
                  <div className="col-md-3 mb-2">
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
                        disabled={
                          !fileChosen || uploadingImage || uploadedImage
                        }
                      >
                        {uploadingImage
                          ? "Uploading..."
                          : uploadedImage
                          ? "Uploaded"
                          : "Upload Image"}
                      </Button>
                    </label>
                  </div>
                  <div className="col-md-3 mb-2">
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

                  {/* Row 5: Select Selection PDF, Note, Notification Checkbox */}
                  <div className="col-md-4 mb-2">
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
                        className="w-100 mb-4"
                        onClick={() =>
                          document
                            .querySelector('input[name="selectionPdf"]')
                            .click()
                        }
                      >
                        Select Selection PDF
                      </Button>
                      <Button
                        variant="success"
                        className="w-100 mb-2"
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
                  <div className="col-md-4 mb-4">
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
                  <div className="col-md-4 mb-4 d-flex align-items-center custom-checkbox">
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

                  {/* Row 6: Send Notification (spanning full width) */}
                  <div className="col-12 mb-4">
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
            }
          />
          <Route path="/carousel" element={<CarouselPage />} />
          <Route path="/slider" element={<SliderPage />} />
          <Route path="/student-updates" element={<StudentUpdates />} />
          <Route path="/randh-ticket" element={<ResultHallTicketUpdates />} />
          <Route path="/job-updates" element={<JobUpdates />} />
          <Route path="/current-affairs" element={<CurrentAffairs />} />
          <Route path="/carrier-roadmaps" element={<CarrierRoadMapsPage />} />
          <Route path="/career-roadmap" element={<CareerRoadMapPage />} />
          <Route path="/notification" element={<Notification />} />
          <Route path="/manage-all" element={<ManageAll />} />
          <Route path="/details/:id" element={<Details />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
