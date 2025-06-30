import { createContext, useContext, useEffect, useState } from "react";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";

/** Create your app-specific context */
const AppContext = createContext(null);

/** Your app-specific provider */
function RootProvider({ children }) {
  const {
    user,
    isLoading: isLoadingAuth0Auth,
    getAccessTokenSilently,
    logout,
    loginWithPopup,
  } = useAuth0();
  const [dbUser, setDbUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    async function load() {
      setDbUser(null);
      setIsLoadingUser(true);
      if (isLoadingAuth0Auth) {
        return;
      }
      if (!user) {
        setIsLoadingUser(false);
      }
      try {
        const token = await getAccessTokenSilently();
        const { data, error } = await fetch("/api/user", {
          headers: {
            "content-type": "application/json",
            authorization: `Bearer ${token}`,
          },
        }).then((res) => res.json());
        if (error) {
          throw error;
        }
        if (!data) {
          throw "No user in data";
        }
        setDbUser(data);
      } catch (err) {
        console.log(err);
      } finally {
        setIsLoadingUser(false);
      }
    }
    load();
  }, [user, isLoadingAuth0Auth]);

  const login = () =>
    loginWithPopup({
      authorizationParams: {
        screen_hint: "signup",
      },
    });

  const getAccessToken = () => getAccessTokenSilently();

  console.log(dbUser);

  return (
    <AppContext.Provider
      value={{ user: dbUser, isLoadingUser, login, logout, getAccessToken }}
    >
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
