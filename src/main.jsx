import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import App from "./App.jsx";
import { apolloClient } from "./apollo/client.js";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CustomerAuthProvider } from "./context/CustomerAuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ApolloProvider client={apolloClient}>
        <ThemeProvider>
          <AuthProvider>
            <CustomerAuthProvider>
              <CartProvider>
                <App />
                <ToastContainer position="top-right" theme="colored" autoClose={3500} />
              </CartProvider>
            </CustomerAuthProvider>
          </AuthProvider>
        </ThemeProvider>
      </ApolloProvider>
    </BrowserRouter>
  </React.StrictMode>
);
