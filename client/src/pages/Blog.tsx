import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";
import { motion } from "framer-motion";
import type { Article } from "@shared/schema";

export default function Blog() {
  const [, setLocation] = useLocation();
  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles", "blog"],
    queryFn: async () => {
      const res = await fetch("/api/articles?category=blog");
      return res.json();
    },
  });

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/?opened=true">
            <button data-testid="link-back-home" className="text-white/40 hover:text-white">
              <ArrowLeft size={20} />
            </button>
          </Link>
          <h1 className="text-xl font-bold uppercase tracking-[0.3em]">The Blog</h1>
        </div>

        {isLoading && <p className="text-white/40 text-center py-12">Loading...</p>}

        {!isLoading && articles.length === 0 && (
          <div className="text-center py-20">
            <FileText size={48} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/30 text-sm uppercase tracking-wider">No posts yet</p>
            <p className="text-white/20 text-xs mt-2">Check back soon</p>
          </div>
        )}

        <div className="space-y-4">
          {articles.map((article, i) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              data-testid={`card-blog-${article.id}`}
              onClick={() => setLocation(`/article/${article.id}`)}
              className="cursor-pointer border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors"
            >
              {article.coverImagePath && (
                <div className="h-40 overflow-hidden">
                  <img
                    src={article.coverImagePath}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="text-white font-bold text-lg mb-1">{article.title}</h2>
                <p className="text-white/40 text-sm line-clamp-2">{article.content}</p>
                <p className="text-white/20 text-xs mt-3 uppercase tracking-wider">
                  {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString() : ""}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
