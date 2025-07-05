const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// Middleware validateMembership sudah diterapkan di index.js untuk /api/users
router.get('/', usersController.getOrganizationMembers);
router.get('/:userId', usersController.getMemberById);
router.post('/', usersController.createMember);
router.put('/:userId/role', usersController.updateMemberRole);
router.delete('/:userId', usersController.removeMember);

module.exports = router;
