export class Business {
  constructor({ id, name, email, password, isActive, isVerified, createdAt, updatedAt }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.isActive = isActive;
    this.isVerified = isVerified;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
