const express = require('express');
const router = express.Router();
const { authenticateToken: auth } = require('../middleware/auth');
const { validateRank, validateRankUpdate, validateId, validateRankQuery } = require('../middleware/rankValidation');

const {
  getAllRanks,
  getRanksByLevel,
  getRankById,
  createRank,
  updateRank,
  deleteRank,
  getRankStatistics,
  getUsersByRank
} = require('../controllers/rankController');

// ==================== RANK ROUTES ====================

// Get all ranks
router.get('/', auth, validateRankQuery, getAllRanks);

// Get ranks by level
router.get('/level', auth, getRanksByLevel);

// Get rank statistics
router.get('/statistics', auth, getRankStatistics);

// Get rank by ID
router.get('/:id', auth, validateId, getRankById);

// Create new rank
router.post('/', auth, validateRank, createRank);

// Update rank
router.put('/:id', auth, validateId, validateRankUpdate, updateRank);

// Delete rank
router.delete('/:id', auth, validateId, deleteRank);

// Get users by rank
router.get('/:id/users', auth, validateId, getUsersByRank);

module.exports = router;
