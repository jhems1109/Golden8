import { Navbar, Nav, Col, Row } from "react-bootstrap";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa";
import Container from "react-bootstrap/Container";

const FooterComponent = () => {
  return (
    <Container fluid className="d-flex mx-auto border-primary footer">
      <Navbar className="bg-light border-top w-100">
        <Row className="mx-auto border-success w-100 align-items-center ">
          <Col className="w-100 justify-content-center align-self-center">
            <Nav className="mx-auto my-lg-3 justify-content-left">
              <Nav.Item className="x-small font-weight-lighter">
                2026 Golden 8 Beach Resort. All rights reserved.
              </Nav.Item>
            </Nav>
          </Col>

          <Col className="w-100">
            <Nav
              className="mx-auto my-lg-3 justify-content-center"
              style={{ maxHeight: "100px" }}
            ></Nav>
          </Col>
          <Col className="w-100">
            <Nav className="justify-content-end me-5">
              <Nav.Link
                href="https://web.facebook.com/profile.php?id=61559582521213"
                target="_blank"
              >
                <FaFacebookF  style={{ width: "1.5rem", height: "1.5rem"}}/>
              </Nav.Link>
            </Nav>
          </Col>
        </Row>
      </Navbar>
    </Container>
  );
};

export default FooterComponent;
