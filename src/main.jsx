import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
import { CookiesProvider } from "react-cookie";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient({});
import { UserProvider } from "./Pages/CustomHook/useUser.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <CookiesProvider>
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <App />
      </UserProvider>
    </QueryClientProvider>
  </CookiesProvider>
);
