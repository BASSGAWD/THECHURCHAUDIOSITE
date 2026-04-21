import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Edit2, Save, X, Upload, LogIn, Download, Mail } from "lucide-react";
import { Link } from "wouter";
import type { Article, SamplePack, MailingListEntry } from "@shared/schema";

function useAdminToken() {
  const [token, setToken] = useState(() => sessionStorage.getItem("admin_token") || "");
  const save = (t: string) => {
    sessionStorage.setItem("admin_token", t);
    setToken(t);
  };
  return { token, save };
}

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

function LoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/articles", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.ok) {
        onLogin(password);
      } else {
        setError("Invalid password");
      }
    } catch {
      setError("Connection failed");
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <h1 className="text-white text-xl font-bold uppercase tracking-widest text-center">Admin Login</h1>
        <Input
          data-testid="input-admin-password"
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
        />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <Button data-testid="button-admin-login" type="submit" className="w-full bg-white text-black hover:bg-white/90">
          <LogIn size={16} className="mr-2" /> Sign In
        </Button>
      </form>
    </div>
  );
}

function FileUploadField({ label, value, onChange, accept }: { label: string; value: string; onChange: (path: string) => void; accept?: string }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const urlRes = await fetch("/api/uploads/request-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type }),
      });
      const { uploadURL, objectPath } = await urlRes.json();
      await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      onChange(objectPath);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-white/60 text-xs uppercase tracking-wider">{label}</label>
      <div className="flex gap-2 items-center">
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="File path or URL"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/30 text-sm flex-1"
        />
        <label className="cursor-pointer">
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
          <div className={`flex items-center gap-1 px-3 py-2 rounded border border-white/20 text-white/60 hover:text-white hover:bg-white/10 transition-colors text-xs ${uploading ? "opacity-50" : ""}`}>
            <Upload size={14} />
            {uploading ? "..." : "Upload"}
          </div>
        </label>
      </div>
      {value && value.startsWith("/objects/") && (
        <p className="text-green-400/60 text-xs truncate">Uploaded: {value}</p>
      )}
    </div>
  );
}

function ArticleEditor({ article, token, onDone }: { article?: Article; token: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(article?.title || "");
  const [content, setContent] = useState(article?.content || "");
  const [category, setCategory] = useState(article?.category || "tutorial");
  const [coverImagePath, setCoverImagePath] = useState(article?.coverImagePath || "");

  const mutation = useMutation({
    mutationFn: async () => {
      const body = { title, content, category, coverImagePath: coverImagePath || null };
      const url = article ? `/api/articles/${article.id}` : "/api/articles";
      const method = article ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: authHeaders(token), body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/articles"] });
      onDone();
    },
  });

  return (
    <div className="space-y-4 p-4 border border-white/10 rounded-lg bg-white/5">
      <div className="flex gap-2">
        {(["tutorial", "blog"] as const).map((cat) => (
          <button
            key={cat}
            data-testid={`button-category-${cat}`}
            onClick={() => setCategory(cat)}
            className={`px-3 py-1 rounded text-xs uppercase tracking-wider border ${category === cat ? "bg-white text-black border-white" : "border-white/20 text-white/60"}`}
          >
            {cat}
          </button>
        ))}
      </div>
      <Input
        data-testid="input-article-title"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
      />
      <FileUploadField label="Cover Image" value={coverImagePath} onChange={setCoverImagePath} accept="image/*" />
      <textarea
        data-testid="input-article-content"
        placeholder="Write your article content here..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="w-full min-h-[200px] bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-md p-3 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-white/30"
      />
      <div className="flex gap-2">
        <Button
          data-testid="button-save-article"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !title || !content}
          className="bg-white text-black hover:bg-white/90"
        >
          <Save size={14} className="mr-1" />
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
        <Button data-testid="button-cancel-article" variant="outline" onClick={onDone} className="border-white/20 text-white bg-transparent hover:bg-white/10">
          <X size={14} className="mr-1" /> Cancel
        </Button>
      </div>
      {mutation.isError && <p className="text-red-400 text-sm">{(mutation.error as Error).message}</p>}
    </div>
  );
}

