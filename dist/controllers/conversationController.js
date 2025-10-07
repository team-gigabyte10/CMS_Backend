const Conversation = require('../models/Conversation');
const User = require('../models/User');
const Message = require('../models/Message');
const { validationResult } = require('express-validator');
class ConversationController {
    // Create a new conversation
    static async createConversation(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const { type, name, participant_ids } = req.body;
            const created_by = req.user.id;
            let conversationId;
            if (type === 'direct') {
                // For direct conversations, we need exactly 2 participants
                if (!participant_ids || participant_ids.length !== 1) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Direct conversation requires exactly one other participant'
                    });
                }
                const otherUserId = participant_ids[0];
                // Check if other user exists and is active
                const otherUser = await User.findById(otherUserId);
                if (!otherUser || !otherUser.is_active) {
                    return res.status(404).json({
                        status: 'error',
                        message: 'Participant user not found or inactive'
                    });
                }
                // Create or get existing direct conversation
                conversationId = await Conversation.createDirectConversation(created_by, otherUserId);
            }
            else if (type === 'group') {
                // For group conversations, we need a name and participants
                if (!name || name.trim() === '') {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Group conversation requires a name'
                    });
                }
                if (!participant_ids || participant_ids.length === 0) {
                    return res.status(400).json({
                        status: 'error',
                        message: 'Group conversation requires at least one participant'
                    });
                }
                // Verify all participants exist and are active
                for (const userId of participant_ids) {
                    const user = await User.findById(userId);
                    if (!user || !user.is_active) {
                        return res.status(404).json({
                            status: 'error',
                            message: `Participant user with ID ${userId} not found or inactive`
                        });
                    }
                }
                // Add creator to participants
                const allParticipants = [created_by, ...participant_ids];
                conversationId = await Conversation.createGroupConversation(name, created_by, allParticipants);
            }
            else {
                return res.status(400).json({
                    status: 'error',
                    message: 'Invalid conversation type. Must be "direct" or "group"'
                });
            }
            // Get the created conversation with details
            const conversation = await Conversation.findById(conversationId);
            const participants = await conversation.getParticipants();
            // Emit real-time event to all participants
            const io = req.app.get('io');
            if (io) {
                participants.forEach(participant => {
                    io.to(`user_${participant.id}`).emit('conversation_created', {
                        conversation: {
                            id: conversation.id,
                            type: conversation.type,
                            name: conversation.name,
                            created_by: conversation.created_by,
                            created_at: conversation.created_at
                        },
                        participants: participants.map(p => ({
                            id: p.id,
                            name: p.name,
                            avatar: p.avatar,
                            status: p.status
                        }))
                    });
                });
            }
            res.status(201).json({
                status: 'success',
                message: 'Conversation created successfully',
                data: {
                    conversation: {
                        id: conversation.id,
                        type: conversation.type,
                        name: conversation.name,
                        created_by: conversation.created_by,
                        created_at: conversation.created_at
                    },
                    participants: participants.map(p => ({
                        id: p.id,
                        name: p.name,
                        avatar: p.avatar,
                        status: p.status,
                        joined_at: p.joined_at
                    }))
                }
            });
        }
        catch (error) {
            console.error('Error creating conversation:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to create conversation',
                error: error.message
            });
        }
    }
    // Get user's conversations
    static async getUserConversations(req, res) {
        try {
            const userId = req.user.id;
            const conversations = await Conversation.findByUserId(userId);
            res.json({
                status: 'success',
                data: {
                    conversations: conversations.map(conv => ({
                        id: conv.id,
                        type: conv.type,
                        name: conv.name,
                        created_by: conv.created_by,
                        created_at: conv.created_at,
                        updated_at: conv.updated_at,
                        participant_count: conv.participant_count,
                        message_count: conv.message_count,
                        last_message_at: conv.last_message_at
                    }))
                }
            });
        }
        catch (error) {
            console.error('Error getting user conversations:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get conversations',
                error: error.message
            });
        }
    }
    // Get conversation details
    static async getConversationDetails(req, res) {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Conversation not found'
                });
            }
            // Check if user is participant
            const participants = await conversation.getParticipants();
            const isParticipant = participants.some(p => p.id === userId);
            if (!isParticipant) {
                return res.status(403).json({
                    status: 'error',
                    message: 'You are not a participant in this conversation'
                });
            }
            res.json({
                status: 'success',
                data: {
                    conversation: {
                        id: conversation.id,
                        type: conversation.type,
                        name: conversation.name,
                        created_by: conversation.created_by,
                        created_at: conversation.created_at,
                        updated_at: conversation.updated_at
                    },
                    participants: participants.map(p => ({
                        id: p.id,
                        name: p.name,
                        avatar: p.avatar,
                        status: p.status,
                        rank: p.rank,
                        designation: p.designation,
                        joined_at: p.joined_at,
                        last_read_at: p.last_read_at
                    }))
                }
            });
        }
        catch (error) {
            console.error('Error getting conversation details:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get conversation details',
                error: error.message
            });
        }
    }
    // Add participant to conversation
    static async addParticipant(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const { conversationId } = req.params;
            const { user_id } = req.body;
            const currentUserId = req.user.id;
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Conversation not found'
                });
            }
            // Check if current user is participant
            const participants = await conversation.getParticipants();
            const isParticipant = participants.some(p => p.id === currentUserId);
            if (!isParticipant) {
                return res.status(403).json({
                    status: 'error',
                    message: 'You are not a participant in this conversation'
                });
            }
            // Check if user to add exists and is active
            const userToAdd = await User.findById(user_id);
            if (!userToAdd || !userToAdd.is_active) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found or inactive'
                });
            }
            // Check if user is already a participant
            const isAlreadyParticipant = participants.some(p => p.id === user_id);
            if (isAlreadyParticipant) {
                return res.status(400).json({
                    status: 'error',
                    message: 'User is already a participant in this conversation'
                });
            }
            // Add participant
            await conversation.addParticipant(user_id);
            // Get updated participants
            const updatedParticipants = await conversation.getParticipants();
            // Emit real-time event
            const io = req.app.get('io');
            if (io) {
                updatedParticipants.forEach(participant => {
                    io.to(`user_${participant.id}`).emit('participant_added', {
                        conversation_id: conversationId,
                        user: {
                            id: userToAdd.id,
                            name: userToAdd.name,
                            avatar: userToAdd.avatar,
                            status: userToAdd.status
                        }
                    });
                });
            }
            res.json({
                status: 'success',
                message: 'Participant added successfully',
                data: {
                    participant: {
                        id: userToAdd.id,
                        name: userToAdd.name,
                        avatar: userToAdd.avatar,
                        status: userToAdd.status
                    }
                }
            });
        }
        catch (error) {
            console.error('Error adding participant:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to add participant',
                error: error.message
            });
        }
    }
    // Remove participant from conversation
    static async removeParticipant(req, res) {
        try {
            const { conversationId, userId } = req.params;
            const currentUserId = req.user.id;
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Conversation not found'
                });
            }
            // Check if current user is participant
            const participants = await conversation.getParticipants();
            const isParticipant = participants.some(p => p.id === currentUserId);
            if (!isParticipant) {
                return res.status(403).json({
                    status: 'error',
                    message: 'You are not a participant in this conversation'
                });
            }
            // Check if user to remove is participant
            const userToRemove = participants.find(p => p.id === parseInt(userId));
            if (!userToRemove) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User is not a participant in this conversation'
                });
            }
            // Remove participant
            await conversation.removeParticipant(userId);
            // Emit real-time event
            const io = req.app.get('io');
            if (io) {
                participants.forEach(participant => {
                    if (participant.id !== parseInt(userId)) {
                        io.to(`user_${participant.id}`).emit('participant_removed', {
                            conversation_id: conversationId,
                            user: {
                                id: userToRemove.id,
                                name: userToRemove.name
                            }
                        });
                    }
                });
                // Notify the removed user
                io.to(`user_${userId}`).emit('removed_from_conversation', {
                    conversation_id: conversationId
                });
            }
            res.json({
                status: 'success',
                message: 'Participant removed successfully'
            });
        }
        catch (error) {
            console.error('Error removing participant:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to remove participant',
                error: error.message
            });
        }
    }
    // Update conversation
    static async updateConversation(req, res) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const { conversationId } = req.params;
            const { name } = req.body;
            const currentUserId = req.user.id;
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Conversation not found'
                });
            }
            // Check if current user is participant
            const participants = await conversation.getParticipants();
            const isParticipant = participants.some(p => p.id === currentUserId);
            if (!isParticipant) {
                return res.status(403).json({
                    status: 'error',
                    message: 'You are not a participant in this conversation'
                });
            }
            // Only group conversations can be renamed
            if (conversation.type !== 'group') {
                return res.status(400).json({
                    status: 'error',
                    message: 'Only group conversations can be renamed'
                });
            }
            // Update conversation
            await conversation.update({ name });
            // Emit real-time event
            const io = req.app.get('io');
            if (io) {
                participants.forEach(participant => {
                    io.to(`user_${participant.id}`).emit('conversation_updated', {
                        conversation_id: conversationId,
                        name,
                        updated_by: currentUserId
                    });
                });
            }
            res.json({
                status: 'success',
                message: 'Conversation updated successfully',
                data: {
                    conversation: {
                        id: conversation.id,
                        type: conversation.type,
                        name: conversation.name,
                        updated_at: conversation.updated_at
                    }
                }
            });
        }
        catch (error) {
            console.error('Error updating conversation:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to update conversation',
                error: error.message
            });
        }
    }
    // Delete conversation
    static async deleteConversation(req, res) {
        try {
            const { conversationId } = req.params;
            const currentUserId = req.user.id;
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Conversation not found'
                });
            }
            // Check if current user is the creator
            if (conversation.created_by !== currentUserId) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Only the conversation creator can delete the conversation'
                });
            }
            // Get participants before deleting
            const participants = await conversation.getParticipants();
            // Delete conversation
            await conversation.delete();
            // Emit real-time event
            const io = req.app.get('io');
            if (io) {
                participants.forEach(participant => {
                    io.to(`user_${participant.id}`).emit('conversation_deleted', {
                        conversation_id: conversationId
                    });
                });
            }
            res.json({
                status: 'success',
                message: 'Conversation deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting conversation:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to delete conversation',
                error: error.message
            });
        }
    }
    // Get conversation statistics
    static async getConversationStatistics(req, res) {
        try {
            const { conversationId } = req.params;
            const userId = req.user.id;
            const conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                return res.status(404).json({
                    status: 'error',
                    message: 'Conversation not found'
                });
            }
            // Check if user is participant
            const participants = await conversation.getParticipants();
            const isParticipant = participants.some(p => p.id === userId);
            if (!isParticipant) {
                return res.status(403).json({
                    status: 'error',
                    message: 'You are not a participant in this conversation'
                });
            }
            // Get message statistics
            const stats = await Message.getStatistics({ conversationId });
            res.json({
                status: 'success',
                data: {
                    conversation: {
                        id: conversation.id,
                        type: conversation.type,
                        name: conversation.name,
                        participant_count: participants.length
                    },
                    statistics: stats
                }
            });
        }
        catch (error) {
            console.error('Error getting conversation statistics:', error);
            res.status(500).json({
                status: 'error',
                message: 'Failed to get conversation statistics',
                error: error.message
            });
        }
    }
}
module.exports = ConversationController;
//# sourceMappingURL=conversationController.js.map