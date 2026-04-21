import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Send, MessageSquare, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { AuthModal } from "@/components/AuthModal";
import type { Article, Comment } from "@shared/schema";

function CommentsSection({ articleId }: { articleId: string }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAuth, setShowAuth] = useState(false);
  const [newComment, setNewComment] = useState("");

  const { data: comments = [] } = useQuery<Comment[]>({
    queryKey: ["/api/articles", articleId, "comments"],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      return res.json();
    },
  });

  const postComment = useMutation({
    mutationFn: async (content: string) => {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles", articleId, "comments"] });
      setNewComment("");
    },
  });

  return (
    <div className="mt-12 border-t border-white/10 pt-8">
      <h3 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
        <MessageSquare size={16} /> Comments ({comments.length})
      </h3>

      {user ? (
        <div className="flex gap-2 mb-6">
          <input
            data-testid="input-comment"
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && newComment.trim()) postComment.mutate(newComment);
            }}
            className="flex-1 bg-white/10 border border-white/20 text-white placeholder:text-white/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-white/30"
          />
          <Button
            data-testid="button-post-comment"
            onClick={() => newComment.trim() && postComment.mutate(newComment)}
            disabled={postComment.isPending || !newComment.trim()}
            size="sm"
            className="bg-white text-black hover:bg-white/90"
          >
            <Send size={14} />
          </Button>
        </div>
      ) : (
        <div
          className="mb-6 p-4 border border-white/10 rounded-lg bg-white/5 flex items-center justify-center gap-3 cursor-pointer hover:border-white/20 transition-colors"
          onClick={() => setShowAuth(true)}
          data-testid="button-login-to-comment"
        >
          <Lock size={16} className="text-white/40" />
          <p className="text-white/40 text-sm">Sign in to leave a comment</p>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((comment) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            data-testid={`card-comment-${comment.id}`}
            className="p-3 border border-white/10 rounded-lg"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white text-xs font-bold uppercase tracking-wider">{comment.username}</span>
              <span className="text-white/20 text-xs">
                {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : ""}
              </span>
            </div>
            <p className="text-white/60 text-sm">{comment.content}</p>
          </motion.div>
        ))}
        {comments.length === 0 && (
          <p className="text-white/20 text-sm text-center py-4">No comments yet. Be the first!</p>
        )}
      </div>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}

export default function ArticleView() {
  const { id } = useParams<{ id: string }>();
  const { data: article, isLoading } = useQuery<Article>({
    queryKey: ["/api/articles", id],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${id}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex items-center justify-center">
        <p className="text-white/40">Loading...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-[100dvh] bg-black text-white flex items-center justify-center">
        <p className="text-white/40">Article not found</p>
      </div>
    );
  }

  const backPath = article.category === "tutorial" ? "/tutorials" : "/blog";

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8 pb-32">
        <Link href={backPath}>
          <button data-testid="link-back" className="text-white/40 hover:text-white flex items-center gap-2 mb-6 text-sm">
            <ArrowLeft size={16} /> Back to {article.category === "tutorial" ? "Tutorials" : "Blog"}
          </button>
        </Link>

        {article.coverImagePath && (
          <div className="rounded-lg overflow-hidden mb-6 max-h-[400px]">
            <img
              data-testid="img-article-cover"
              src={article.coverImagePath}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <p className="text-white/30 text-xs uppercase tracking-[0.2em] mb-2">
          {article.category} &middot; {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ""}
        </p>
        <h1 data-testid="text-article-title" className="text-2xl sm:text-3xl font-bold mb-6">{article.title}</h1>

        <div data-testid="text-article-content" className="text-white/70 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
          {article.content}
        </div>

        <CommentsSection articleId={article.id} />
      </div>
    </div>
  );
}
