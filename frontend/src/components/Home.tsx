import "../Dashboard.css";
import myImage from "../assets/Mealplanner_img1.webp";

/**
 * Functional component representing the home page.
 */
export default function Home() {
  return (
    <div>
      <Title />
      <DashboardImage />
      <Welcome />
    </div>
  );
}

/**
 * Functional component representing the title of the application.
 */
export function Title() {
  return <h1>Meal-Planner</h1>;
}

/**
 * Functional component representing the dashboard image.
 * @returns The DashboardImage component.
 */
export function DashboardImage() {
  return (
    <div>
      <img className="img" src={myImage} alt="myImage" />
    </div>
  );
}

/**
 * Functional component welcoming users to the MealPlanner.
 * @returns The Welcome component.
 */
export function Welcome() {
  return (
    <div>
      <h2>Welcome to MealPlanner</h2>
      <p>
        You can plan your meals for the week as well as use the auto generated
        shoppinglist to buy groceries{" "}
      </p>
    </div>
  );
}
