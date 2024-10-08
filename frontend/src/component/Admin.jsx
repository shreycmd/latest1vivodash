import React, { useEffect, useState } from "react";

const Admin = () => {
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    Mail: "",
    password: "",
    role: "user",
  });
  const [editingUser, setEditingUser] = useState(null);

  // Get the logged-in user's role from localStorage
  const userRole = localStorage.getItem("role");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const result = await fetch("http://localhost:3000/Admin");
        const res = await result.json();
        setUsers(res.data);
      } catch (error) {
        setErr(error.message);
      }
    };
    fetchAll();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUser({ ...newUser, [name]: value });
  };

  const addUser = async () => {
    try {
      if (userRole !== "admin") {
        setErr("Only admins can add users.");
        return;
      }
      const response = await fetch("http://localhost:3000/Admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });
      const res = await response.json();
      if (response.ok) {
        setUsers([...users, res.data]);
        setNewUser({ Mail: "", password: "", role: "user" });
      } else {
        setErr(res.message);
      }
    } catch (error) {
      setErr(error.message);
    }
  };

  const updateUserRole = async (Mail, role) => {
    if (userRole !== "admin") {
      setErr("Only admins can update roles.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/Admin/${Mail}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });
      const res = await response.json();
      if (response.ok) {
        setUsers(users.map((user) => (user.Mail === Mail ? res.data : user)));
        setEditingUser(null);
      } else {
        setErr(res.message);
      }
    } catch (error) {
      setErr(error.message);
    }
  };

  const deleteUser = async (Mail) => {
    if (userRole !== "admin") {
      setErr("Only admins can delete users.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:3000/Admin/${Mail}`, {
        method: "DELETE",
      });
      const res = await response.json();
      if (response.ok) {
        setUsers(users.filter((user) => user.Mail !== Mail));
      } else {
        setErr(res.message);
      }
    } catch (error) {
      setErr(error.message);
    }
  };

  return (
    <div className="p-4">
      {err && <div className="text-red-500">Error: {err}</div>}
      {userRole === "admin" && (
        <div className="mb-4">
          <h2 className="text-lg font-bold mb-2">Add New User</h2>
          <input
            type="email"
            name="Mail"
            placeholder="Email"
            value={newUser.Mail}
            onChange={handleInputChange}
            className="border p-2 rounded mr-2"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={newUser.password}
            onChange={handleInputChange}
            className="border p-2 rounded mr-2"
          />
          <select
            name="role"
            value={newUser.role}
            onChange={handleInputChange}
            className="border p-2 rounded mr-2"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button
            onClick={addUser}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Add User
          </button>
        </div>
      )}

      {/* Only show the table if the user is an admin */}
      {userRole === "admin" && (
        <table className="min-w-full table-auto border-collapse shadow-lg bg-white rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-800 text-white">
              <th className="py-3 px-4 text-left">Mail</th>
              <th className="py-3 px-4 text-left">Password</th>
              <th className="py-3 px-4 text-left">Role</th>
              <th className="py-3 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={index} className="border-b">
                <td className="py-3 px-4">{user.Mail}</td>
                <td className="py-3 px-4">{user.password}</td>
                <td className="py-3 px-4">
                  {editingUser === user.Mail ? (
                    <select
                      value={user.role}
                      onChange={(e) =>
                        updateUserRole(user.Mail, e.target.value)
                      }
                      className="border p-2 rounded"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td className="py-3 px-4">
                  {editingUser === user.Mail ? (
                    <button
                      className="bg-gray-500 text-white px-4 py-2 rounded"
                      onClick={() => setEditingUser(null)}
                    >
                      Cancel
                    </button>
                  ) : (
                    userRole === "admin" && (
                      <>
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                          onClick={() => setEditingUser(user.Mail)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded"
                          onClick={() => deleteUser(user.Mail)}
                        >
                          Delete
                        </button>
                      </>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Admin;
