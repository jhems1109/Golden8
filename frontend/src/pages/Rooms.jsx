import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import RoomCard from "../components/RoomCard";
import useAuth from "../hooks/auth";

const backend =
  import.meta.env.MODE === "development"
    ? "http://localhost:8000"
    : "https://golden8.onrender.com";

export default function Rooms() {
  const [rooms, setRooms] = useState(null);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const navigateCreateRoom = () => {
    navigate("/createroom");
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch(`${backend}/rooms`);
      const data = await response.json();
      setRooms(data.details);
    } catch (error) {
      console.error("Error fetching rooms data:", error);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);
  return (
    <>
      {isLoadingRooms ? (
        <div className="loading-overlay">
          <div>Loading rooms...</div>
          <div className="loading-spinner"></div>
        </div>
      ) : (
        <>
          <div
            style={{
              backgroundImage: "url('/images/roomsPagephoto.jpg')",
              backgroundAttachment: "fixed",
              backgroundRepeat: "no-repeat",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                paddingInline: 30,
                width: "100%",
                alignSelf: "center",
                justifyContent: "center",
                paddingTop: "2%",
              }}
            >
              <div className="d-flex justify-content-between w-100  align-items-end">
                <div className="d-flex "></div>
                <div>
                  <h1>OUR ROOMS</h1>
                </div>
                <div className="d-flex">
                  {isSignedIn && (
                    <div className="d-flex align-items-end">
                      <button
                        type="button mh-25"
                        className="btn  btn-secondary"
                        onClick={navigateCreateRoom}
                      >
                        <i className="bi bi-plus">Create Room</i>
                      </button>
                    </div>
                  )}
                  <div
                    style={{
                      width: 1,
                      marginInline: 5,
                      backgroundColor: "#666869",
                    }}
                  ></div>

                  <div></div>
                </div>
              </div>
            </div>
            <div>
              <div>
                {rooms &&
                  rooms.map((room, index) => (
                    <RoomCard
                      key={room.roomId}
                      roomName={room.roomName}
                      shortDesc={room.shortDesc}
                      description={room.description}
                      basePrice={room.basePrice}
                      maxPax={room.maxPax}
                      expanded={index === index}
                      onClick={() => {
                        navigate(`/room/${room.roomId}`);
                      }}
                    />
                  ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
