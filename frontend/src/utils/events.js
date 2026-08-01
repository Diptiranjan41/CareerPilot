// Event bus for cross-component communication
export const ProfileEvents = {
  PROFILE_UPDATED: 'profile-updated',
  AVATAR_UPDATED: 'avatar-updated',
  
  emitProfileUpdated() {
    window.dispatchEvent(new CustomEvent(this.PROFILE_UPDATED, { detail: { timestamp: Date.now() } }));
  },
  
  emitAvatarUpdated(avatarUrl) {
    window.dispatchEvent(new CustomEvent(this.AVATAR_UPDATED, { detail: { avatarUrl, timestamp: Date.now() } }));
  },
  
  onProfileUpdated(callback) {
    window.addEventListener(this.PROFILE_UPDATED, callback);
    return () => window.removeEventListener(this.PROFILE_UPDATED, callback);
  },
  
  onAvatarUpdated(callback) {
    window.addEventListener(this.AVATAR_UPDATED, callback);
    return () => window.removeEventListener(this.AVATAR_UPDATED, callback);
  }
};