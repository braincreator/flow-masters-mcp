'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { AppError, ErrorSeverity } from '@/utilities/errorHandling'
import { MessageSquare, Send, ThumbsUp, Flag, Reply } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { formatDistanceToNow } from 'date-fns'

import { logDebug, logInfo, logWarn, logError } from '@/utils/logger'
interface CourseDiscussionProps {
  courseId: string
  lessonId: string
}

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: string
  likes: number
  liked: boolean
  replies: Reply[]
}

interface Reply {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  timestamp: string
  likes: number
  liked: boolean
}

export function CourseDiscussion({ courseId, lessonId }: CourseDiscussionProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  // Load comments for the current lesson
  useEffect(() => {
    if (!courseId || !lessonId) return

    const loadComments = async () => {
      setIsLoading(true)
      try {
        // In a real app, this would be an API call
        const savedComments = localStorage.getItem(`course_comments_${courseId}_${lessonId}`)
        if (savedComments) {
          setComments(JSON.parse(savedComments))
        } else {
          // Mock data for demonstration
          const mockComments: Comment[] = [
            {
              id: 'comment1',
              userId: 'user1',
              userName: 'John Doe',
              content:
                'This lesson was really helpful! I especially liked the explanation of the key concepts.',
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              likes: 5,
              liked: false,
              replies: [
                {
                  id: 'reply1',
                  userId: 'user2',
                  userName: 'Jane Smith',
                  content: 'I agree! The examples were also very clear.',
                  timestamp: new Date(Date.now() - 1800000).toISOString(),
                  likes: 2,
                  liked: false,
                },
              ],
            },
            {
              id: 'comment2',
              userId: 'user3',
              userName: 'Alex Johnson',
              content:
                'I had a question about the second example. Could someone explain how the algorithm works in more detail?',
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              likes: 0,
              liked: false,
              replies: [],
            },
          ]
          setComments(mockComments)
          localStorage.setItem(
            `course_comments_${courseId}_${lessonId}`,
            JSON.stringify(mockComments),
          )
        }
      } catch (error) {
        logError('Error loading comments:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadComments()
  }, [courseId, lessonId])

  const submitComment = async () => {
    if (!user || !newComment.trim()) return

    setIsSubmitting(true)
    try {
      // Create a new comment
      const newCommentObj: Comment = {
        id: `comment_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: newComment,
        timestamp: new Date().toISOString(),
        likes: 0,
        liked: false,
        replies: [],
      }

      // Add to existing comments
      const updatedComments = [newCommentObj, ...comments]

      // In a real app, this would be an API call
      localStorage.setItem(
        `course_comments_${courseId}_${lessonId}`,
        JSON.stringify(updatedComments),
      )

      setComments(updatedComments)
      setNewComment('')
    } catch (error) {
      logError('Error submitting comment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const submitReply = async (commentId: string) => {
    if (!user || !replyContent.trim() || !replyingTo) return

    try {
      // Create a new reply
      const newReply: Reply = {
        id: `reply_${Date.now()}`,
        userId: user.id,
        userName: user.name,
        userAvatar: user.avatar,
        content: replyContent,
        timestamp: new Date().toISOString(),
        likes: 0,
        liked: false,
      }

      // Add reply to the comment
      const updatedComments = comments.map((comment) => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...comment.replies, newReply],
          }
        }
        return comment
      })

      // In a real app, this would be an API call
      localStorage.setItem(
        `course_comments_${courseId}_${lessonId}`,
        JSON.stringify(updatedComments),
      )

      setComments(updatedComments)
      setReplyContent('')
      setReplyingTo(null)
    } catch (error) {
      logError('Error submitting reply:', error)
    }
  }

  const toggleLike = async (commentId: string, isReply = false, replyId?: string) => {
    if (!user) return

    try {
      let updatedComments

      if (isReply && replyId) {
        // Toggle like on a reply
        updatedComments = comments.map((comment) => {
          if (comment.id === commentId) {
            const updatedReplies = comment.replies.map((reply) => {
              if (reply.id === replyId) {
                const wasLiked = reply.liked
                return {
                  ...reply,
                  likes: wasLiked ? reply.likes - 1 : reply.likes + 1,
                  liked: !wasLiked,
                }
              }
              return reply
            })

            return {
              ...comment,
              replies: updatedReplies,
            }
          }
          return comment
        })
      } else {
        // Toggle like on a comment
        updatedComments = comments.map((comment) => {
          if (comment.id === commentId) {
            const wasLiked = comment.liked
            return {
              ...comment,
              likes: wasLiked ? comment.likes - 1 : comment.likes + 1,
              liked: !wasLiked,
            }
          }
          return comment
        })
      }

      // In a real app, this would be an API call
      localStorage.setItem(
        `course_comments_${courseId}_${lessonId}`,
        JSON.stringify(updatedComments),
      )

      setComments(updatedComments)
    } catch (error) {
      logError('Error toggling like:', error)
    }
  }

  const reportComment = (commentId: string, isReply = false, replyId?: string) => {
    // In a real app, this would send a report to moderators
    new AppError({
      message:
        'Comment reported to moderators. Thank you for helping keep our community respectful.',
      severity: ErrorSeverity.INFO,
    }).notify()
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Discussion ({comments.length})
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col">
        {user ? (
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-3">
              <Avatar className="h-8 w-8">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name} />
                ) : (
                  <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <Textarea
                placeholder="Add to the discussion..."
                className="flex-grow resize-none"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button
                onClick={submitComment}
                disabled={!newComment.trim() || isSubmitting}
                size="sm"
              >
                {isSubmitting ? (
                  'Posting...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-1" />
                    Post
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md mb-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Please log in to join the discussion.
            </p>
          </div>
        )}

        <div className="space-y-6 overflow-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading comments...</p>
            </div>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment.id} className="space-y-3">
                <div className="p-3 border rounded-md">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      {comment.userAvatar ? (
                        <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                      ) : (
                        <AvatarFallback>
                          {comment.userName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">{comment.userName}</p>
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => reportComment(comment.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                        >
                          <Flag className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="mt-2 text-sm">{comment.content}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleLike(comment.id)}
                          className={`h-6 p-0 flex items-center gap-1 text-xs ${
                            comment.liked ? 'text-blue-600' : 'text-gray-500'
                          }`}
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {comment.likes > 0 && comment.likes}
                        </Button>
                        {user && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setReplyingTo(replyingTo === comment.id ? null : comment.id)
                            }
                            className="h-6 p-0 flex items-center gap-1 text-xs text-gray-500"
                          >
                            <Reply className="h-3.5 w-3.5" />
                            Reply
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reply form */}
                {replyingTo === comment.id && user && (
                  <div className="ml-8 p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="h-6 w-6">
                        {user.avatar ? (
                          <AvatarImage src={user.avatar} alt={user.name} />
                        ) : (
                          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        )}
                      </Avatar>
                      <Textarea
                        placeholder={`Reply to ${comment.userName}...`}
                        className="flex-grow resize-none text-sm"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setReplyingTo(null)}>
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => submitReply(comment.id)}
                        disabled={!replyContent.trim()}
                      >
                        Reply
                      </Button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {comment.replies.length > 0 && (
                  <div className="ml-8 space-y-3">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="p-3 border rounded-md">
                        <div className="flex items-start gap-3">
                          <Avatar className="h-6 w-6">
                            {reply.userAvatar ? (
                              <AvatarImage src={reply.userAvatar} alt={reply.userName} />
                            ) : (
                              <AvatarFallback>
                                {reply.userName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{reply.userName}</p>
                                <p className="text-xs text-gray-500">
                                  {formatDistanceToNow(new Date(reply.timestamp), {
                                    addSuffix: true,
                                  })}
                                </p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => reportComment(comment.id, true, reply.id)}
                                className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                              >
                                <Flag className="h-4 w-4" />
                              </Button>
                            </div>
                            <p className="mt-2 text-sm">{reply.content}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleLike(comment.id, true, reply.id)}
                                className={`h-6 p-0 flex items-center gap-1 text-xs ${
                                  reply.liked ? 'text-blue-600' : 'text-gray-500'
                                }`}
                              >
                                <ThumbsUp className="h-3.5 w-3.5" />
                                {reply.likes > 0 && reply.likes}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
              <p>No comments yet. Be the first to start the discussion!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
