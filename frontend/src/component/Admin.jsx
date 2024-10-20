import React, { useEffect, useState } from "react";
import useSessionStorage from "./useSessionStorage";
import fetchwithauth from "./token";

const Admin = () => {
  const [err, setErr] = useState("");
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    Mail: "",
    password: "",
    role: "admin",
  });
  const [editingUser, setEditingUser] = useState(null);
  const [editedUserData, setEditedUserData] = useState({
    Mail: "",
    password: "",
    role: "admin",
  });

  // Get the logged-in user's role from session storage
  const [role] = useSessionStorage("role");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const result = await fetchwithauth(import.meta.env.VITE_BACKEND_URL + "/Admin");
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

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUserData({ ...editedUserData, [name]: value });
  };

  const addUser = async () => {
    try {
      // Admin can only create admin accounts
      if (newUser.role !== "admin") {
        setErr("Invalid role selected.");
        return;
      }
  
      const response = await fetchwithauth(import.meta.env.VITE_BACKEND_URL + "/Admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });
  
      const res = await response.json();
      if (response.ok) {
        setUsers([...users, res.data]);
        setNewUser({ Mail: "", password: "", role: "admin" });
      } else {
        setErr(res.message);
      }
    } catch (error) {
      setErr("An error occurred while adding the user.");
    }
  };
  

  const updateUserRole = async () => {
    if (!editingUser) {
      setErr("No user is being edited.");
      return;
    }
  
    if (editedUserData.role !== "admin") {
      setErr("Invalid role change.");
      return;
    }
  
    try {
      const response = await fetchwithauth(import.meta.env.VITE_BACKEND_URL + `/Admin/${editedUserData.Mail}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedUserData),
      });
      
      const res = await response.json();
      if (response.ok) {
        setUsers(users.map((user) => (user.Mail === editedUserData.Mail ? { ...user, ...editedUserData } : user)));
        setEditingUser(null);
        setEditedUserData({ Mail: "", password: "", role: "admin" });
      } else {
        setErr(res.message);
      }
    } catch (error) {
      setErr("An error occurred while updating the user.");
    }
  };
  
  const deleteUser = async (Mail) => {
    try {
      // Find the user to be deleted
      
  
      // Make the delete request to the backend
      const response = await fetchwithauth(import.meta.env.VITE_BACKEND_URL + `/Admin/${Mail}`, {
        method: "DELETE",
      });
  
      const res = await response.json();
      if (response.ok) {
        // Remove the user from the state after successful deletion
        setUsers(users.filter((user) => user.Mail !== Mail));
      } else {
        setErr(res.message);  // Show backend error if any
      }
    } catch (error) {
      setErr("An error occurred while deleting the user.");
    }
  };
  
  

  const handleEdit = (user) => {
    setEditingUser(user.Mail);
    setEditedUserData(user); // Pre-fill the form with the user's current data
  };

  // Filter users based on the role, ensuring admin can't see "main" users
  const filteredUsers = users.filter((user) => (role === "admin" ? user.role !== "main" : true));

  return (
    <div className="p-4">
      {err && <div className="text-red-500">Error: {err}</div>}
       
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
         {role=="admin"? null:<option value="main">main</option>}
          <option value="admin">admin</option>
        </select>
        <button onClick={addUser} className="bg-green-500 text-white px-4 py-2 rounded">
          Add User
        </button>
      </div>

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
          {filteredUsers.map((user) => (
            <tr key={user.Mail} className="border-b">
              <td className="py-3 px-4">
                {editingUser === user.Mail ? (
                  <input
                    type="email"
                    name="Mail"
                    value={editedUserData.Mail}
                    onChange={handleEditInputChange} // Allow editing of email
                    className="border p-2 rounded"
                  />
                ) : (
                  user.Mail
                )}
              </td>
              <td className="py-3 px-4">
                {editingUser === user.Mail ? (
                  <input
                    type="password"
                    name="password"
                    value={editedUserData.password}
                    onChange={handleEditInputChange} // Allow editing of password
                    className="border p-2 rounded"
                  />
                ) : (
                  "********" // Hide password for display
                )}
              </td>
              <td className="py-3 px-4">
                {editingUser === user.Mail ? (
                  <select
                    name="role"
                    value={editedUserData.role}
                    onChange={handleEditInputChange}
                    className="border p-2 rounded"
                  >
                    <option value="main">main</option>
                    <option value="admin">admin</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td className="py-3 px-4">
                {editingUser === user.Mail ? (
                  <>
                    <button className="bg-green-500 text-white px-4 py-2 rounded mr-2" onClick={updateUserRole}>
                      Save
                    </button>
                    <button className="bg-gray-500 text-white px-4 py-2 rounded" onClick={() => setEditingUser(null)}>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </button>
                    <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => deleteUser(user.Mail)}>
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
