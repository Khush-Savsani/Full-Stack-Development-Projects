// Test file for the main App component
// Uses React Testing Library for component testing
import { render, screen } from "@testing-library/react";
import App from "./App";

// Test case to verify that the App component renders correctly
// This is a basic smoke test to ensure the component doesn't crash
test("renders learn react link", () => {
  // Render the App component in a test environment
  render(<App />);
  // Look for text containing "learn react" (case insensitive)
  const linkElement = screen.getByText(/learn react/i);
  // Assert that the element is present in the document
  expect(linkElement).toBeInTheDocument();
});
