import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/transcript.css';

export default function Transcript() {
  const { guildId, ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/api/guilds/${guildId}/tickets/${ticketId}/transcript`)
      .then(res => {
        setTicket(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load transcript.');
        setLoading(false);
      });
  }, [guildId, ticketId]);

  if (loading) return <div className="transcript-loading">Loading transcript...</div>;
  if (error) return <div className="transcript-error">{error}</div>;
  if (!ticket || !ticket.messages || ticket.messages.length === 0) {
    return (
      <div className="transcript-empty">
        <Link to={`/dashboard/${guildId}/tickets`} className="back-link">← Back to Tickets</Link>
        <h2>No messages found for this ticket.</h2>
        <p>If this is an older ticket, the transcript might not have been saved in the new format.</p>
        {ticket && ticket.transcriptMessageUrl && (
          <a href={ticket.transcriptMessageUrl} target="_blank" rel="noopener noreferrer" className="old-transcript-btn">
            Download Old Transcript (.txt)
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="transcript-page">
      <div className="transcript-header">
        <Link to={`/dashboard/${guildId}/tickets`} className="back-link">← Back to Tickets</Link>
        <h1>Transcript: {ticket.ticketId}</h1>
        <p>Ticket closed on {new Date(ticket.closedAt).toLocaleString()}</p>
      </div>

      <div className="discord-mockup">
        <div className="discord-messages">
          {ticket.messages.map((msg, index) => {
            const prevMsg = index > 0 ? ticket.messages[index - 1] : null;
            const isSameUser = prevMsg && prevMsg.authorId === msg.authorId;
            const timeDiff = prevMsg ? msg.timestamp - prevMsg.timestamp : 0;
            const isCompact = isSameUser && timeDiff < 300000; // 5 minutes

            return (
              <div key={index} className={`discord-message ${isCompact ? 'compact' : 'cozy'}`}>
                {!isCompact && (
                  <img src={msg.authorAvatar || 'https://cdn.discordapp.com/embed/avatars/0.png'} alt="avatar" className="discord-avatar" />
                )}
                <div className="discord-message-content">
                  {!isCompact && (
                    <div className="discord-message-header">
                      <span className="discord-author">{msg.authorTag.split('#')[0]}</span>
                      <span className="discord-timestamp">{new Date(msg.timestamp).toLocaleString()}</span>
                    </div>
                  )}
                  {isCompact && (
                    <span className="discord-timestamp-compact">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  )}
                  <div className="discord-text">{msg.content}</div>
                  
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="discord-attachments">
                      {msg.attachments.map((url, i) => {
                        const isImage = url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i);
                        return isImage ? (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                            <img src={url} alt="attachment" className="discord-attachment-img" />
                          </a>
                        ) : (
                          <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="discord-attachment-link">
                            📎 Attachment
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
