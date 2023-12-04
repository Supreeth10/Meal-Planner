import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "react-bootstrap";
import { SERVER_URL } from "../configuration/Config";
import { URLS } from "./ConstantsPaths";
import TableComponent from "../ui_components/TableComponent";

/**
 * Component for displaying a list of recipes.
 */
export const Recipes = () => {
  // State to store the list of recipes
  const [recipes, setRecipes] = useState([]);

  // Effect hook to fetch recipes when the component mounts
  useEffect(() => {
    const getRecipes = async () => {
      /* Note that using Axios here rather than built-in Fetch causes a bit of code bloat
       * It used to be a HUGE problem, because Axios itself is huge
       * Vite, however, contains modern tree shaking (removing unused parts)
       * So if you try swapping in our project, you'll find we only save 6 kilobytes
       */
      const recipes = await axios.get(SERVER_URL + URLS.RECIPES);

      setRecipes(await recipes.data);
    };
    void getRecipes();
  }, []);

  // Headers for the table component
  const headers = ["ID", "Recipe Name", "Diet Type", "Cuisine", "Description"];

  // Rows for the table component based on the recipes data
  const rows = recipes.map((recipe) => [
    recipe.id,
    recipe.recipeName,
    recipe.dietType,
    recipe.cuisine,
    recipe.description,
  ]);

  // Render a card with the table component displaying the list of recipes
  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Recipes</Card.Title>
        <TableComponent headers={headers} rows={rows} />
      </Card.Body>
    </Card>
  );
};
