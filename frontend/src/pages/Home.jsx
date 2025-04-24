import { useState, useEffect } from "react";
import Section from "../components/Section";
import "../styles/Section.css";
import "../styles/home.css";

const images = [
  "/home_image7.jpg",
  "/home_image7.jpg",
  "/home_image7.jpg",
  "/home_image7.jpg",
];

const Home = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <Section id="home" title="Welcome to PeerPlace!">
      <div className="carousel">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Slide ${index + 1}`}
            className={index === currentIndex ? "active" : ""}
          />
        ))}
        <div className="carousel-dots">
          {images.map((_, index) => (
            <span key={index} className={index === currentIndex ? "active" : ""}></span>
          ))}
        </div>
      </div>
      <p>Let's get trained for the best jobs out there!</p>
    </Section>
  );
};

export default Home;
