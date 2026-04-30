import Card from "react-bootstrap/Card";
import { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";

const About = () => {
  const [texts, setTexts] = useState({ message1: "", message2: "" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${backend}/gettextdisplays?parmid=textDisplays`,
      );
      const details = await response.json();
      details.data.map((page) => {
        if (page.textDisplays.pageName === "About") {
          setTexts(page.textDisplays);
        }
      });
    } catch (error) {
      console.error("Error fetching home data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="loading-overlay">
          <div>Loading rooms...</div>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          <div
            className="justify-content-center"
            style={{
              alignItems: "stretch",
              backgroundColor: "#e4e1db",
              hegiht: "100%",
              paddingTop: "5rem",
              paddingLeft: "10%",
              paddingRight: "10%",
              paddingBottom: "5rem",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingTop: "2rem",
                paddingBottom: "2rem",
              }}
            >
              <h1 style={{ align: "center" }}>ABOUT US</h1>
            </div>
            <Card style={{ backgroundColor: "transparent", border: "none" }}>
              <Card.Body>
                <Card.Title>OUR STORY STARTS HERE</Card.Title>
                <Card.Text className="text-dark">
                  {texts.message1}
                </Card.Text>
              </Card.Body>
              <br></br>
              <br></br>
              <Card.Img
                variant="top"
                src="/images/aboutus.jpg"
                className="w-50 justify-content-center align-self-center"
              />
              <br></br>
              <br></br>
              <Card.Body>
                <p>{texts.message2}</p>
              </Card.Body>
            </Card>
          </div>
        </>
      )}
    </>
  );
};

export default About;
