// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json";
import { MantineProvider } from "@mantine/core";
import { Notifications } from '@mantine/notifications'; 
import '@mantine/notifications/styles.css';
import ErrorBoundary from './components/ErrorBoundary'; 

Amplify.configure(outputs);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="dark" >
      <ErrorBoundary>  
        <Notifications position="top-right" zIndex={1000} /> 
        <App />
      </ErrorBoundary> 
    </MantineProvider>
  </React.StrictMode>
);
