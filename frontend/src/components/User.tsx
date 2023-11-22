import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-Cookie";
import { Card, Table } from "react-bootstrap";
import { SERVER_URL } from "./Config";
import { URLS } from "./ConstantsPaths";
import { getUserFromCookies, validateUserID } from "./UserAuthentication";

export const Users = () => {
  const [users, setUsers] = useState([]);
  // Get user ID from cookies
  const userID = getUserFromCookies();
  validateUserID();
  useEffect(() => {
    const getUsers = async () => {
      console.log("User ID: " + userID.toString());
      /* Note that using Axios here rather than built-in Fetch causes a bit of code bloat
       * It used to be a HUGE problem, because Axios itself is huge
       * Vite, however, contains modern tree shaking (removing unused parts)
       * So if you try swapping in our project, you'll find we only save 6 kilobytes
       */
      const users = await axios.get(SERVER_URL + URLS.USER + userID.toString());

      setUsers(await users.data);
    };
    void getUsers();
  }, [userID]);

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>User Details</Card.Title>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};
