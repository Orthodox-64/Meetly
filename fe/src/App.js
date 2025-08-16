import React, { useState } from 'react';
import axios from 'axios';
import './index.css';

function App() {
  const [transcript, setTranscript] = useState('');
  const [instruction, setInstruction] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState('Meeting Summary');
  const [message, setMessage] = useState('');

  // Hardcoded Gemini API key
  const GEMINI_API_KEY = 'AIzaSyAerBoGRKAl_AMK4uGDG1re1u86sNxa28o';

  const generateSummary = async () => {
    if (!transcript.trim() || !instruction.trim()) {
      setMessage('Please provide both transcript and instruction');
      return;
    }

    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a professional meeting summarizer. Please analyze the following transcript and provide a summary based on the given instruction.

TRANSCRIPT:
${transcript}

INSTRUCTION:
${instruction}

Please provide a well-structured, professional summary that follows the instruction. Make sure the summary is clear, concise, and maintains the key points from the transcript.`
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedSummary = data.candidates[0].content.parts[0].text;
        setSummary(generatedSummary);
        setMessage('Summary generated successfully!');
      } else {
        throw new Error('Failed to generate summary');
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      setMessage('Error generating summary. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmail = async () => {
    if (!emailRecipients.trim() || !summary.trim()) {
      setMessage('Please provide recipients and summary content');
      return;
    }

    setIsSending(true);
    setMessage('');

    try {
      const recipients = emailRecipients.split(',').map(email => email.trim()).filter(email => email);
      
      const response = await axios.post('/api/send-email', {
        recipients,
        subject: emailSubject,
        content: summary
      });

      setMessage('Email sent successfully!');
      setShowEmailForm(false);
    } catch (error) {
      console.error('Error sending email:', error);
      setMessage('Error sending email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Meeting Summarizer</h1>
        <p>Upload your meeting transcript, add custom instructions, and get an AI-powered summary that you can edit and share.</p>
      </div>

      <div className="main-content">
        {/* Input Section */}
        <div className="section">
          <h2>Input</h2>
          
          <div className="form-group">
            <label htmlFor="transcript">Meeting Transcript</label>
            <textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your meeting transcript here..."
              rows={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="instruction">Custom Instruction</label>
            <textarea
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g., Summarize in bullet points for executives, Highlight only action items..."
              rows={4}
            />
          </div>

          <button
            className="btn"
            onClick={generateSummary}
            disabled={isLoading || !transcript.trim() || !instruction.trim()}
          >
            {isLoading ? (
              <div className="loading">
                <div className="spinner"></div>
                Generating Summary...
              </div>
            ) : (
              'Generate Summary'
            )}
          </button>
        </div>

        {/* Output Section */}
        <div className="section">
          <h2>Generated Summary</h2>
          
          <div className="form-group">
            <label htmlFor="summary">Summary (Editable)</label>
            <textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Generated summary will appear here..."
              rows={12}
              disabled={isLoading}
            />
          </div>

          {summary && (
            <div className="email-section">
              <button
                className="btn btn-secondary"
                onClick={() => setShowEmailForm(!showEmailForm)}
              >
                {showEmailForm ? 'Hide Email Form' : 'Share via Email'}
              </button>

              <div className={`email-form ${showEmailForm ? 'show' : ''}`}>
                <div className="email-inputs">
                  <div className="form-group">
                    <label htmlFor="recipients">Recipients (comma-separated)</label>
                    <input
                      id="recipients"
                      type="text"
                      value={emailRecipients}
                      onChange={(e) => setEmailRecipients(e.target.value)}
                      placeholder="email1@example.com, email2@example.com"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject</label>
                    <input
                      id="subject"
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      placeholder="Meeting Summary"
                    />
                  </div>
                </div>

                <button
                  className="btn"
                  onClick={sendEmail}
                  disabled={isSending || !emailRecipients.trim()}
                >
                  {isSending ? (
                    <div className="loading">
                      <div className="spinner"></div>
                      Sending Email...
                    </div>
                  ) : (
                    'Send Email'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {message && (
        <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}
    </div>
  );
}

export default App;