function SamplePackEditor({ pack, token, onDone }: { pack?: SamplePack; token: string; onDone: () => void }) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState(pack?.title || "");
  const [description, setDescription] = useState(pack?.description || "");
  const [price, setPrice] = useState(pack?.price?.toString() || "0");
  const [coverImagePath, setCoverImagePath] = useState(pack?.coverImagePath || "");
  const [filePath, setFilePath] = useState(pack?.filePath || "");

  const mutation = useMutation({
    mutationFn: async () => {
      const body = {
        title,
        description,
        price: parseInt(price) || 0,
        coverImagePath: coverImagePath || null,
        filePath: filePath || null,
      };
      const url = pack ? `/api/sample-packs/${pack.id}` : "/api/sample-packs";
      const method = pack ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: authHeaders(token), body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sample-packs"] });
      onDone();
    },
  });

  return (
    <div className="space-y-4 p-4 border border-white/10 rounded-lg bg-white/5">
      <Input
        data-testid="input-pack-title"
        placeholder="Pack Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
      />
      <textarea
        data-testid="input-pack-description"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="w-full min-h-[100px] bg-white/10 border border-white/20 text-white placeholder:text-white/40 rounded-md p-3 text-sm resize-y focus:outline-none focus:ring-1 focus:ring-white/30"
      />
      <div className="space-y-2">
        <label className="text-white/60 text-xs uppercase tracking-wider">Price (cents, 0 = free)</label>
        <Input
          data-testid="input-pack-price"
          type="number"
          placeholder="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
        />
      </div>
      <FileUploadField label="Cover Image" value={coverImagePath} onChange={setCoverImagePath} accept="image/*" />
      <FileUploadField label="Sample Pack File (ZIP/WAV)" value={filePath} onChange={setFilePath} accept=".zip,.wav,.mp3,.rar" />
      <div className="flex gap-2">
        <Button
          data-testid="button-save-pack"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !title || !description}
          className="bg-white text-black hover:bg-white/90"
        >
          <Save size={14} className="mr-1" />
          {mutation.isPending ? "Saving..." : "Save"}
        </Button>
        <Button data-testid="button-cancel-pack" variant="outline" onClick={onDone} className="border-white/20 text-white bg-transparent hover:bg-white/10">
          <X size={14} className="mr-1" /> Cancel
        </Button>
      </div>
      {mutation.isError && <p className="text-red-400 text-sm">{(mutation.error as Error).message}</p>}
    </div>
  );
}

