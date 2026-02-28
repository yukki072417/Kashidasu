const adminModel = require("../model/adminModel");
const { errorResponse } = require("../services/errorHandling");

async function createAdmin(req, res, next) {
  const adminData = req.body;
  if (adminData.id == undefined || adminData.password == undefined) {
    return errorResponse(res, 200);
  }

  const result = await adminModel.createAdmin(adminData.id, adminData.password);
  if (result.success == false) {
    return errorResponse(res, 500);
  }

  return res.status(200);
}

function getAdmin(req, res, next) {}

function updateAdmin(req, res, next) {}

function deleteAdmin(req, res, next) {}

module.exports = {
  createAdmin,
  getAdmin,
  updateAdmin,
  deleteAdmin,
};
