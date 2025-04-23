import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../Firebase/firebaseConfig";
import { Button, Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom"; // Import Link for routing
import "../styles/ManageAll.css";

function ManageAll() {
  const [newsItems, setNewsItems] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      const newsCollection = collection(db, "news");
      const newsSnapshot = await getDocs(newsCollection);
      const newsList = newsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setNewsItems(newsList);
    };

    fetchNews();
  }, []);

  const copyToClipboard = (id) => {
    navigator.clipboard.writeText(id);
    alert("Document ID copied to clipboard: " + id);
  };

  return (
    <Container className="gray">
      <Row>
        {newsItems.map((news) => (
          <Col key={news.id} sm={12} md={6} className="mb-4">
            <div className="news-card flex-container">
              <img src={news.imageUrl} alt="News" className="news-image" />
              <div className="news-content">
                <h5 className="news-title">
                  <Link to={`/details/${news.id}`}>{news.title}</Link>
                </h5>
                <div className="news-details">
                  <span className="news-role">
                    {news.categories?.subCategory || "Unknown Role"}
                  </span>
                  <span className="news-date">{news.lastDate}</span>
                </div>
              </div>
              <Button
                variant="outline-secondary"
                onClick={() => copyToClipboard(news.id)}
                className="bookmark-button"
              >
                Copy Document ID
              </Button>
            </div>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default ManageAll;
