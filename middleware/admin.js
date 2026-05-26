const {STATUS, ROLES } = require('../constants');

const isAdmin = (req, res, next) => {
    if (req.user.role !== ROLES.ADMIN) {
        return res.status(STATUS.FORBIDDEN).json({ message: 'Admin access required' });
    }
    next();
}

module.exports = isAdmin;