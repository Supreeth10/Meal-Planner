import { useEffect, useState } from "react";
import axios from "axios";
import { Card } from "react-bootstrap";
import { SERVER_URL } from "./Config";
import { URLS } from "./ConstantsPaths";
import TableComponent from "ui_components/TableComponent";

export const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
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

  const headers=['ID', 'Recipe Name', 'Diet Type', 'Cuisine', 'Description'];
  const rows = recipes.map((recipe) => [recipe.id, recipe.recipeName, recipe.dietType, recipe.cuisine, recipe.description]);

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Recipes</Card.Title>
        <TableComponent headers={headers} rows={rows} />
      </Card.Body>
    </Card>
  );
};
