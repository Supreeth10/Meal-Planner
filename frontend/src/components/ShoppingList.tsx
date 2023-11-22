import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table } from "react-bootstrap";
import { SERVER_URL } from "./Config";
import { URLS } from "./ConstantsPaths";
import { getUserFromCookies, validateUserID } from "./UserAuthentication";

export const ShoppingList = () => {
  const [shoppinglist, setshoppinglist] = useState([]);

  // Get user ID from cookies
  const userID = getUserFromCookies();
  validateUserID();
  useEffect(() => {
    const getShoppingList = async () => {
      const shoppingList = await axios.get(
        SERVER_URL + URLS.ShoppingList + userID.toString()
      );

      setshoppinglist(await shoppingList.data);
    };
    void getShoppingList();
  }, [userID]);

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Shopping List</Card.Title>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Ingredient</th>
            </tr>
          </thead>
          <tbody>
            {shoppinglist.map((item) => (
              <tr key={item.id}>
                <td>{item.ing.ingName}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};
