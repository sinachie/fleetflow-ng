const Subscription = require('../models/Subscription');

const checkPlan = (requiredPlans) => {
  return async (req, res, next) => {
    try {
      const subscription = await Subscription.findOne({ 
        user: req.user._id, 
        status: 'active' 
      });

      if (!subscription) {
        return res.status(403).json({ message: 'No active subscription. Please upgrade.' });
      }

      if (!requiredPlans.includes(subscription.plan)) {
        return res.status(403).json({ 
          message: `Your ${subscription.plan} plan does not include this feature. Please upgrade.` 
        });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};

module.exports = { checkPlan };