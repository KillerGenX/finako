const usersModel = require('../models/usersModel');

exports.getOrganizationMembers = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const members = await usersModel.getOrganizationMembers(organizationId);
    res.json(members);
  } catch (err) {
    next(err);
  }
};

exports.getMemberById = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { userId } = req.params;
    const member = await usersModel.getMemberById(userId, organizationId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json(member);
  } catch (err) {
    next(err);
  }
};

exports.createMember = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { email, password, role = 'staff', full_name } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }
    
    const memberData = {
      email,
      password,
      full_name,
      role,
      organization_id: organizationId
    };
    
    const result = await usersModel.createMember(memberData);
    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: result
    });
  } catch (err) {
    next(err);
  }
};

exports.updateMemberRole = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!role) {
      return res.status(400).json({ error: 'Role is required' });
    }
    
    const member = await usersModel.updateMemberRole(userId, organizationId, role);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({
      success: true,
      message: 'Member role updated successfully',
      data: member
    });
  } catch (err) {
    next(err);
  }
};

exports.removeMember = async (req, res, next) => {
  try {
    const organizationId = req.organizationId;
    const { userId } = req.params;
    const requesterId = req.userId;
    
    // Prevent self-removal of owner
    if (userId === requesterId) {
      return res.status(400).json({ 
        error: 'You cannot remove yourself from the organization' 
      });
    }
    
    const result = await usersModel.removeMember(userId, organizationId);
    if (!result) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (err) {
    next(err);
  }
};
