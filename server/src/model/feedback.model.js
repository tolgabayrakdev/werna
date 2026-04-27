export class Feedback {
  constructor({ id, linkId, businessId, customerEmail, type, message, isVerified, createdAt }) {
    this.id = id;
    this.linkId = linkId;
    this.businessId = businessId;
    this.customerEmail = customerEmail;
    this.type = type;
    this.message = message;
    this.isVerified = isVerified;
    this.createdAt = createdAt;
  }
}
