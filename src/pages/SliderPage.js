import React, { useState, useEffect } from "react";
import {
  Card,
  Spinner,
  Button,
  FloatingLabel,
  Modal,
  Form,
  Dropdown,
} from "react-bootstrap";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, db } from "../Firebase/firebaseConfig";
import {
  addDoc,
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import "react-toastify/dist/ReactToastify.css";
import "../App.css";

function SliderPage() {
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [currentStory, setCurrentStory] = useState(null);
  const [webUrl, setWebUrl] = useState("");
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(false);
  const [fileChosen, setFileChosen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Kendra Sarkar");
  const categories = [
    "Kendra Sarkar",
    "Private Jobs",
    "Work from Home",
    "Local Jobs",
    "Career Roadmaps",
    "Student News",
    "Result-Hall Ticket",
  ];
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const collectionRef = collection(
          db,
          "sliders",
          selectedCategory,
          "documents"
        );
        const querySnapshot = await getDocs(collectionRef);

        const storiesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setStories(storiesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching stories: ", error);
        setLoading(false);
      }
    };

    fetchStories();
  }, [selectedCategory]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "sliders", selectedCategory, "documents", id));
      setStories((prevStories) =>
        prevStories.filter((story) => story.id !== id)
      );
    } catch (error) {
      console.error("Error deleting story: ", error);
    }
  };

  const handleEdit = (story) => {
    setCurrentStory(story);
    setNewTitle(story.title);
    setShowEditModal(true);
    setImagePreview(story.imageUrl);
  };

  const handleModalClose = () => {
    setShowEditModal(false);
    setNewImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewImage(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handlePushNotification = async (e) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Get the selected category
      const selectedSubCollection = selectedCategory; // e.g., "Kendra Sarkar"

      // Create a reference to the sub-collection inside the "sliders" collection
      const collectionRef = collection(
        db,
        "sliders",
        selectedSubCollection,
        "documents"
      );

      // Upload data to Firestore and get the document ID in the selected sub-collection
      const docRef = await addDoc(collectionRef, {
        title,
        documentId: webUrl, // Assuming this is what you want in place of URL
        imageUrl,
        timestamp: new Date(),
      });

      // Get the document ID
      const documentId = docRef.id;

      toast.success("Data saved to Firestore successfully!", {
        position: "top-right",
      });

      // Prepare the data to send in a push notification
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
  const handleUpdate = async () => {
    try {
      let imageUrl = currentStory.imageUrl;

      if (newImage) {
        const storageRef = ref(storage, `images/${newImage.name}`);
        await uploadBytes(storageRef, newImage);
        imageUrl = await getDownloadURL(storageRef);
      }

      await updateDoc(
        doc(db, "sliders", selectedCategory, "documents", currentStory.id),
        {
          title: newTitle,
          imageUrl: imageUrl,
        }
      );

      setStories((prevStories) =>
        prevStories.map((story) =>
          story.id === currentStory.id
            ? { ...story, title: newTitle, imageUrl }
            : story
        )
      );

      handleModalClose();
    } catch (error) {
      console.error("Error updating story: ", error);
    }
  };

  const handleImageChange2 = (e) => {
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
    <div className="ps-4 pe-4 pb-4">
      <ToastContainer />
      <div>
        <div className="container firebase-form ">
          <h1 className="mb-4 text-center">Sliders</h1>
          <div className="row">
            <div className="col-md-6 mb-2">
              <FloatingLabel
                controlId="floatingInput"
                label="Title"
                className="mb-2"
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
                controlId="floatingFcmTopic"
                label="Document Id"
                className="mb-4"
              >
                <Form.Control
                  type="text"
                  placeholder="Document Id"
                  value={webUrl}
                  onChange={(e) => setWebUrl(e.target.value)}
                />
              </FloatingLabel>
            </div>
            <div className="col-md-6 mb-4">
              <FloatingLabel
                controlId="floatingSelectCategory"
                label="Select Category"
                className="mb-4"
              >
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </Form.Select>
              </FloatingLabel>
            </div>
            <div className="col-md-6 mb-2">
              <label className="w-100 d-flex justify-content-between">
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="mb-4"
                  onChange={handleImageChange2}
                  hidden
                />
                <Button
                  variant="secondary"
                  className="w-100 m-2"
                  onClick={() =>
                    document.querySelector('input[name="image"]').click()
                  }
                >
                  Select Image
                </Button>
                <Button
                  variant="success"
                  className="w-100 m-2"
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

            <div className="col-md-12 mb-4">
              <Button
                variant="primary"
                className="w-100 h-100"
                onClick={handlePushNotification}
                disabled={loading}
              >
                {loading ? "Submiting..." : "Submit"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-2 ms-4">
        <h2 className="mb-4">Manage Stories</h2>
        <Dropdown>
          <Dropdown.Toggle variant="success" id="dropdown-basic">
            {selectedCategory}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {categories.map((category) => (
              <Dropdown.Item
                key={category}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {loading ? (
          <Spinner animation="border" variant="primary" />
        ) : (
          <div
            style={{
              display: "flex",
              overflowX: "scroll",
              gap: "10px",
              marginTop: "20px",
            }}
          >
            {stories.map((story) => (
              <Card key={story.id} style={{ width: "130px", flex: "0 0 auto" }}>
                <Card.Img
                  variant="top"
                  src={story.imageUrl}
                  alt={story.title}
                  style={{ height: "150px", objectFit: "cover" }}
                />
                <Card.Body style={{ padding: "6px" }}>
                  <Card.Title style={{ fontSize: "14px" }}>
                    {story.title}
                  </Card.Title>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => handleEdit(story)}
                      style={{ marginRight: "5px" }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(story.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <Modal show={showEditModal} onHide={handleModalClose}>
          <Modal.Header closeButton>
            <Modal.Title>Edit Story</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="text-center">
              {imagePreview && (
                <Card
                  style={{ width: "150px", height: "150px", margin: "0 auto" }}
                >
                  <Card.Img
                    variant="top"
                    src={imagePreview}
                    alt="Image Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <Card.Body style={{ padding: "0", textAlign: "center" }}>
                    <Card.Title style={{ fontSize: "18px", margin: "4px 0px" }}>
                      {newTitle || currentStory.title}
                    </Card.Title>
                  </Card.Body>
                </Card>
              )}
            </div>
            <Form style={{ margin: "50px 0px 0px 20px" }}>
              <Form.Group controlId="formTitle">
                <Form.Label style={{ fontWeight: "bold", fontSize: "16px" }}>
                  Update Title
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter new title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </Form.Group>
              <Form.Group controlId="formImage">
                <Form.Label style={{ fontWeight: "bold", fontSize: "16px" }}>
                  Update Image
                </Form.Label>
                <Form.Control
                  style={{ background: "#abdff5" }}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalClose}>
              Close
            </Button>
            <Button variant="primary" onClick={handleUpdate}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default SliderPage;
