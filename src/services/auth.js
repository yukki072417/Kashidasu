const { getAdminById } = require("../model/adminModel");

async function adminAuth(req, res, next) {
  if (req.session != true) {
    res.redirect("/login");
    return;
  }

  const isExist = (await getAdminById(req.session.admin)).success;
  if (isExist == true) next();
}

function renderMainPage(req, res) {
  res.render("/main");
}

module.exports = {
  adminAuth,
  renderMainPage,
};
