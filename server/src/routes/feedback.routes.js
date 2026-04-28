import { Router } from 'express';
import { FeedbackController } from '../controller/feedback.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import {
  createLinkSchema,
  submitFeedbackSchema,
  verifyFeedbackSchema,
} from '../schemas/feedback.schema.js';

const router = Router();
const feedbackController = new FeedbackController();

// Public — customer side
router.get('/links/:slug/info', feedbackController.getLinkInfo);
router.post('/submit', validate(submitFeedbackSchema), feedbackController.submitFeedback);
router.post('/verify', validate(verifyFeedbackSchema), feedbackController.verifyFeedback);

// Private — business dashboard
router.use(authenticate);
router.get('/links', feedbackController.getLinks);
router.post('/links', validate(createLinkSchema), feedbackController.createLink);
router.delete('/links/:id', feedbackController.deleteLink);
router.get('/', feedbackController.getFeedbacks);
router.get('/analytics', feedbackController.getAnalytics);

export default router;
