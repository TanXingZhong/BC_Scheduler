require("dotenv").config();

//MySQL connection pool
const pool = require("../config/db_pool").pool;

//Get ID for default permanent role "user"
async function findDefaultRoleId() {
  const query = "SELECT id FROM roles WHERE role_name = 'User'"; // Wrap 'User' in single quotes

  try {
    const [rows] = await pool.execute(query); // rows will be an array of result rows
    if (rows.length > 0) {
      return rows[0].id; // Return the id of the role if found
    } else {
      throw new Error("Default role 'User' not found");
    }
  } catch (err) {
    throw new Error(`Error fetching default role ID: ${err.message}`);
  }
}

//Get all roles from SQL
async function getAllRoles() {
  const query = `
  SELECT r.id AS id, r.role_name, COUNT(u.id) AS user_count, GROUP_CONCAT(u.name) AS user_names
  FROM roles r
  LEFT JOIN users u ON u.role_id = r.id
  GROUP BY r.id, r.role_name
  `;
  try {
    // Execute query using promise pool
    const [rows, fields] = await pool.execute(query);

    // log the result to inspect
    console.log("Database query result for all roles:", rows);

    return rows; // Returns the rows (user data)
  } catch (err) {
    throw new Error(err);
  }
}

async function addRole(role_name) {
  const query = "INSERT INTO roles (role_name) VALUES (?)";
  const values = [role_name];

  try {
    const [result] = await pool.execute(query, values);
    console.log("New role added successfully", result);
    return result;
  } catch (err) {
    console.error("Error adding new role:", err);
    throw new Error(err);
  }
}

async function getRoleByRoleName(role_name) {
  const query = "SELECT * FROM roles WHERE role_name = ?";
  const values = [role_name];

  try {
    // Execute query using promise pool
    const [rows, fields] = await pool.execute(query, values);

    return rows; // Returns the rows (user data)
  } catch (error) {
    console.error("Error getting role:", error);
    throw new Error("Error fetching role.");
  }
}

async function checkRoleExistById(id) {
  const query = "SELECT * FROM roles WHERE id = ?";
  const values = [id];

  try {
    // Execute query using promise pool
    const [rows] = await pool.execute(query, values);
    return rows.length > 0;
  } catch (error) {
    console.error("Error getting role:", error);
    throw new Error("Error fetching role.");
  }
}

async function checkRoleExist(role_name) {
  const role = await getRoleByRoleName(role_name);
  return role.length > 0;
}

async function updateRole(data) {
  const query = "UPDATE roles SET role_name = ? WHERE id = ?";
  const values = [data.role_name, data.id];
  try {
    const [result] = await pool.execute(query, values);
    console.log("Role updated successfully", result);
    return result;
  } catch (err) {
    console.error("Error updating role:", err);
    throw new Error(err);
  }
}

async function deleteRole(role_name) {
  const query = "DELETE FROM roles WHERE role_name = ?";
  const values = [role_name];

  try {
    const [result] = await pool.execute(query, values);
    console.log("Role deleted successfully", result);
    return result;
  } catch (err) {
    console.error("Error deleting role:", err);
    throw new Error(err);
  }
}

module.exports = {
  addRole,
  updateRole,
  getAllRoles,
  deleteRole,
  getRoleByRoleName,
  checkRoleExist,
  findDefaultRoleId,
  checkRoleExistById,
};