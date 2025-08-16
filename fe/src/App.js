import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
  const [showPreview, setShowPreview] = useState(false);

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
              text: `You are an expert meeting and call transcript analyst with years of experience in business communication, project management, and executive reporting.

TASK: Analyze the following meeting/call transcript and create a professional summary in MARKDOWN format based on the user's specific instruction.

TRANSCRIPT:
${transcript}

USER INSTRUCTION:
${instruction}

GUIDELINES FOR ANALYSIS:
1. Identify key participants, their roles, and main speakers
2. Extract action items, decisions made, and next steps
3. Highlight important deadlines, dates, and timeframes
4. Note any challenges, risks, or concerns raised
5. Capture key metrics, numbers, or data points mentioned
6. Identify follow-up tasks and who is responsible
7. Preserve the context and tone of the discussion
8. Maintain professional language appropriate for the audience

MARKDOWN FORMAT REQUIREMENTS:
- Use # for main headings, ## for subheadings, ### for section headings
- Use **bold** for emphasis on key points, deadlines, and action items
- Use bullet points (- or *) for lists and action items
- Use numbered lists (1. 2. 3.) for sequential steps or priorities
- Use > for important quotes or key statements
- Use \`code\` for technical terms, metrics, or specific data
- Use tables for structured information (participants, action items with assignees)
- Use --- for section separators
- Use emojis sparingly for visual organization (✅ for completed, ⏰ for deadlines, ⚠️ for risks)

STRUCTURE SUGGESTION:
# Meeting Summary
## Key Participants
## Main Decisions
## Action Items
## Deadlines & Timeline
## Risks & Challenges
## Key Metrics & Data
## Next Steps

Please provide a well-structured, professional summary in MARKDOWN format that follows the user's instruction while incorporating these guidelines. Make the summary actionable, clear, and immediately useful for the intended audience.`
            }]
          }]
        })
      });

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedSummary = data.candidates[0].content.parts[0].text;
        setSummary(generatedSummary);
        setMessage('Summary generated successfully in Markdown format!');
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
      
      // Convert markdown to HTML for email
      const htmlContent = convertMarkdownToHTML(summary);
      
      const response = await axios.post('/api/send-email', {
        recipients,
        subject: emailSubject,
        content: summary,
        htmlContent: htmlContent
      });

      setMessage('Email sent successfully with Markdown formatting!');
      setShowEmailForm(false);
    } catch (error) {
      console.error('Error sending email:', error);
      setMessage('Error sending email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Simple markdown to HTML converter
  const convertMarkdownToHTML = (markdown) => {
    return markdown
      // Headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Code
      .replace(/`(.*?)`/g, '<code>$1</code>')
      // Blockquotes
      .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
      // Lists
      .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
      .replace(/^[-*] (.*$)/gim, '<li>$1</li>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Tables (basic support)
      .replace(/\|(.*)\|/g, '<td>$1</td>');
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Meeting & Call Summarizer</h1>
        <p>Upload your meeting or call transcript, add custom instructions, and get an AI-powered summary that captures key decisions, action items, and insights.</p>
      </div>

      <div className="main-content">
        {/* Input Section */}
        <div className="section">
          <h2>Input</h2>
          
          <div className="form-group">
            <label htmlFor="transcript">Meeting/Call Transcript</label>
            <textarea
              id="transcript"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Paste your meeting or call transcript here. Include speaker names, timestamps, and all relevant discussion points..."
              rows={8}
            />
          </div>

          <div className="form-group">
            <label htmlFor="instruction">Custom Instruction</label>
            <textarea
              id="instruction"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="Examples:
• Create an executive summary with key decisions and action items
• Summarize in bullet points highlighting deadlines and responsibilities
• Focus on technical decisions and implementation steps
• Extract only action items with assignees and due dates
• Provide a high-level overview for stakeholders
• Highlight risks, challenges, and mitigation strategies
• Use tables for action items with assignees and deadlines"
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
          <h2>Generated Summary (Markdown Format)</h2>
          
          <div className="form-group">
            <label htmlFor="summary">Summary (Editable Markdown)</label>
            <div style={{ marginBottom: '10px' }}>
              <button
                type="button"
                className={`btn ${!showPreview ? 'btn' : 'btn-secondary'}`}
                onClick={() => setShowPreview(false)}
                style={{ marginRight: '10px' }}
              >
                Edit Mode
              </button>
              <button
                type="button"
                className={`btn ${showPreview ? 'btn' : 'btn-secondary'}`}
                onClick={() => setShowPreview(true)}
              >
                Preview Mode
              </button>
            </div>
            {!showPreview ? (
              <textarea
                id="summary"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Generated summary in Markdown format will appear here..."
                rows={8}
                disabled={isLoading}
              />
            ) : (
              <div className="markdown-preview">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({node, ...props}) => (
                      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '1rem' }} {...props} />
                    ),
                    th: ({node, ...props}) => (
                      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' }} {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td style={{ border: '1px solid #ddd', padding: '8px' }} {...props} />
                    ),
                    code: ({node, inline, ...props}) => (
                      inline ? 
                        <code style={{ backgroundColor: '#f4f4f4', padding: '2px 4px', borderRadius: '3px', fontFamily: 'monospace' }} {...props} /> :
                        <code style={{ backgroundColor: '#f4f4f4', padding: '8px', borderRadius: '3px', fontFamily: 'monospace', display: 'block', overflow: 'auto' }} {...props} />
                    ),
                    blockquote: ({node, ...props}) => (
                      <blockquote style={{ borderLeft: '4px solid #ddd', margin: '0', paddingLeft: '1rem', fontStyle: 'italic', color: '#666' }} {...props} />
                    ),
                    h1: ({node, ...props}) => (
                      <h1 style={{ color: '#333', borderBottom: '2px solid #333', paddingBottom: '0.5rem' }} {...props} />
                    ),
                    h2: ({node, ...props}) => (
                      <h2 style={{ color: '#444', borderBottom: '1px solid #ddd', paddingBottom: '0.3rem', marginTop: '1.5rem' }} {...props} />
                    ),
                    h3: ({node, ...props}) => (
                      <h3 style={{ color: '#555', marginTop: '1rem' }} {...props} />
                    ),
                    strong: ({node, ...props}) => (
                      <strong style={{ fontWeight: 'bold', color: '#333' }} {...props} />
                    ),
                    ul: ({node, ...props}) => (
                      <ul style={{ paddingLeft: '1.5rem' }} {...props} />
                    ),
                    ol: ({node, ...props}) => (
                      <ol style={{ paddingLeft: '1.5rem' }} {...props} />
                    ),
                    li: ({node, ...props}) => (
                      <li style={{ marginBottom: '0.3rem' }} {...props} />
                    ),
                    hr: ({node, ...props}) => (
                      <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '1.5rem 0' }} {...props} />
                    )
                  }}
                >
                  {summary}
                </ReactMarkdown>
              </div>
            )}
            <small style={{ color: '#666', marginTop: '5px', display: 'block' }}>
              💡 The summary is generated in Markdown format. You can edit it here and it will maintain formatting when shared via email.
            </small>
          </div>

          {/* Markdown Preview */}
          {summary && (
            <div className="form-group">
              <label>Markdown Preview</label>
              <div className="markdown-preview">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({node, ...props}) => (
                      <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '1rem' }} {...props} />
                    ),
                    th: ({node, ...props}) => (
                      <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f2f2f2', textAlign: 'left' }} {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td style={{ border: '1px solid #ddd', padding: '8px' }} {...props} />
                    ),
                    code: ({node, inline, ...props}) => (
                      inline ? 
                        <code style={{ backgroundColor: '#f4f4f4', padding: '2px 4px', borderRadius: '3px', fontFamily: 'monospace' }} {...props} /> :
                        <code style={{ backgroundColor: '#f4f4f4', padding: '8px', borderRadius: '3px', fontFamily: 'monospace', display: 'block', overflow: 'auto' }} {...props} />
                    ),
                    blockquote: ({node, ...props}) => (
                      <blockquote style={{ borderLeft: '4px solid #ddd', margin: '0', paddingLeft: '1rem', fontStyle: 'italic', color: '#666' }} {...props} />
                    ),
                    h1: ({node, ...props}) => (
                      <h1 style={{ color: '#333', borderBottom: '2px solid #333', paddingBottom: '0.5rem' }} {...props} />
                    ),
                    h2: ({node, ...props}) => (
                      <h2 style={{ color: '#444', borderBottom: '1px solid #ddd', paddingBottom: '0.3rem', marginTop: '1.5rem' }} {...props} />
                    ),
                    h3: ({node, ...props}) => (
                      <h3 style={{ color: '#555', marginTop: '1rem' }} {...props} />
                    ),
                    strong: ({node, ...props}) => (
                      <strong style={{ fontWeight: 'bold', color: '#333' }} {...props} />
                    ),
                    ul: ({node, ...props}) => (
                      <ul style={{ paddingLeft: '1.5rem' }} {...props} />
                    ),
                    ol: ({node, ...props}) => (
                      <ol style={{ paddingLeft: '1.5rem' }} {...props} />
                    ),
                    li: ({node, ...props}) => (
                      <li style={{ marginBottom: '0.3rem' }} {...props} />
                    ),
                    hr: ({node, ...props}) => (
                      <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '1.5rem 0' }} {...props} />
                    )
                  }}
                >
                  {summary}
                </ReactMarkdown>
              </div>
            </div>
          )}
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

      {message && (
        <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}
    </div>
  );
}

export default App;
