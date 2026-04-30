import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { FaSearch, FaUserCircle, FaBell } from "react-icons/fa";
import { IoMenu } from "react-icons/io5";
import { Col, Row } from "react-bootstrap";
import "./navigationcomponent.css";
import Dropdown from "react-bootstrap/Dropdown";
import useAuth, { checkIfSignedIn } from "../hooks/auth";
import { Badge } from "@mui/material";
import useNotification from "../hooks/notification";

const NavigationComponent = () => {
  const { notificationCount } = useNotification();
  const { signOut } = useAuth();
  let { isSignedIn, isAdmin } = checkIfSignedIn();

  return (
    <Navbar
      className="deneme bg-primary bg-opacity-10 sticky-top"
      
      style={{ width: "100%", maxHeight: "10%" }}
    >
      <Container fluid>
        <Row className="w-100 h-10 align-items-center">
          <Col className="justify-content-center align-self-center">
            <Navbar.Brand href="/" className="logo-container">
              <img
                src="/images/mainlogo.jpg"
                alt="Golden8-lg"
                border="0"
                style={{ width: "4em" }}
                className="m-auto Sirv image-main"
              />
            </Navbar.Brand>
          </Col>
          <Col className="">
            <Navbar.Collapse className="justify-content-end">
              <Nav>
                {isSignedIn === true && (
                    <Nav.Link title="Notifications" className="trialbtn pad-icons" href="/notifications" >
                      <Badge
                        badgeContent={notificationCount}
                        style={{ fontSize: 30 }}
                        color="error"
                        max={100}
                      >
                        <FaBell className="m-auto" style={{ width: "2rem", height: "2rem"}}/>
                      </Badge>
                    </Nav.Link>
                )}
                {isSignedIn === true && (
                  <Dropdown title="Profile">
                    <Dropdown.Toggle className="trialbtn pad-icons">
                      <FaUserCircle className="m-auto" style={{ width: "2rem", height: "2rem"}} />
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="dropdown-menu dropdown-menu-end">
                      {!isAdmin && (
                        <>
                          <Dropdown.Item
                            href="/myprofile"
                            className="nav-links "
                          >
                            My Profile
                          </Dropdown.Item>
                          <Dropdown.Item
                            href="/updateaccount"
                            className="nav-links"
                          >
                            Update Profile
                          </Dropdown.Item>
                        </>
                      )}
                      {isAdmin === true && (
                        <>
                          <Dropdown.Item
                            href="/adminusers"
                            className="nav-links "
                          >
                            Admin Dashboard
                          </Dropdown.Item>
                        </>
                      )}
                      <Dropdown.Item
                        href="/changepassword"
                        className="nav-links"
                      >
                        Change Password
                      </Dropdown.Item>
                      <Dropdown.Item
                        href="/"
                        className="nav-links"
                        onClick={() => signOut()}
                      >
                        Signout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
                <Dropdown title="Menu">
                  <Dropdown.Toggle className="trialbtn pad-icons">
                    <IoMenu className="m-auto" style={{ width: "2rem", height: "2rem"}}/>
                  </Dropdown.Toggle>
                  <Dropdown.Menu className="dropdown-menu dropdown-menu-end">
                    <>
                      <Dropdown.Item href="/about" className="nav-links ">
                        About Us
                      </Dropdown.Item>
                      <Dropdown.Item href="/rooms" className="nav-links">
                        Our Rooms
                      </Dropdown.Item>
                      <Dropdown.Item href="/amenities" className="nav-links">
                        Our Amenities
                      </Dropdown.Item>
                      <Dropdown.Item href="/activities" className="nav-links">
                        Activities
                      </Dropdown.Item>
                      {isSignedIn === true && (
                        <>
                          <Dropdown.Item
                            href="/photoshome"
                            className="nav-links "
                          >
                            Update Photos
                          </Dropdown.Item>
                        </>
                      )}
                    </>
                    <>
                      <Dropdown.Item href="/contact" className="nav-links ">
                        Contact Us
                      </Dropdown.Item>
                    </>
                  </Dropdown.Menu>
                </Dropdown>
              </Nav>
            </Navbar.Collapse>
          </Col>
        </Row>
      </Container>
    </Navbar>
  );
};
export default NavigationComponent;
