import { Link, Route, Routes } from "react-router-dom";
import { MealPlanForm } from "./DeleteMealPlan";
import { Recipes } from "./Recipe";
import { Users } from "./User";
import Button from "react-bootstrap/Button";
import "../Dashboard.css";
import { MealPlanForUser } from "./MealPlanAllUsers";
import { MealPlanForDay } from "./MealPlanDay";
import { ShoppingList } from "./ShoppingList";
import { PostMealPlanForm } from "./PostMealPlan";
import { Container, Nav, Navbar, NavDropdown } from "react-bootstrap";
import Cookies from "js-Cookie";
import { URLS } from "./ConstantsPaths";

export function NavMain() {
  return (
    <>
      <PublicLinksView />
      <NavRoutes />
    </>
  );
}

function PublicLinksView() {
  const isUserLoggedIn = Cookies.get("user_id");
  return (
    <Navbar fixed="top" bg="light" expand="lg">
      <Container>
        <Navbar.Brand>
          <Link to={URLS.HOME}>Home</Link>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">{getNavLinks()}</Nav>
          <Nav>
            {isUserLoggedIn ? (
              <Button variant="outline-primary" onClick={LogOutFunc}>
                Logout
              </Button>
            ) : (
              <Button variant="outline-primary" onClick={LoginFunc}>
                Login
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

function NavRoutes() {
  return (
    <Routes>
      <Route path={URLS.USERS} element={<Users />} />
      <Route path={URLS.RECIPES} element={<Recipes />} />
      <Route path={URLS.ALL_MEAL_PLANS} element={<MealPlanForUser />} />
      <Route path={URLS.DAY_MEAL_PLANS} element={<MealPlanForDay />} />
      <Route path={URLS.DELETE_MEAL_PLAN} element={<MealPlanForm />} />
      <Route path={URLS.POST_MEAL_PLAN} element={<PostMealPlanForm />} />
      <Route path={URLS.SHOPPING_LIST} element={<ShoppingList />} />
    </Routes>
  );
}

function LoginFunc() {
  window.location.href = URLS.LOGIN;
}

function LogOutFunc() {
  window.location.href = URLS.LOGOUT;
}

function getNavLinks() {
  return (
    <>
      <Nav.Link>
        <Link to={URLS.USERS}>Users</Link>
      </Nav.Link>
      <Nav.Link>
        <Link to={URLS.RECIPES}>Recipes</Link>
      </Nav.Link>
      <Nav.Link>
        <Link to={URLS.SHOPPING_LIST}>Shopping List</Link>
      </Nav.Link>
      <NavDropdown title="MealPlans" id="basic-nav-dropdown">
        {getDropdownMealPlanLinks()}
      </NavDropdown>
    </>
  );
}

function getDropdownMealPlanLinks() {
  return (
    <>
      <NavDropdown.Item>
        <Link to={URLS.ALL_MEAL_PLANS}>List all MealPlan</Link>
      </NavDropdown.Item>
      <NavDropdown.Item>
        <Link to={URLS.DAY_MEAL_PLANS}>List MealPlan by day</Link>
      </NavDropdown.Item>
      <NavDropdown.Item>
        <Link to={URLS.DELETE_MEAL_PLAN}>Delete Meal Plan</Link>
      </NavDropdown.Item>
      <NavDropdown.Item>
        <Link to={URLS.POST_MEAL_PLAN}>Add Meal Plan</Link>
      </NavDropdown.Item>
    </>
  );
}
