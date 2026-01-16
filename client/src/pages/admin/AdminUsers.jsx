import { useEffect, useState } from "react";
import {
  getAllUsers,
  blockUser,
  unblockUser
} from "../../api/admin";
import UserRow from "../../components/admin/UserRow";
import { exportToCSV } from "../../utils/exportCsv";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const res = await getAllUsers();
    setUsers(res.data.users);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const toggleUser = async (user) => {
    if (user.isBlocked) {
      await unblockUser(user._id);
    } else {
      await blockUser(user._id);
    }
    loadUsers();
  };

  const handleExport = () => {
    const rows = users.map(u => ({
      email: u.email,
      role: u.role,
      status: u.isBlocked ? "Blocked" : "Active",
      createdAt: new Date(u.createdAt).toLocaleString()
    }));

    exportToCSV(rows, "users.csv");
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Users</h2>

        <button
          onClick={handleExport}
          className="bg-black text-white px-4 py-2 rounded text-sm"
        >
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="grid grid-cols-4 text-xs text-gray-500 mb-2">
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
          <div>Action</div>
        </div>

        {users.map(u => (
          <UserRow
            key={u._id}
            user={u}
            onToggle={toggleUser}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
