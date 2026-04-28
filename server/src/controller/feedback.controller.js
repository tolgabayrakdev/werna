import { FeedbackService } from '../service/feedback.service.js';

export class FeedbackController {
  constructor() {
    this.feedbackService = new FeedbackService();
  }

  createLink = async (req, res, next) => {
    try {
      const result = await this.feedbackService.createLink(req.user.id, req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getLinks = async (req, res, next) => {
    try {
      const links = await this.feedbackService.getLinks(req.user.id);
      res.status(200).json({ success: true, data: links });
    } catch (err) {
      next(err);
    }
  };

  getLinkInfo = async (req, res, next) => {
    try {
      const info = await this.feedbackService.getLinkInfo(req.params.slug);
      res.status(200).json({ success: true, data: info });
    } catch (err) {
      next(err);
    }
  };

  deleteLink = async (req, res, next) => {
    try {
      await this.feedbackService.deleteLink(req.user.id, req.params.id);
      res.status(200).json({ success: true, data: { message: 'Link deleted' } });
    } catch (err) {
      next(err);
    }
  };

  submitFeedback = async (req, res, next) => {
    try {
      const result = await this.feedbackService.submitFeedback(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  verifyFeedback = async (req, res, next) => {
    try {
      const result = await this.feedbackService.verifyFeedback(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getFeedbacks = async (req, res, next) => {
    try {
      const result = await this.feedbackService.getFeedbacks(req.user.id, req.query);
      res.status(200).json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  };

  getAnalytics = async (req, res, next) => {
    try {
      const analytics = await this.feedbackService.getAnalytics(req.user.id);
      res.status(200).json({ success: true, data: analytics });
    } catch (err) {
      next(err);
    }
  };
}
