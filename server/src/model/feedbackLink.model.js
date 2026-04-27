export class FeedbackLink {
  constructor({ id, businessId, name, slug, isActive, createdAt }) {
    this.id = id;
    this.businessId = businessId;
    this.name = name;
    this.slug = slug;
    this.isActive = isActive;
    this.createdAt = createdAt;
  }
}