function ArticlesSection({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Article | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: articles = [], isLoading } = useQuery<Article[]>({
    queryKey: ["/api/articles"],
    queryFn: async () => {
      const res = await fetch("/api/articles");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE", headers: authHeaders(token) });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/articles"] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-lg font-bold uppercase tracking-wider">Articles</h2>
        <Button data-testid="button-new-article" onClick={() => setCreating(true)} className="bg-white text-black hover:bg-white/90" size="sm">
          <Plus size={14} className="mr-1" /> New
        </Button>
      </div>

      {creating && <ArticleEditor token={token} onDone={() => setCreating(false)} />}
      {editing && <ArticleEditor article={editing} token={token} onDone={() => setEditing(null)} />}

      {isLoading && <p className="text-white/40 text-sm">Loading...</p>}

      <div className="space-y-2">
        {articles.map((article) => (
          <div key={article.id} data-testid={`card-article-${article.id}`} className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{article.title}</p>
              <p className="text-white/40 text-xs uppercase tracking-wider">{article.category}</p>
            </div>
            <div className="flex gap-1 ml-2">
              <button
                data-testid={`button-edit-article-${article.id}`}
                onClick={() => setEditing(article)}
                className="p-2 text-white/40 hover:text-white"
              >
                <Edit2 size={14} />
              </button>
              <button
                data-testid={`button-delete-article-${article.id}`}
                onClick={() => {
                  if (confirm("Delete this article?")) deleteMutation.mutate(article.id);
                }}
                className="p-2 text-white/40 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {!isLoading && articles.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No articles yet. Create your first one!</p>
        )}
      </div>
    </div>
  );
}

function SamplePacksSection({ token }: { token: string }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<SamplePack | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: packs = [], isLoading } = useQuery<SamplePack[]>({
    queryKey: ["/api/sample-packs"],
    queryFn: async () => {
      const res = await fetch("/api/sample-packs");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/sample-packs/${id}`, { method: "DELETE", headers: authHeaders(token) });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/sample-packs"] }),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-lg font-bold uppercase tracking-wider">Sample Packs</h2>
        <Button data-testid="button-new-pack" onClick={() => setCreating(true)} className="bg-white text-black hover:bg-white/90" size="sm">
          <Plus size={14} className="mr-1" /> New
        </Button>
      </div>

      {creating && <SamplePackEditor token={token} onDone={() => setCreating(false)} />}
      {editing && <SamplePackEditor pack={editing} token={token} onDone={() => setEditing(null)} />}

      {isLoading && <p className="text-white/40 text-sm">Loading...</p>}

      <div className="space-y-2">
        {packs.map((pack) => (
          <div key={pack.id} data-testid={`card-pack-${pack.id}`} className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{pack.title}</p>
              <p className="text-white/40 text-xs">{pack.price === 0 ? "FREE" : `$${(pack.price / 100).toFixed(2)}`}</p>
            </div>
            <div className="flex gap-1 ml-2">
              <button
                data-testid={`button-edit-pack-${pack.id}`}
                onClick={() => setEditing(pack)}
                className="p-2 text-white/40 hover:text-white"
              >
                <Edit2 size={14} />
              </button>
              <button
                data-testid={`button-delete-pack-${pack.id}`}
                onClick={() => {
                  if (confirm("Delete this sample pack?")) deleteMutation.mutate(pack.id);
                }}
                className="p-2 text-white/40 hover:text-red-400"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {!isLoading && packs.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No sample packs yet. Upload your first one!</p>
        )}
      </div>
    </div>
  );
}

function MailingListSection({ token }: { token: string }) {
  const { data: subscribers = [], isLoading } = useQuery<MailingListEntry[]>({
    queryKey: ["/api/mailing-list"],
    queryFn: async () => {
      const res = await fetch("/api/mailing-list", { headers: authHeaders(token) });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const handleExport = () => {
    fetch('/api/mailing-list/export', { headers: authHeaders(token) })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'mailing-list.csv';
        link.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white text-lg font-bold uppercase tracking-wider">Mailing List</h2>
        <Button data-testid="button-export-mailing-list" onClick={handleExport} className="bg-white text-black hover:bg-white/90" size="sm">
          <Download size={14} className="mr-1" /> Export CSV
        </Button>
      </div>

      <div className="p-3 border border-white/10 rounded-lg bg-white/5">
        <p className="text-white text-2xl font-bold">{subscribers.length}</p>
        <p className="text-white/40 text-xs uppercase tracking-wider">Total Subscribers</p>
      </div>

      {isLoading && <p className="text-white/40 text-sm">Loading...</p>}

      <div className="space-y-2">
        {subscribers.map((sub) => (
          <div key={sub.id} data-testid={`card-subscriber-${sub.id}`} className="flex items-center justify-between p-3 border border-white/10 rounded-lg bg-white/5">
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{sub.email}</p>
              <p className="text-white/40 text-xs">
                {sub.username && <span className="mr-3">@{sub.username}</span>}
                {sub.subscribedAt && new Date(sub.subscribedAt).toLocaleDateString()}
              </p>
            </div>
            <Mail size={14} className="text-white/20 ml-2" />
          </div>
        ))}
        {!isLoading && subscribers.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No subscribers yet. Users are auto-added when they sign up.</p>
        )}
      </div>
    </div>
  );
}

export default function Admin() {
  const { token, save } = useAdminToken();
  const [activeTab, setActiveTab] = useState<"articles" | "packs" | "mailing">("articles");

  if (!token) {
    return <LoginForm onLogin={save} />;
  }

  return (
    <div className="min-h-[100dvh] bg-black p-4 pb-28">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/?opened=true">
            <button data-testid="link-back-home" className="text-white/40 hover:text-white flex items-center gap-1 text-sm">
              <ArrowLeft size={16} /> Back
            </button>
          </Link>
          <h1 className="text-white text-sm font-bold uppercase tracking-[0.3em]">Admin</h1>
          <button
            data-testid="button-logout"
            onClick={() => {
              sessionStorage.removeItem("admin_token");
              window.location.reload();
            }}
            className="text-white/40 hover:text-white text-xs uppercase tracking-wider"
          >
            Logout
          </button>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            data-testid="tab-articles"
            onClick={() => setActiveTab("articles")}
            className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold border rounded ${activeTab === "articles" ? "bg-white text-black border-white" : "border-white/20 text-white/60"}`}
          >
            Articles
          </button>
          <button
            data-testid="tab-packs"
            onClick={() => setActiveTab("packs")}
            className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold border rounded ${activeTab === "packs" ? "bg-white text-black border-white" : "border-white/20 text-white/60"}`}
          >
            Packs
          </button>
          <button
            data-testid="tab-mailing"
            onClick={() => setActiveTab("mailing")}
            className={`flex-1 py-2 text-xs uppercase tracking-wider font-bold border rounded ${activeTab === "mailing" ? "bg-white text-black border-white" : "border-white/20 text-white/60"}`}
          >
            Mailing List
          </button>
        </div>

        {activeTab === "articles" && <ArticlesSection token={token} />}
        {activeTab === "packs" && <SamplePacksSection token={token} />}
        {activeTab === "mailing" && <MailingListSection token={token} />}
      </div>
    </div>
  );
}
