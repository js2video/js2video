import { Modal } from "./modal";
import { useApp } from "./context";

const ProfileButton = () => {
  const { user, isLoadingUser, logout } = useApp();

  if (!user || isLoadingUser) {
    return;
  }

  return (
    <Modal>
      <div className="flex flex-col gap-6">
        <div className="font-bold text-2xl">Profile</div>
        <div>Logged in as {user.email}</div>
        <div
          style={{
            display: "grid",
            gap: "1rem",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          }}
        >
          {user.apiKeys.map((key) => (
            <div key={key.id}>
              <strong>{key.description}</strong>
              <div>{key.key}</div>
            </div>
          ))}
        </div>
        <div>
          <button
            className="bg-white text-black px-4 py-2"
            onClick={(e) => {
              if (confirm(`Log out ${user.email}?`)) {
                logout({
                  logoutParams: { returnTo: window.location.origin },
                });
              }
            }}
          >
            Sign out
          </button>
        </div>
      </div>
      <button>
        <img src={user.picture} className="h-7 rounded-full" />
      </button>
    </Modal>
  );
};

export { ProfileButton };
