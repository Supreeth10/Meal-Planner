import { useEffect, useState } from "react";
import axios from "axios";
import { Card, Table } from "react-bootstrap";
import { SERVER_URL } from "./Config";
import { URLS } from "./ConstantsPaths";

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

  return (
    <Card className="mt-3">
      <Card.Body>
        <Card.Title>Recipes</Card.Title>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Recipe ID</th>
              <th>Recipe Name</th>
              <th>Diet Type</th>
              <th>Cuisine</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {recipes.map((recipe) => (
              <tr key={recipe.id}>
                <td>{recipe.id}</td>
                <td>{recipe.recipeName}</td>
                <td>{recipe.dietType}</td>
                <td>{recipe.cuisine}</td>
                <td>{recipe.description}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};
