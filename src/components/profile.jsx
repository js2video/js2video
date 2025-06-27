import { useAuth0 } from "@auth0/auth0-react";
import { Loader2Icon } from "lucide-react";

const LoggedIn = ({ user }) => {
  const { logout } = useAuth0();
  return (
    <button
      onClick={(e) => {
        if (confirm(`Log out ${user.email}?`)) {
          logout({
            logoutParams: { returnTo: window.location.origin },
          });
        }
      }}
    >
      <img src={user.picture} className="h-7 rounded-full" />
    </button>
  );
};

const NotLoggedIn = () => {
  const { loginWithPopup } = useAuth0();
  return (
    <button
      onClick={() =>
        loginWithPopup({
          authorizationParams: {
            screen_hint: "signup",
          },
        })
      }
    >
      Sign Up
    </button>
  );
};

const Profile = () => {
  const { user, isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <Loader2Icon className="animate-spin h-7" strokeWidth={1} />;
  }

  if (isAuthenticated) {
    return <LoggedIn user={user} />;
  }

  return <NotLoggedIn />;
};

export { Profile };
