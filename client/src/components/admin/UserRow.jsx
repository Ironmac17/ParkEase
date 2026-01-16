const UserRow = ({ user, onToggle }) => {
  return (
    <div className="grid grid-cols-4 text-sm py-2 border-b">
      <div>{user.email}</div>
      <div>{user.role}</div>
      <div>{user.isBlocked ? "Blocked" : "Active"}</div>
      <button
        onClick={() => onToggle(user)}
        className="text-blue-600"
      >
        {user.isBlocked ? "Unblock" : "Block"}
      </button>
    </div>
  );
};

export default UserRow;
