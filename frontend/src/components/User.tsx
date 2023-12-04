import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "react-bootstrap";
import { SERVER_URL } from "../configuration/Config";
import { URLS } from "./ConstantsPaths";
import {
  getUserFromCookies,
  validateUserID,
} from "../authentication/UserAuthentication";
import TableComponent from "../ui_components/TableComponent";

/**
 * Component for displaying user details.
 */
export const Users = () => {
  // State to store user details
  const [users, setUsers] = useState([]);

  // Headers for the table component
  const headers = ["Name", "Email"];

  // Rows for the table component based on the user details
  const rows = users.map((user) => [user.name, user.email]);

  // Get user ID from cookies abd validate the user ID
  const userID = getUserFromCookies();
  validateUserID();

  // Effect hook to fetch user details when the component mounts or the user ID changes
  useEffect(() => {
    const getUsers = async () => {
      console.log("User ID: " + userID.toString());
      /* Note that using Axios here rather than built-in Fetch causes a bit of code bloat
       * It used to be a HUGE problem, because Axios itself is huge
       * Vite, however, contains modern tree shaking (removing unused parts)
       * So if you try swapping in our project, you'll find we only save 6 kilobytes
       */
      const users = await axios.get(SERVER_URL + URLS.USER + userID.toString());

      // Set the user details data in the state
      setUsers(await users.data);
    };
    void getUsers();
  }, [userID]);

  // Render a card with the table component displaying user details
  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>User Details</Card.Title>
        <TableComponent headers={headers} rows={rows} />
      </Card.Body>
    </Card>
  );
};
