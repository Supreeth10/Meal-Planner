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
 * Component for displaying the user's shopping list.
 */
export const ShoppingList = () => {
  // State to store the shopping list
  const [shoppinglist, setshoppinglist] = useState([]);

  // Get user ID from cookies and validate the user ID
  const userID = getUserFromCookies();
  validateUserID();

  // Effect hook to fetch the shopping list when the component mounts or the user ID changes
  useEffect(() => {
    const getShoppingList = async () => {
      const shoppingList = await axios.get(
        SERVER_URL + URLS.ShoppingList + userID.toString()
      );

      // Set the shopping list data in the state
      setshoppinglist(await shoppingList.data);
    };
    void getShoppingList();
  }, [userID]);

  // Render a card with the table component displaying the shopping list
  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Shopping List</Card.Title>
        <TableComponent
          headers={["Ingredient"]}
          rows={shoppinglist.map((item) => [item.ing.ingName])}
        />
      </Card.Body>
    </Card>
  );
};
