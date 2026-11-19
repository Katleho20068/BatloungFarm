
const dashboardModel = require('../models/dashboardModel');

const getDashboardStats = async (req, res) => {
    try {
        const stats = await dashboardModel.getDashboardStats();

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Dashboard error:', error.message);

        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard statistics'
        });
    }
};

module.exports = {
    getDashboardStats
};
