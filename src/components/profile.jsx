import { Loader2Icon } from "lucide-react";
import { ProfileButton } from "./profile-button";
import { useApp } from "./context";

const LoggedIn = () => {
  return <ProfileButton />;
};

const NotLoggedIn = () => {
  const { login } = useApp();
  return <button onClick={login}>Sign Up</button>;
};

const Profile = () => {
  const { user, isLoadingUser } = useApp();

  if (isLoadingUser) {
    return <Loader2Icon className="animate-spin h-7" strokeWidth={1} />;
  }

  if (user) {
    return <LoggedIn />;
  }

  return <NotLoggedIn />;
};

export { Profile };
