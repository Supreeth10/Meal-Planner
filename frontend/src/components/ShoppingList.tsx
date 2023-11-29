import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "react-bootstrap";
import { SERVER_URL } from "./Config";
import { URLS } from "./ConstantsPaths";
import { getUserFromCookies, validateUserID } from "./UserAuthentication";
import TableComponent from "../ui_components/TableComponent";

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
        <TableComponent
          headers={['Ingredient']}
          rows={shoppinglist.map(item => [item.ing.ingName])}
        />
      </Card.Body>
    </Card>
  );
};
