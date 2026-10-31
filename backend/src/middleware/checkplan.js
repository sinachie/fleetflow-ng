const Subscription = require('../models/Subscription');

const checkPlan = (requiredPlans) => {
  return async (req, res, next) => {
    try {
      // 1. Find the active subscription for the logged-in user
      const subscription = await Subscription.findOne({ 
        user: req.user._id, 
        status: 'active' 
      });

      if (!subscription) {
        return res.status(403).json({ message: 'No active subscription. Please upgrade.' });
      }

      // 2. Check if their plan matches the required plan
      if (!requiredPlans.includes(subscription.plan)) {
        return res.status(403).json({ 
          message: `Your ${subscription.plan} plan does not include this feature. Please upgrade.` 
        });
      }

      // 3. If they pass, let them through
      next();
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
};

module.exports = { checkPlan };