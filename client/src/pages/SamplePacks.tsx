import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft, Package, Download } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LockedOverlay } from "@/components/LockedOverlay";
import { AuthModal } from "@/components/AuthModal";
import type { SamplePack } from "@shared/schema";

export default function SamplePacks() {
  const { user } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  const { data: packs = [], isLoading } = useQuery<SamplePack[]>({
    queryKey: ["/api/sample-packs"],
    queryFn: async () => {
      const res = await fetch("/api/sample-packs");
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
          <h1 className="text-xl font-bold uppercase tracking-[0.3em]">Sample Packs</h1>
        </div>

        {isLoading && <p className="text-white/40 text-center py-12">Loading...</p>}

        {!isLoading && packs.length === 0 && (
          <div className="text-center py-20 relative">
            {!user && <LockedOverlay onUnlock={() => setShowAuth(true)} />}
            <Package size={48} className="mx-auto mb-4 text-white/20" />
            <p className="text-white/30 text-sm uppercase tracking-wider">No sample packs yet</p>
            <p className="text-white/20 text-xs mt-2">New packs dropping soon</p>
          </div>
        )}

        <div className="relative">
          {!user && packs.length > 0 && <LockedOverlay onUnlock={() => setShowAuth(true)} />}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {packs.map((pack, i) => (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                data-testid={`card-pack-${pack.id}`}
                className="border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors"
              >
                {pack.coverImagePath && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={pack.coverImagePath}
                      alt={pack.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                {!pack.coverImagePath && (
                  <div className="h-48 bg-white/5 flex items-center justify-center">
                    <Package size={48} className="text-white/10" />
                  </div>
                )}
                <div className="p-4">
                  <h2 className="text-white font-bold text-lg mb-1">{pack.title}</h2>
                  <p className="text-white/40 text-sm line-clamp-2 mb-3">{pack.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-white/60 text-sm font-bold">
                      {pack.price === 0 ? "FREE" : `$${(pack.price / 100).toFixed(2)}`}
                    </span>
                    {pack.filePath && user && (
                      <a href={pack.filePath} download>
                        <Button data-testid={`button-download-pack-${pack.id}`} size="sm" className="bg-white text-black hover:bg-white/90">
                          <Download size={14} className="mr-1" /> Download
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <AuthModal open={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}
