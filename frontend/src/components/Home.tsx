import "../Dashboard.css";
import myImage from "../assets/Mealplanner_img1.webp";

export default function Home() {
  return (
    <div>
      <Title />
      <DashboardImage />
      <Welcome />
    </div>
  );
}

export function Title() {
  return <h1>Meal-Planner</h1>;
}

export function DashboardImage() {
  return (
    <div>
      <img className="img" src={myImage} alt="myImage" />
    </div>
  );
}
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
