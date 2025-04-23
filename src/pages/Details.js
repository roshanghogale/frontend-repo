import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Firebase/firebaseConfig";
import "../styles/Details.css";

function Details() {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);

  useEffect(() => {
    const fetchNewsItem = async () => {
      const docRef = doc(db, "news", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setNewsItem(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };

    fetchNewsItem();
  }, [id]);

  if (!newsItem) return <p>Loading...</p>;

  return (
    <div className="details-container">
      <div className="details-header">
        <div className="details-image">
          <img src={newsItem.imageUrl} alt="News" />
        </div>
        <h1 className="details-title">{newsItem.title}</h1>
      </div>
      <div className="details-fields">
        <p>
          <strong>Main Category:</strong>{" "}
          {newsItem.categories?.mainCategory || "Unknown Main Category"}
        </p>
        {newsItem.categories?.secondaryCategory && (
          <p>
            <strong>Secondary Category:</strong>{" "}
            {newsItem.categories.secondaryCategory}
          </p>
        )}
        {newsItem.categories?.subCategory && (
          <p>
            <strong>Sub Category:</strong> {newsItem.categories.subCategory}
          </p>
        )}
        {Object.entries(newsItem).map(([key, value]) => {
          if (typeof value === "boolean") {
            return (
              <p key={key}>
                <strong>{key}:</strong> {value ? "True" : "False"}
              </p>
            );
          }
          if (typeof value === "string" && value.startsWith("http")) {
            return (
              <p key={key}>
                <strong>{key}:</strong>{" "}
                <a href={value} target="_blank" rel="noopener noreferrer">
                  {value}
                </a>
              </p>
            );
          }
          return null;
        })}
        <p>
          <strong>Body:</strong> {newsItem.body}
        </p>
      </div>
    </div>
  );
}

export default Details;
