class AdminController {
    dashboard(req, res, next) {
        if (req.user) {
            return res.render('admin/dashboard', {user: req.user});
        }
        next();
    }
}

module.exports = AdminController;