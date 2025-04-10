import React from 'react'
import { GridContainer } from '@/components/GridContainer'
import type { CommentsBlock as CommentsBlockType } from '@/types/blocks'
import { MessageCircle, ThumbsUp, Flag } from 'lucide-react'

// Mock comments for demonstration
const mockComments = [
  {
    id: '1',
    author: 'Jane Smith',
    avatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8YXZhdGFyfGVufDB8fDB8fHww&auto=format&fit=crop&w=100&q=60',
    content:
      'This is a fantastic article! I especially liked the section about WebAssembly. Looking forward to more content like this.',
    date: '2023-05-16T14:23:00Z',
    likes: 12,
    replies: [
      {
        id: '1-1',
        author: 'Alex Johnson',
        avatar:
          'https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&q=60',
        content:
          "Thanks Jane! I appreciate your feedback. I'll be covering more WebAssembly topics in future articles.",
        date: '2023-05-16T15:45:00Z',
        likes: 3,
      },
    ],
  },
  {
    id: '2',
    author: 'Mike Davis',
    avatar:
      'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFufGVufDB8fDB8fHww&auto=format&fit=crop&w=100&q=60',
    content:
      "Great overview of the current trends. I'd love to see an in-depth article about the practical applications of AI in web development.",
    date: '2023-05-17T09:12:00Z',
    likes: 8,
    replies: [],
  },
  {
    id: '3',
    author: 'Sarah Wilson',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dXNlcnxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=100&q=60',
    content:
      "I've been using WebAssembly in my projects, and it's definitely a game-changer. The performance improvements are substantial.",
    date: '2023-05-18T11:05:00Z',
    likes: 15,
    replies: [],
  },
]

export const Comments: React.FC<CommentsBlockType> = ({
  title = 'Comments',
  provider = 'native',
  showCount = true,
  settings,
}) => {
  const totalComments = mockComments.reduce(
    (acc, comment) => acc + 1 + (comment.replies?.length || 0),
    0,
  )

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  return (
    <GridContainer settings={settings}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {title}
            {showCount && <span className="text-muted-foreground ml-2">({totalComments})</span>}
          </h2>
        </div>

        {/* Comment Form */}
        <div className="mb-8 p-4 border rounded-lg bg-card">
          <h3 className="text-lg font-medium mb-4">Leave a comment</h3>
          <div className="flex gap-4">
            <div className="flex-1">
              <textarea
                className="w-full min-h-[120px] p-3 rounded-md border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Share your thoughts..."
              />
              <div className="flex justify-end mt-2">
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
                  Post Comment
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-6">
          {mockComments.map((comment) => (
            <div key={comment.id} className="border-b pb-6 last:border-0">
              {/* Main Comment */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden relative flex-shrink-0">
                  <img src={comment.avatar} alt={comment.author} className="object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{comment.author}</h4>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(comment.date)}
                    </span>
                  </div>
                  <p className="mt-1 mb-2">{comment.content}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      <ThumbsUp size={16} />
                      <span>{comment.likes}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      <MessageCircle size={16} />
                      <span>Reply</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                      <Flag size={16} />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-14 mt-4 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-4">
                      <div className="w-8 h-8 rounded-full overflow-hidden relative flex-shrink-0">
                        <img src={reply.avatar} alt={reply.author} className="object-cover" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{reply.author}</h4>
                          <span className="text-sm text-muted-foreground">
                            {formatDate(reply.date)}
                          </span>
                        </div>
                        <p className="mt-1 mb-2">{reply.content}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                            <ThumbsUp size={16} />
                            <span>{reply.likes}</span>
                          </button>
                          <button className="flex items-center gap-1 hover:text-foreground transition-colors">
                            <Flag size={16} />
                            <span>Report</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-8 text-center">
          <button className="px-6 py-2 border rounded-md hover:bg-muted transition-colors">
            Load More Comments
          </button>
        </div>
      </div>
    </GridContainer>
  )
}

export const CommentsBlock = Comments
export default Comments
