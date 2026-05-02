import "bootstrap/dist/css/bootstrap.css";
import Col from "react-bootstrap/Col";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Row from "react-bootstrap/Row";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";

const Contact = () => {
  const [currValues, setCurrentValues] = useState({
    fullName: "",
    email: "",
    msg: "",
  });
  const [errorMessage, setErrorMessage] = useState([]);

  const handleMsg = (e) => {
    const field = e.target.name;
    setCurrentValues({ ...currValues, [field]: e.target.value });
  };

  const navigate = useNavigate();
  const navigateCreateMsg = (e) => {
    let errMsgs = [];
    let focusON = false;
    if (currValues.fullName.trim() === "") {
      errMsgs.push("Please supply your name.");
      document.getElementById("fullName").focus();
      focusON = true;
    }
    if (currValues.email === "") {
      errMsgs.push("Please supply your email address or contact number");
      if (!focusON) {
        document.getElementById("email").focus();
        focusON = true;
      }
    }
    if (currValues.msg.trim() === "") {
      errMsgs.push("Please input your message.");
      if (!focusON) {
        document.getElementById("msg").focus();
        focusON = true;
      }
    }
    setErrorMessage(errMsgs);
    if (errMsgs.length > 0) {
      return;
    }
    fetch(`${backend}/contactus`, {
      method: "POST",
      body: JSON.stringify(currValues),
      headers: {
        "Content-Type": "Application/JSON",
      },
    }).then(() => {
      alert("Thank you for your message.");
      navigate("/");
    });
  };

  return (
    <>
      <div
        // className="App"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8F9FA",
          paddingTop: "2rem",
          paddingBottom: "2rem",
        }}
      >
        {" "}
        <h1 style={{ align: "center" }}>Come and visit us</h1>
      </div>
      <div
        style={{
          height: "30rem",
          paddingTop: "2rem",
          paddingBottom: "1rem",
          textAlign: "center",
        }}
        
      >
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3831.7764635572207!2d122.01833017519992!3d16.18047393645007!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x339af50c4a5bb70f%3A0x83a0fd8fdff14b08!2sGOLDEN%208%20BEACH%20RESORT!5e0!3m2!1sen!2sph!4v1776943787516!5m2!1sen!2sph"
          width="50%"
          height="100%"
          title="Golden 8 Resort Casiguran Google Map"
          className="smlimg"
        ></iframe>
      </div>
      <div
        className="d-flex justify-content-center"
        style={{
          backgroundColor: "#F8F9FA",
          paddingTop: "1rem",
          paddingBottom: "3rem",
        }}
      >
        <Card
          style={{ width: "60rem", padding: 20, backgroundColor: "#F8F9FA" }}
        >
          {errorMessage.length > 0 && (
            <div className="alert alert-danger mb-3 p-1">
              {errorMessage.map((err, index) => (
                <p className="mb-0" key={index}>
                  {err}
                </p>
              ))}
            </div>
          )}
          <h2 className="mb-4 center-text">Send Us a Message</h2>
          <h8 className="mb-4 center-text">
            {" "}
            Send us a message and we will try to respond within 3 business days.
          </h8>
          {/* <Form onSubmit={(e) => { navigateCreateMsg(e)}}> */}
          <Form>
            <Row className="mb-3">
              <Form.Group as={Col}>
                <Form.Label>Full name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Input your name here."
                  id="fullName"
                  name="fullName"
                  className="form-control"
                  value={currValues.fullName}
                  onChange={handleMsg}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
              <Form.Group as={Col}>
                <Form.Label>E-mail or Phone Number</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={currValues.email}
                  onChange={handleMsg}
                />
                <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
              </Form.Group>
            </Row>
            <Form.Group as={Col} xl="12">
              <Form.Label>Message</Form.Label>
              <Form.Control
                required
                as="textarea"
                rows={3}
                placeholder="Please type your message here."
                id="msg"
                name="msg"
                className="form-control"
                value={currValues.msg}
                onChange={handleMsg}
              />
              <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            </Form.Group>
            <Form.Group as={Col} xl="12">
              <Form.Label> </Form.Label>
            </Form.Group>
          </Form>
          <Form.Group as={Row} className="mb-3 text-center">
            <Col>
              {/* <Button style={{backgroundColor: '#116466'}} type="submit">Submit</Button> */}
              <Button
                style={{ backgroundColor: "#116466" }}
                type="button"
                onClick={navigateCreateMsg}
              >
                Submit
              </Button>
            </Col>
          </Form.Group>
        </Card>
      </div>
    </>
  );
};

export default Contact;
