import React, { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import Sidebar from "@/components/Sidebar";
import SidebarPrivate from "@/components/private/SidebarPrivate.jsx";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Megaphone,
  Send,
  Plus,
  Loader2,
  Menu,
  UserCircle,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Trash2,
  ZoomIn,
  Search,
  Clock,
  AlertCircle,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import WhatsappSvg from "../assets/svg/whatsapp-svgrepo-com.svg";

/* ============ COMPONENTES AUXILIARES ============ */

const PostSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-48 bg-slate-100" />
    <div className="p-6 md:p-8 space-y-4">
      <div className="flex justify-between">
        <div className="h-6 w-32 bg-slate-100 rounded-full" />
        <div className="h-6 w-24 bg-slate-100 rounded-full" />
      </div>
      <div className="h-7 w-3/4 bg-slate-100 rounded-lg" />
      <div className="space-y-2">
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-5/6 bg-slate-100 rounded" />
      </div>
      <div className="pt-5 border-t border-slate-100 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100" />
        <div className="space-y-1.5">
          <div className="h-3 w-24 bg-slate-100 rounded" />
          <div className="h-3 w-32 bg-slate-100 rounded" />
        </div>
      </div>
    </div>
  </div>
);

const Toast = ({ message, type = "success", onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const Icon = type === "success" ? CheckCircle2 : AlertCircle;
  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl border backdrop-blur-md ${
        type === "success"
          ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
          : "bg-rose-50/95 border-rose-200 text-rose-800"
      } animate-in slide-in-from-bottom-4 duration-300`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-sm font-semibold">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const ConfirmDialog = ({
  title,
  description,
  onConfirm,
  onCancel,
  isLoading,
}) => (
  <div
    role="alertdialog"
    aria-modal="true"
    className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    onClick={onCancel}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 border border-slate-200"
    >
      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4 mx-auto">
        <AlertCircle className="w-6 h-6 text-rose-500" />
      </div>
      <h3 className="text-lg font-bold text-slate-800 text-center">{title}</h3>
      <p className="text-sm text-slate-500 text-center mt-2">{description}</p>
      <div className="flex gap-3 mt-6">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1 px-4 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white bg-rose-500 hover:bg-rose-600 transition-colors shadow-md shadow-rose-500/20 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Trash2 className="w-4 h-4" />
          )}
          Excluir
        </button>
      </div>
    </div>
  </div>
);

/* ============ COMPONENTE PRINCIPAL ============ */

export default function CommunicationChannel({ isPrivateView = false }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Excluir
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Lightbox
  const [expandedImage, setExpandedImage] = useState(null);

  // Imagens com erro
  const [brokenImages, setBrokenImages] = useState({});

  const fileInputRef = useRef(null);
  const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const TITLE_MAX = 120;
  const CONTENT_MAX = 2000;

  /* ---------- Auth ---------- */
  const checkIsAdmin = () => {
    try {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token") ||
        sessionStorage.getItem("access_token");
      if (!token) return false;
      const payload = JSON.parse(atob(token.split(".")[1]));
      return (
        payload.role === "ADMIN" ||
        payload.role === "admin" ||
        payload.is_superuser === true
      );
    } catch {
      return false;
    }
  };

  /* ---------- Fetch ---------- */
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const token =
        localStorage.getItem("access_token") || localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await fetch(`${baseUrl}/api/canal_comunicacao/`, {
        headers,
      });
      if (!response.ok) throw new Error("Erro ao buscar dados");
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Erro ao buscar avisos:", error);
      setToast({
        type: "error",
        message: "Não foi possível carregar os avisos.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setIsAdmin(checkIsAdmin());
    fetchPosts();
  }, []);

  /* ---------- Trava scroll + ESC ---------- */
  useEffect(() => {
    const anyOpen = isModalOpen || expandedImage || deleteTarget;
    document.body.style.overflow = anyOpen ? "hidden" : "";

    const onKey = (e) => {
      if (e.key === "Escape") {
        if (expandedImage) setExpandedImage(null);
        else if (deleteTarget) setDeleteTarget(null);
        else if (isModalOpen) setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isModalOpen, expandedImage, deleteTarget]);

  /* ---------- Upload ---------- */
  const processImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setToast({ type: "error", message: "Envie apenas arquivos de imagem." });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ type: "error", message: "A imagem deve ter no máximo 5MB." });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageChange = (e) => processImageFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processImageFile(e.dataTransfer.files?.[0]);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ---------- Criar ---------- */
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setIsSubmitting(true);
    try {
      const token =
        localStorage.getItem("access_token") || localStorage.getItem("token");
      const formData = new FormData();
      formData.append("title", newTitle.trim());
      formData.append("content", newContent.trim());
      if (imageFile) formData.append("image", imageFile);

      const response = await fetch(`${baseUrl}/api/canal_comunicacao/`, {
        method: "POST",
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });

      if (response.ok) {
        setNewTitle("");
        setNewContent("");
        clearImage();
        setIsModalOpen(false);
        setToast({ type: "success", message: "Aviso publicado com sucesso!" });
        fetchPosts();
      } else {
        throw new Error("Erro no servidor");
      }
    } catch (error) {
      console.error("Erro ao criar aviso:", error);
      setToast({ type: "error", message: "Falha ao publicar o aviso." });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ---------- Excluir ---------- */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const token =
        localStorage.getItem("access_token") || localStorage.getItem("token");
      const response = await fetch(
        `${baseUrl}/api/canal_comunicacao/${deleteTarget.id}/`,
        {
          method: "DELETE",
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        },
      );
      if (!response.ok) throw new Error();
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setToast({ type: "success", message: "Aviso removido." });
      setDeleteTarget(null);
    } catch {
      setToast({ type: "error", message: "Não foi possível excluir o aviso." });
    } finally {
      setIsDeleting(false);
    }
  };

  /* ---------- Datas ---------- */
  const parseDate = (date, time) => {
    if (!date || !time) return null;
    try {
      const timeClean = time.split(".")[0];
      return new Date(`${date}T${timeClean}`);
    } catch {
      return null;
    }
  };

  const formatarDataAbsoluta = (date, time) => {
    const d = parseDate(date, time);
    if (!d) return "";
    return format(d, "dd 'de' MMMM, yyyy 'às' HH:mm", { locale: ptBR });
  };

  const formatarDataRelativa = (date, time) => {
    const d = parseDate(date, time);
    if (!d) return "";
    try {
      return formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
    } catch {
      return "";
    }
  };

  const tempoLeitura = (text = "") => {
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  /* ---------- Filtro ---------- */
  const filteredPosts = posts.filter((p) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      p.title?.toLowerCase().includes(q) ||
      p.content?.toLowerCase().includes(q) ||
      p.author?.toLowerCase().includes(q)
    );
  });

  /* ---------- Render ---------- */
  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-800 relative">
      <Helmet>
        <title>Canal de Comunicação - Novidades</title>
        <meta
          name="description"
          content="Acompanhe os avisos oficiais e atualizações da equipe de Vigilância Epidemiológica."
        />
      </Helmet>

      {isPrivateView ? (
        <SidebarPrivate
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      ) : (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col h-full w-full overflow-y-auto overflow-x-hidden ml-0 md:ml-[var(--sidebar-width,16rem)] transition-all duration-300">
        {/* HEADER */}
        <header className="px-3 sm:px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-30 bg-gradient-to-br from-[#4180ab] to-[#054060] backdrop-blur-md shadow-sm border-b border-white/10">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden shrink-0 group p-2 text-white bg-white/10 rounded-xl hover:bg-white/20 border border-transparent hover:border-white/10 transition-all cursor-pointer"
              aria-label="Abrir menu"
            >
              <Menu className="size-5 sm:size-6 group-hover:scale-110 transition-transform" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <Megaphone className="size-5 md:size-6 text-white shrink-0" />
              <h2 className="text-sm sm:text-base md:text-xl font-bold tracking-wide text-white truncate">
                Canal de Comunicação
              </h2>
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <main className="p-4 md:p-8 space-y-6 w-full max-w-4xl mx-auto overflow-x-hidden animate-in fade-in duration-500 pb-24">
          {/* HERO */}
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-slate-50 border border-slate-200 shadow-sm p-6 md:p-8">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#4180ab]/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative flex items-start gap-3 mb-2">
              <div className="p-2 rounded-xl bg-[#4180ab]/10 text-[#4180ab] shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">Novidades</h1>
                <p className="text-slate-500 mt-1 text-sm md:text-base">
                  Acompanhe os avisos oficiais e atualizações da equipe de
                  Vigilância Epidemiológica.
                </p>
              </div>
            </div>
            <div className="relative flex flex-wrap items-center gap-3 mt-5">
              <a
                href="https://whatsapp.com/channel/0029Vb9PV8gDeON9oUd0uF2o"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
              >
                <img src={WhatsappSvg} alt="" className="w-5 h-5" />
                Entrar no Canal de Comunicação
              </a>
              {posts.length > 0 && (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-2 rounded-xl">
                  <MessageCircle className="w-4 h-4" />
                  {posts.length} {posts.length === 1 ? "aviso" : "avisos"}{" "}
                  publicados
                </span>
              )}
            </div>
          </section>

          {/* BUSCA */}
          {posts.length > 0 && (
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Buscar avisos por título, conteúdo ou autor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-10 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4180ab]/30 focus:border-[#4180ab] transition-all shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
                  aria-label="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* LISTA */}
          {loading ? (
            <div className="grid gap-6">
              <PostSkeleton />
              <PostSkeleton />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Megaphone className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                Nenhum aviso publicado
              </h3>
              <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto px-4">
                Assim que novos avisos oficiais forem publicados, eles
                aparecerão aqui.
              </p>
              {isAdmin && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-[#4180ab] hover:bg-[#054060] text-white text-sm font-bold rounded-xl shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Criar primeiro aviso
                </button>
              )}
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700">
                Nenhum resultado encontrado
              </h3>
              <p className="text-slate-500 text-sm mt-1">
                Tente ajustar os termos de busca.
              </p>
              <button
                onClick={() => setSearchTerm("")}
                className="mt-5 text-sm font-bold text-[#4180ab] hover:text-[#054060] underline-offset-4 hover:underline"
              >
                Limpar busca
              </button>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredPosts.map((post) => (
                <article
                  key={post.id}
                  className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:border-[#4180ab]/30 transition-all duration-300 flex flex-col group"
                >
                  {/* IMAGEM */}
                  {post.image && !brokenImages[post.id] && (
                    <div
                      onClick={() => setExpandedImage(post.image)}
                      className="relative w-full max-h-[500px] bg-slate-900/5 flex items-center justify-center border-b border-slate-100 overflow-hidden cursor-zoom-in group/image"
                    >
                      <img
                        src={post.image}
                        alt={post.title}
                        onError={() =>
                          setBrokenImages((prev) => ({
                            ...prev,
                            [post.id]: true,
                          }))
                        }
                        className="w-full h-auto max-h-[500px] object-contain transition-transform duration-500 group-hover/image:scale-[1.03]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-3 py-2 rounded-full opacity-0 group-hover/image:opacity-100 transition-all duration-300 scale-90 group-hover/image:scale-100">
                          <ZoomIn className="w-4 h-4" />
                          Clique para ampliar
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="p-6 md:p-8 flex flex-col flex-1">
                    {/* META */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                        <span className="w-2 h-2 rounded-full bg-[#4180ab] animate-pulse" />
                        <span className="text-xs font-bold text-[#054060] uppercase tracking-wider">
                          Aviso Oficial
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <time
                          className="text-xs text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full flex items-center gap-1"
                          title={formatarDataAbsoluta(post.date, post.time)}
                        >
                          <Clock className="w-3 h-3" />
                          {formatarDataRelativa(post.date, post.time)}
                        </time>
                        <span className="hidden sm:inline-flex items-center text-xs text-slate-400 font-medium">
                          {tempoLeitura(post.content)} min de leitura
                        </span>
                      </div>
                    </div>

                    {/* CONTEÚDO */}
                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-3 break-words group-hover:text-[#054060] transition-colors">
                      {post.title}
                    </h2>
                    <div className="text-slate-600 leading-relaxed whitespace-pre-wrap break-words flex-1">
                      {post.content}
                    </div>

                    {/* RODAPÉ */}
                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-full bg-[#4180ab]/10 flex items-center justify-center border border-[#4180ab]/20 text-[#4180ab] font-bold shadow-sm shrink-0">
                          {post.author ? (
                            post.author.charAt(0).toUpperCase()
                          ) : (
                            <UserCircle className="w-6 h-6" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {post.author || "Administração"}
                          </p>
                          <p className="text-xs text-slate-500 font-medium truncate">
                            Equipe de Comunicação
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <CheckCircle2
                          className="w-5 h-5 text-emerald-500"
                          aria-label="Mensagem verificada"
                        />
                        {isAdmin && (
                          <button
                            onClick={() => setDeleteTarget(post)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            aria-label="Excluir aviso"
                            title="Excluir aviso"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* FAB */}
      {isAdmin && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 bg-[#4180ab] hover:bg-[#054060] text-white p-4 rounded-full shadow-lg shadow-[#4180ab]/40 transition-all duration-300 hover:scale-110 z-40 cursor-pointer flex items-center justify-center group"
          title="Criar novo aviso"
          aria-label="Criar novo aviso"
        >
          <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
          <span className="absolute right-full mr-3 whitespace-nowrap bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
            Novo aviso
          </span>
        </button>
      )}

      {/* MODAL CRIAR */}
      {isAdmin && isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Novo comunicado"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => !isSubmitting && setIsModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-slate-200"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-[#4180ab]" /> Novo Comunicado
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
                className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Fechar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreatePost}
              className="p-5 md:p-6 space-y-5 overflow-y-auto"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Título do Aviso
                  </label>
                  <span
                    className={`text-xs font-medium ${
                      newTitle.length > TITLE_MAX
                        ? "text-rose-500"
                        : "text-slate-400"
                    }`}
                  >
                    {newTitle.length}/{TITLE_MAX}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="Ex: Atualização no Calendário Vacinal"
                  maxLength={TITLE_MAX}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4180ab]/50 focus:border-[#4180ab] transition-all"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold text-slate-700">
                    Conteúdo
                  </label>
                  <span
                    className={`text-xs font-medium ${
                      newContent.length > CONTENT_MAX
                        ? "text-rose-500"
                        : "text-slate-400"
                    }`}
                  >
                    {newContent.length}/{CONTENT_MAX}
                  </span>
                </div>
                <textarea
                  placeholder="Escreva os detalhes do aviso aqui..."
                  maxLength={CONTENT_MAX}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#4180ab]/50 focus:border-[#4180ab] transition-all"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  required
                />
              </div>

              {/* UPLOAD */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Imagem de Capa{" "}
                  <span className="font-normal text-slate-400">(Opcional)</span>
                </label>

                {!imagePreview ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                      isDragging
                        ? "border-[#4180ab] bg-blue-50 text-[#4180ab] scale-[1.01]"
                        : "border-slate-300 hover:border-[#4180ab] bg-slate-50 hover:bg-blue-50/50 text-slate-500 hover:text-[#4180ab]"
                    }`}
                  >
                    <ImageIcon className="w-8 h-8" />
                    <span className="text-sm font-semibold">
                      {isDragging
                        ? "Solte a imagem aqui"
                        : "Clique ou arraste uma imagem"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      JPG, PNG ou WEBP · máx. 5MB
                    </span>
                  </button>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 group bg-slate-100 flex items-center justify-center max-h-48">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-auto max-h-48 object-contain"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        type="button"
                        onClick={clearImage}
                        className="bg-rose-500 hover:bg-rose-600 text-white p-2.5 rounded-full transition-colors cursor-pointer shadow-lg hover:scale-105"
                        title="Remover imagem"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <div className="pt-5 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={
                    isSubmitting || !newTitle.trim() || !newContent.trim()
                  }
                  className="flex items-center gap-2 bg-[#4180ab] hover:bg-[#054060] text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-[#4180ab]/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Publicando...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Publicar Aviso
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMAR EXCLUSÃO */}
      {deleteTarget && (
        <ConfirmDialog
          title="Excluir aviso?"
          description={`"${deleteTarget.title}" será removido permanentemente. Essa ação não pode ser desfeita.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          isLoading={isDeleting}
        />
      )}

      {/* LIGHTBOX */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 sm:p-8 backdrop-blur-sm animate-in fade-in duration-200 cursor-zoom-out"
          onClick={() => setExpandedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Imagem ampliada"
        >
          <button
            onClick={() => setExpandedImage(null)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all duration-200 z-10"
            aria-label="Fechar imagem"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={expandedImage}
            alt="Imagem expandida"
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
