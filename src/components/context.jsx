import { createContext, useContext, useState } from "react";
import { Auth0Provider } from "@auth0/auth0-react";

/** Create your app-specific context */
const AppContext = createContext(null);

/** Your app-specific provider */
function RootProvider({ children }) {
  const [state, setState] = useState({}); // put any app state here

  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  );
}

function useApp() {
  return useContext(AppContext);
}

function AppProvider({ children }) {
  return (
    <Auth0Provider
      domain="js2video.eu.auth0.com"
      // @ts-ignore
      clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <RootProvider>{children}</RootProvider>
    </Auth0Provider>
  );
}

export { AppProvider, useApp };
