import { useState } from "react"
import axios from "axios"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "./components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card"
import { Textarea } from "./components/ui/textarea"
import { Input } from "./components/ui/input"
import { Label } from "./components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"
import { Badge } from "./components/ui/badge"
import { Separator } from "./components/ui/separator"
import { FileText, Mail, Eye, Edit3, Sparkles, Send, Users } from "lucide-react"
import "./index.css"

function App() {
  const [transcript, setTranscript] = useState("")
  const [instruction, setInstruction] = useState("")
  const [summary, setSummary] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showEmailForm, setShowEmailForm] = useState(false)
  const [emailRecipients, setEmailRecipients] = useState("")
  const [emailSubject, setEmailSubject] = useState("Meeting Summary")
  const [message, setMessage] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const GEMINI_API_KEY = "AIzaSyAerBoGRKAl_AMK4uGDG1re1u86sNxa28o"

  const generateSummary = async () => {
    if (!transcript.trim() || !instruction.trim()) {
      setMessage("Please provide both transcript and instruction")
      return
    }

    setIsLoading(true)
    setMessage("")

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
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

Please provide a well-structured, professional summary in MARKDOWN format that follows the user's instruction while incorporating these guidelines. Make the summary actionable, clear, and immediately useful for the intended audience.`,
                  },
                ],
              },
            ],
          }),
        },
      )

      const data = await response.json()

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const generatedSummary = data.candidates[0].content.parts[0].text
        setSummary(generatedSummary)
        setMessage("Summary generated successfully in Markdown format!")
      } else {
        throw new Error("Failed to generate summary")
      }
    } catch (error) {
      console.error("Error generating summary:", error)
      setMessage("Error generating summary. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const sendEmail = async () => {
    if (!emailRecipients.trim() || !summary.trim()) {
      setMessage("Please provide recipients and summary content")
      return
    }

    setIsSending(true)
    setMessage("")

    try {
      const recipients = emailRecipients
        .split(",")
        .map((email) => email.trim())
        .filter((email) => email)

      const htmlContent = convertMarkdownToHTML(summary)

      await axios.post("https://meetly-backend-iy21.onrender.com/api/send-email", {
        recipients,
        subject: emailSubject,
        content: summary,
        htmlContent: htmlContent,
      })

      setMessage("Email sent successfully with Markdown formatting!")
      setShowEmailForm(false)
    } catch (error) {
      console.error("Error sending email:", error)
      setMessage("Error sending email. Please try again.")
    } finally {
      setIsSending(false)
    }
  }

  // Simple markdown to HTML converter
  const convertMarkdownToHTML = (markdown) => {
    return (
      markdown
        // Headers
        .replace(/^### (.*$)/gim, "<h3>$1</h3>")
        .replace(/^## (.*$)/gim, "<h2>$1</h2>")
        .replace(/^# (.*$)/gim, "<h1>$1</h1>")
        // Bold
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        // Code
        .replace(/`(.*?)`/g, "<code>$1</code>")
        // Blockquotes
        .replace(/^> (.*$)/gim, "<blockquote>$1</blockquote>")
        // Lists
        .replace(/^\d+\. (.*$)/gim, "<li>$1</li>")
        .replace(/^[-*] (.*$)/gim, "<li>$1</li>")
        // Line breaks
        .replace(/\n/g, "<br>")
        // Tables (basic support)
        .replace(/\|(.*)\|/g, "<td>$1</td>")
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Meeting & Call Summarizer
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transform your meeting transcripts into actionable insights with AI-powered summaries that capture key
            decisions, action items, and next steps.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-xl">Input</CardTitle>
              </div>
              <CardDescription>
                Provide your meeting transcript and custom instructions for the AI summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="transcript" className="text-sm font-medium">
                  Meeting/Call Transcript
                </Label>
                <Textarea
                  id="transcript"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your meeting or call transcript here. Include speaker names, timestamps, and all relevant discussion points..."
                  className="min-h-[200px] resize-none"
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {transcript.length} characters
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="instruction" className="text-sm font-medium">
                  Custom Instruction
                </Label>
                <Textarea
                  id="instruction"
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="Examples:
• Create an executive summary with key decisions and action items
• Summarize in bullet points highlighting deadlines and responsibilities
• Focus on technical decisions and implementation steps
• Extract only action items with assignees and due dates"
                  className="min-h-[120px] resize-none"
                />
              </div>

              <Button
                onClick={generateSummary}
                disabled={isLoading || !transcript.trim() || !instruction.trim()}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Generating Summary...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Generate Summary
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-green-600" />
                <CardTitle className="text-xl">Generated Summary</CardTitle>
              </div>
              <CardDescription>AI-generated summary in Markdown format - edit and preview your content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={showPreview ? "preview" : "edit"} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit" onClick={() => setShowPreview(false)} className="flex items-center gap-2">
                    <Edit3 className="h-4 w-4" />
                    Edit Mode
                  </TabsTrigger>
                  <TabsTrigger value="preview" onClick={() => setShowPreview(true)} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Preview Mode
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="mt-4">
                  <Textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Generated summary in Markdown format will appear here..."
                    className="min-h-[300px] resize-none font-mono text-sm"
                    disabled={isLoading}
                  />
                </TabsContent>

                <TabsContent value="preview" className="mt-4">
                  <div className="min-h-[300px] max-h-[400px] overflow-y-auto border rounded-lg p-4 bg-white">
                    {summary ? (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ node, ...props }) => <table className="w-full border-collapse mb-4" {...props} />,
                          th: ({ node, ...props }) => (
                            <th
                              className="border border-gray-300 px-3 py-2 bg-gray-50 text-left font-semibold"
                              {...props}
                            />
                          ),
                          td: ({ node, ...props }) => <td className="border border-gray-300 px-3 py-2" {...props} />,
                          code: ({ node, inline, ...props }) =>
                            inline ? (
                              <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props} />
                            ) : (
                              <code
                                className="block bg-gray-100 p-3 rounded font-mono text-sm overflow-auto"
                                {...props}
                              />
                            ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote
                              className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4"
                              {...props}
                            />
                          ),
                          h1: ({ node, ...props }) => (
                            <h1
                              className="text-2xl font-bold text-gray-900 border-b-2 border-gray-900 pb-2 mb-4"
                              {...props}
                            />
                          ),
                          h2: ({ node, ...props }) => (
                            <h2
                              className="text-xl font-semibold text-gray-800 border-b border-gray-300 pb-1 mt-6 mb-3"
                              {...props}
                            />
                          ),
                          h3: ({ node, ...props }) => (
                            <h3 className="text-lg font-medium text-gray-700 mt-4 mb-2" {...props} />
                          ),
                          strong: ({ node, ...props }) => <strong className="font-bold text-gray-900" {...props} />,
                          ul: ({ node, ...props }) => <ul className="pl-6 space-y-1" {...props} />,
                          ol: ({ node, ...props }) => <ol className="pl-6 space-y-1" {...props} />,
                          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                          hr: ({ node, ...props }) => (
                            <hr className="border-0 border-t border-gray-300 my-6" {...props} />
                          ),
                        }}
                      >
                        {summary}
                      </ReactMarkdown>
                    ) : (
                      <div className="text-center text-muted-foreground py-12">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Generated summary will appear here...</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              <div className="text-xs text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p>
                    The summary is generated in Markdown format. You can edit it and it will maintain formatting when
                    shared via email.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {summary && (
          <Card className="mt-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-purple-600" />
                  <CardTitle className="text-xl">Share Summary</CardTitle>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowEmailForm(!showEmailForm)}
                  className="flex items-center gap-2"
                >
                  {showEmailForm ? "Hide" : "Show"} Email Form
                  <Users className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>Send your generated summary to team members and stakeholders</CardDescription>
            </CardHeader>

            {showEmailForm && (
              <>
                <Separator />
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-2">
                      <Label htmlFor="recipients" className="text-sm font-medium">
                        Recipients (comma-separated)
                      </Label>
                      <Input
                        id="recipients"
                        type="text"
                        value={emailRecipients}
                        onChange={(e) => setEmailRecipients(e.target.value)}
                        placeholder="email1@example.com, email2@example.com"
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-sm font-medium">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        placeholder="Meeting Summary"
                        className="w-full"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={sendEmail}
                    disabled={isSending || !emailRecipients.trim()}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    size="lg"
                  >
                    {isSending ? (
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending Email...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="h-4 w-4" />
                        Send Email
                      </div>
                    )}
                  </Button>
                </CardContent>
              </>
            )}
          </Card>
        )}

        {message && (
          <div
            className={`mt-6 p-4 rounded-lg border ${
              message.includes("Error")
                ? "bg-red-50 border-red-200 text-red-800"
                : "bg-green-50 border-green-200 text-green-800"
            }`}
          >
            <div className="flex items-center gap-2">
              {message.includes("Error") ? (
                <div className="h-2 w-2 bg-red-500 rounded-full" />
              ) : (
                <div className="h-2 w-2 bg-green-500 rounded-full" />
              )}
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
