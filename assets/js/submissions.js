/**
 * Simplified Resource Submission System with Admin Approval
 */

const Submissions = {
  // Storage keys
  STORAGE_KEYS: {
    PENDING: 'resource-submissions-pending',
    APPROVED: 'resource-submissions-approved',
    REJECTED: 'resource-submissions-rejected'
  },

  // Submit new resource (user side)
  submit(data) {
    // Validate input
    const validation = Security.validateResource(data);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    // Rate limiting
    if (!Security.checkRateLimit('resource-submission', 3, 3600000)) { // 3 per hour
      return {
        success: false,
        errors: ['Too many submissions. Please wait before submitting again.']
      };
    }

    // Get pending submissions
    const pending = this.getPending();
    
    // Check for duplicates
    const isDuplicate = pending.some(s => 
      s.url === validation.sanitized.url || 
      s.title.toLowerCase() === validation.sanitized.title.toLowerCase()
    );
    
    if (isDuplicate) {
      return {
        success: false,
        errors: ['This resource has already been submitted.']
      };
    }

    // Add to pending
    pending.push(validation.sanitized);
    localStorage.setItem(this.STORAGE_KEYS.PENDING, JSON.stringify(pending));

    return {
      success: true,
      message: 'Resource submitted successfully! It will be reviewed by an admin.',
      id: validation.sanitized.id
    };
  },

  // Get pending submissions
  getPending() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.PENDING) || '[]');
  },

  // Get approved submissions
  getApproved() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.APPROVED) || '[]');
  },

  // Get rejected submissions
  getRejected() {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.REJECTED) || '[]');
  },

  // Admin: Approve submission
  approve(submissionId) {
    const pending = this.getPending();
    const submission = pending.find(s => s.id === submissionId);
    
    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    // Remove from pending
    const updatedPending = pending.filter(s => s.id !== submissionId);
    localStorage.setItem(this.STORAGE_KEYS.PENDING, JSON.stringify(updatedPending));

    // Add to approved
    const approved = this.getApproved();
    submission.status = 'approved';
    submission.approvedAt = new Date().toISOString();
    approved.push(submission);
    localStorage.setItem(this.STORAGE_KEYS.APPROVED, JSON.stringify(approved));

    return {
      success: true,
      submission: submission
    };
  },

  // Admin: Reject submission
  reject(submissionId, reason = '') {
    const pending = this.getPending();
    const submission = pending.find(s => s.id === submissionId);
    
    if (!submission) {
      return { success: false, error: 'Submission not found' };
    }

    // Remove from pending
    const updatedPending = pending.filter(s => s.id !== submissionId);
    localStorage.setItem(this.STORAGE_KEYS.PENDING, JSON.stringify(updatedPending));

    // Add to rejected
    const rejected = this.getRejected();
    submission.status = 'rejected';
    submission.rejectedAt = new Date().toISOString();
    submission.rejectionReason = reason;
    rejected.push(submission);
    localStorage.setItem(this.STORAGE_KEYS.REJECTED, JSON.stringify(rejected));

    return { success: true };
  },

  // Admin: Export approved as JSON (for adding to data files)
  exportApproved(category = null) {
    let approved = this.getApproved();
    
    if (category) {
      approved = approved.filter(s => s.category === category);
    }

    return approved.map(s => ({
      id: s.id.replace('submitted-', '').split('-')[0],
      title: s.title,
      url: s.url,
      description: s.description,
      tags: s.tags,
      votes: 0,
      addedDate: s.approvedAt || s.timestamp
    }));
  }
};



