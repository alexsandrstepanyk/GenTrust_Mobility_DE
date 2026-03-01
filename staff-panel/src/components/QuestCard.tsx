import React, { useState } from 'react';
import './QuestCard.css';

export default function QuestCard({ quest, onApprove, onReject }: { quest: any; onApprove: () => void; onReject: (reason: string) => void }) {
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleRejectSubmit = () => {
    if (rejectReason.trim()) {
      onReject(rejectReason);
      setRejectReason('');
      setShowRejectForm(false);
    }
  };

  return (
    <div className="quest-card">
      <div className="quest-header">
        <h3>{quest.title}</h3>
        <span className={`status ${quest.status.toLowerCase()}`}>
          {quest.status}
        </span>
      </div>

      <div className="quest-info">
        <p><strong>Student:</strong> {quest.scout?.name || 'Unknown'}</p>
        <p><strong>Task Type:</strong> {quest.type}</p>
        <p><strong>Budget:</strong> ₴{quest.budget}</p>
        <p><strong>Description:</strong> {quest.description}</p>
        {quest.location && <p><strong>Location:</strong> {quest.location}</p>}
      </div>

      {quest.submissionDetails && (
        <div className="submission-details">
          <h4>📤 Submission Details</h4>
          <p>{quest.submissionDetails}</p>
          {quest.submissionPhotoUrl && (
            <img src={quest.submissionPhotoUrl} alt="Submission" className="submission-photo" />
          )}
        </div>
      )}

      <div className="quest-actions">
        <button 
          className="btn btn-approve"
          onClick={onApprove}
        >
          ✅ Approve & Pay
        </button>

        {!showRejectForm ? (
          <button 
            className="btn btn-reject"
            onClick={() => setShowRejectForm(true)}
          >
            ❌ Reject
          </button>
        ) : (
          <div className="reject-form">
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              rows={3}
            />
            <div className="reject-actions">
              <button 
                className="btn btn-confirm"
                onClick={handleRejectSubmit}
              >
                Confirm
              </button>
              <button 
                className="btn btn-cancel"
                onClick={() => setShowRejectForm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
